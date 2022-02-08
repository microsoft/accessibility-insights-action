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
import * as VsoBaseInterfaces from 'azure-devops-node-api/interfaces/common/VsoBaseInterfaces';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { BaselineInfo } from '@accessibility-insights-action/shared';

@injectable()
export class AdoConsoleCommentCreator extends ProgressReporter {
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
        const reportMarkdown = this.reportMarkdownConvertor.convert(
            combinedReportResult,
            AdoConsoleCommentCreator.CURRENT_COMMENT_TITLE,
            this.getBaselineInfo(baselineEvaluation),
        );
        this.logMessage(reportMarkdown);

        return Promise.resolve();
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async failRun(message: string): Promise<void> {
        // This gets handled in the WorkflowEnforcer
    }

    private getBaselineInfo(baselineEvaluation?: BaselineEvaluation): BaselineInfo {
        const baselineFileName = this.adoTaskConfig.getBaselineFile();

        if (!baselineFileName) {
            return {} as BaselineInfo;
        }

        return { baselineFileName, baselineEvaluation };
    }

    private logMessage(message: string): void {
        this.logger.logInfo(`${message}`);
    }
}
