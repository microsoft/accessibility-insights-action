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
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { BaselineInfo } from '@accessibility-insights-action/shared';
import { WorkflowEnforcement } from '../enforcement/workflow-enforcement';

@injectable()
export class AdoPullRequestCommentCreator extends ProgressReporter {
    private connection: NodeApi.WebApi;
    public static readonly CURRENT_COMMENT_TITLE = 'Results from Current Run';
    public static readonly PREVIOUS_COMMENT_TITLE = 'Results from Previous Run';

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
        const authScheme = this.adoTask.getEndpointAuthorizationScheme(serviceConnectionName, true)?.toLowerCase();

        switch (authScheme) {
            case 'token': {
                const token = endpointAuth.parameters['apitoken'];
                console.log('Using token provided by service connection passed in by user');
                return this.nodeApi.getPersonalAccessTokenHandler(token);
            }
            case 'usernamepassword': {
                const username = endpointAuth.parameters['username'];
                const password = endpointAuth.parameters['password'];
                console.log('Using credentials provided by service connection passed in by user');
                return this.nodeApi.getBasicHandler(username, password);
            }
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

    public async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        if (!this.isSupported()) {
            return;
        }

        const reportMarkdown = this.reportMarkdownConvertor.convert(
            combinedReportResult,
            AdoPullRequestCommentCreator.CURRENT_COMMENT_TITLE,
            this.getBaselineInfo(baselineEvaluation),
        );
        this.traceMarkdown(reportMarkdown);

        const prId = parseInt(this.getVariableOrThrow('System.PullRequest.PullRequestId'));
        const repoId = this.getVariableOrThrow('Build.Repository.ID');
        this.logMessage(`PR is ${prId}, repo is ${repoId}`);

        const gitApiObject: GitApi.IGitApi = await this.connection.getGitApi();
        const prThreads = await gitApiObject.getThreads(repoId, prId);
        const existingThread = prThreads.find((p) => p.comments?.some((c) => c.content?.includes(productTitle())));
        const existingCurrentComment = existingThread?.comments?.find(
            (c) => c.content?.includes(productTitle()) && c.content?.includes(AdoPullRequestCommentCreator.CURRENT_COMMENT_TITLE),
        );
        const existingPreviousComment = existingThread?.comments?.find(
            (c) => c.content?.includes(productTitle()) && c.content?.includes(AdoPullRequestCommentCreator.PREVIOUS_COMMENT_TITLE),
        );
        const newCurrentComment = {
            parentCommentId: 0,
            content: reportMarkdown,
            commentType: GitInterfaces.CommentType.Text,
        };

        if (existingThread === undefined || existingThread.id === undefined || existingCurrentComment?.id === undefined) {
            this.logMessage(`Didn't find an existing thread, making a new thread`);
            await gitApiObject.createThread(
                {
                    comments: [newCurrentComment],
                    status: GitInterfaces.CommentThreadStatus.Active,
                },
                repoId,
                prId,
            );
        } else if (existingPreviousComment?.id === undefined) {
            this.logMessage(`Already found a thread from us, no previous runs`);
            await gitApiObject.updateComment(newCurrentComment, repoId, prId, existingThread.id, existingCurrentComment.id);
            await gitApiObject.createComment(
                {
                    parentCommentId: 0,
                    content: existingCurrentComment.content?.replace(
                        AdoPullRequestCommentCreator.CURRENT_COMMENT_TITLE,
                        AdoPullRequestCommentCreator.PREVIOUS_COMMENT_TITLE,
                    ),
                    commentType: GitInterfaces.CommentType.Text,
                },
                repoId,
                prId,
                existingThread.id,
            );
        } else {
            this.logMessage(`Already found a thread from us, found previous runs`);
            const newPreviousComment = {
                parentCommentId: existingPreviousComment.parentCommentId,
                content: existingCurrentComment.content?.replace(
                    AdoPullRequestCommentCreator.CURRENT_COMMENT_TITLE,
                    AdoPullRequestCommentCreator.PREVIOUS_COMMENT_TITLE,
                ),
                commentType: existingPreviousComment.commentType,
            };

            await gitApiObject.updateComment(newPreviousComment, repoId, prId, existingThread.id, existingPreviousComment.id);
            await gitApiObject.updateComment(newCurrentComment, repoId, prId, existingThread.id, existingCurrentComment.id);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async failRun(message: string): Promise<void> {
        return Promise.resolve();
    }

    private getBaselineInfo(baselineEvaluation?: BaselineEvaluation): BaselineInfo {
        const baselineFileName = this.adoTaskConfig.getBaselineFile();

        if (!baselineFileName) {
            return {} as BaselineInfo;
        }

        return { baselineFileName, baselineEvaluation };
    }

    private isSupported(): boolean {
        return this.adoTask.getVariable('Build.Reason') == 'PullRequest';
    }

    private logMessage(message: string): void {
        this.logger.logInfo(`${message}`);
    }
}
