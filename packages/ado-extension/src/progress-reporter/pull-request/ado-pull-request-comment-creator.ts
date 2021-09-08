// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdoIocTypes } from '../../ioc/ado-ioc-types';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { inject, injectable } from 'inversify';
import { Logger } from '@accessibility-insights-action/shared';
import { ReportMarkdownConvertor } from '@accessibility-insights-action/shared';
import { ProgressReporter } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import * as AdoTask from 'azure-pipelines-task-lib/task';
import * as NodeApi from 'azure-devops-node-api';
import * as GitApi from 'azure-devops-node-api/GitApi';
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';

@injectable()
export class AdoPullRequestCommentCreator extends ProgressReporter {
    private connection: NodeApi.WebApi;

    constructor(
        @inject(ADOTaskConfig) private readonly adoTaskConfig: ADOTaskConfig,
        @inject(ReportMarkdownConvertor) private readonly reportMarkdownConvertor: ReportMarkdownConvertor,
        @inject(Logger) private readonly logger: Logger,
        @inject(AdoIocTypes.AdoTask) private readonly adoTask: typeof AdoTask,
        @inject(AdoIocTypes.NodeApi) nodeApi: typeof NodeApi,
    ) {
        super();
        if (!this.isSupported()) {
            return;
        }

        let token: string;

        const serviceConnectionName = adoTaskConfig.getRepoServiceConnectionName();
        if (serviceConnectionName !== undefined && serviceConnectionName?.length > 0) {
            // Will throw if no creds found
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const userProvidedServiceConnection = adoTask.getEndpointAuthorization(serviceConnectionName, false)!;

            // We should check the different schemes supported and access the appropriate params. Here we assume it's Token-based
            // https://docs.microsoft.com/en-us/azure/devops/extend/develop/auth-schemes?view=azure-devops
            token = userProvidedServiceConnection.parameters['apitoken'];
            console.log('Using token provided by service connection passed in by user');
        } else {
            // falling back to build agent default creds. Will throw if no creds found
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            token = adoTask.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false)!;
            console.log('Could not find a service connection passed in by the user. Trying to use default build agent creds');
        }

        const authHandler = nodeApi.getPersonalAccessTokenHandler(token);
        const url = this.getVariableOrThrow('System.TeamFoundationCollectionUri');
        this.connection = new nodeApi.WebApi(url, authHandler);
    }

    private getVariableOrThrow(variableName: string): string {
        const potentialVariable = this.adoTask.getVariable(variableName);
        if (potentialVariable === undefined)
        {
            throw `Unable to find ${variableName}`;
        }
        return potentialVariable;
    }

    public async start(): Promise<void> {
        // We don't do anything for pull request flow
    }

    public async completeRun(combinedReportResult: CombinedReportParameters): Promise<void> {
        if (!this.isSupported()) {
            return;
        }

        const reportMarkdown = this.reportMarkdownConvertor.convert(combinedReportResult);
        this.traceMarkdown(reportMarkdown);

        const prId = parseInt(this.getVariableOrThrow('System.PullRequest.PullRequestId'));
        const repoId = this.getVariableOrThrow('Build.Repository.ID');
        this.logMessage(`PR is ${prId}, repo is ${repoId}`);

        const gitApiObject: GitApi.IGitApi = await this.connection.getGitApi();
        const prThreads = await gitApiObject.getThreads(repoId, prId);
        const existingThread = prThreads.find((p) => p.comments?.some((c) => c.content?.includes('Accessibility Insights')));
        if (existingThread === undefined || existingThread.id === undefined) {
            this.logMessage(`Didn't find an existing thread, making a new thread`);
            await gitApiObject.createThread(
                {
                    comments: [
                        {
                            parentCommentId: 0,
                            content: reportMarkdown,
                            commentType: GitInterfaces.CommentType.Text,
                        },
                    ],
                    status: GitInterfaces.CommentThreadStatus.Active,
                },
                repoId,
                prId,
            );
        } else {
            this.logMessage(`Already found a thread from us`);
            await gitApiObject.createComment(
                {
                    parentCommentId: 0,
                    content: 'Ran again', // TODO: maybe edit parent comment with markdown?
                    commentType: GitInterfaces.CommentType.Text,
                },
                repoId,
                prId,
                existingThread.id,
            );
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async failRun(message: string): Promise<void> {
        if (!this.isSupported()) {
            return;
        }

        throw message;
    }

    private isSupported(): boolean {
        return this.adoTask.getVariable('Build.Reason') == 'PullRequest';
    }

    private logMessage(message: string): void {
        this.logger.logInfo(`${message}`);
    }
}
