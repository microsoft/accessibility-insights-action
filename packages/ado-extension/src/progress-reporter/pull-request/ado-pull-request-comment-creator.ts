// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdoIocTypes } from '../../ioc/ado-ioc-types';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { inject, injectable } from 'inversify';
import { Logger } from '@accessibility-insights-action/shared';
import { ReportMarkdownConvertor } from '@accessibility-insights-action/shared';
import { productTitle, ProgressReporter } from '@accessibility-insights-action/shared';
import { CombinedReportParameters } from 'accessibility-insights-report';
import * as AdoTask from 'azure-pipelines-task-lib/task';
import * as NodeApi from 'azure-devops-node-api';
import * as GitApi from 'azure-devops-node-api/GitApi';
import * as GitInterfaces from 'azure-devops-node-api/interfaces/GitInterfaces';
import * as VsoBaseInterfaces from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';

@injectable()
export class AdoPullRequestCommentCreator extends ProgressReporter {
    private connection: NodeApi.WebApi;

    constructor(
        @inject(ADOTaskConfig) private readonly adoTaskConfig: ADOTaskConfig,
        @inject(ReportMarkdownConvertor) private readonly reportMarkdownConvertor: ReportMarkdownConvertor,
        @inject(Logger) private readonly logger: Logger,
        @inject(AdoIocTypes.AdoTask) private readonly adoTask: typeof AdoTask,
        @inject(AdoIocTypes.NodeApi) private readonly nodeApi: typeof NodeApi,
    ) {
        super();
        if (!this.isSupported()) {
            return;
        }

        const authHandler = this.getAuthHandler();
        const url = this.getVariableOrThrow('System.TeamFoundationCollectionUri');
        this.connection = new nodeApi.WebApi(url, authHandler);
    }

    private getAuthHandler(): VsoBaseInterfaces.IRequestHandler {
        const serviceConnectionName = this.adoTaskConfig.getRepoServiceConnectionName();

        if (serviceConnectionName !== undefined && serviceConnectionName?.length > 0) {
            return this.getAuthHandlerForServiceConnection(serviceConnectionName);
        } else {
            // falling back to build agent default creds. Will throw if no creds found
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const token = this.adoTask.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false)!;
            console.log('Could not find a service connection passed in by the user. Trying to use default build agent creds');
            return this.nodeApi.getPersonalAccessTokenHandler(token);
        }
    }

    private getAuthHandlerForServiceConnection(serviceConnectionName: string): VsoBaseInterfaces.IRequestHandler {
        // Will throw if no creds found
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const endpointAuth = this.adoTask.getEndpointAuthorization(serviceConnectionName, false)!;
        let token: string, username: string, password: string;
        const authScheme = this.adoTask.getEndpointAuthorizationScheme(serviceConnectionName, true);

        switch (authScheme) {
            case 'token':
                token = endpointAuth.parameters['apitoken'];
                console.log('Using token provided by service connection passed in by user');
                return this.nodeApi.getPersonalAccessTokenHandler(token);
            case 'usernamepassword':
                username = endpointAuth.parameters['username'];
                password = endpointAuth.parameters['password'];
                console.log('Using credentials provided by service connection passed in by user');
                return this.nodeApi.getBasicHandler(username, password);
            default:
                // we only expect basic or token auth:
                // https://docs.microsoft.com/en-us/azure/devops/pipelines/library/service-endpoints?view=azure-devops&tabs=yaml#azure-repos
                throw 'Unsupported auth scheme. Please use token or basic auth.';
        }
    }

    private getVariableOrThrow(variableName: string): string {
        const potentialVariable = this.adoTask.getVariable(variableName);
        if (potentialVariable === undefined) {
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
        const existingThread = prThreads.find((p) => p.comments?.some((c) => c.content?.includes(productTitle())));
        const existingComment = existingThread?.comments?.find((c) => c.content?.includes(productTitle()));
        const newComment = {
            parentCommentId: 0,
            content: reportMarkdown,
            commentType: GitInterfaces.CommentType.Text,
        };

        if (existingThread === undefined || existingThread.id === undefined || existingComment?.id === undefined) {
            this.logMessage(`Didn't find an existing thread, making a new thread`);
            await gitApiObject.createThread(
                {
                    comments: [newComment],
                    status: GitInterfaces.CommentThreadStatus.Active,
                },
                repoId,
                prId,
            );
        } else {
            this.logMessage(`Already found a thread from us`);
            await gitApiObject.updateComment(newComment, repoId, prId, existingThread.id, existingComment.id);
            await gitApiObject.createComment(
                {
                    parentCommentId: 0,
                    content: 'Ran again, results comment updated',
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
