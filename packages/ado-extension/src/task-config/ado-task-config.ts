// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as adoTask from 'azure-pipelines-task-lib/task';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';
import * as process from 'process';
import { iocTypes, TaskConfig, TaskInputKey, TempDirCreator } from '@accessibility-insights-action/shared';
import normalizePath from 'normalize-path';
import { resolve } from 'path';

@injectable()
export class ADOTaskConfig extends TaskConfig {
    constructor(
        @inject(iocTypes.Process) protected readonly processObj: typeof process,
        @inject(TempDirCreator) private readonly tempDirCreator: TempDirCreator,
        private readonly adoTaskObj = adoTask,
        private readonly resolvePath: typeof resolve = resolve,
    ) {
        super(processObj);
    }

    // memoizing this is important to avoid generating multiple temp directories in the default case
    private memoizedReportOutDir: string | null = null;
    public getReportOutDir(): string {
        if (this.memoizedReportOutDir == null) {
            const customOutputDir = this.getAbsolutePath(this.adoTaskObj.getInput('outputDir'));

            this.memoizedReportOutDir = customOutputDir ?? this.tempDirCreator.createTempDirSync(this.getVariable('Agent.TempDirectory'));
        }

        return this.memoizedReportOutDir;
    }

    public getStaticSiteDir(): string | undefined {
        return this.adoTaskObj.getInput('staticSiteDir');
    }

    public getStaticSiteUrlRelativePath(): string | undefined {
        return this.adoTaskObj.getInput('staticSiteUrlRelativePath');
    }

    public getChromePath(): string | undefined {
        let chromePath = this.adoTaskObj.getInput('chromePath') || undefined;
        chromePath = this.getAbsolutePath(chromePath);

        if (isEmpty(chromePath)) {
            chromePath = this.processObj.env.CHROME_BIN;
        }

        return chromePath;
    }

    public getUrl(): string | undefined {
        const value = this.adoTaskObj.getInput('url');

        return isEmpty(value) ? undefined : value;
    }

    public getKeepUrlFragment(): boolean {
        return this.adoTaskObj.getBoolInput('keepUrlFragment');
    }

    public getHostingMode(): string | undefined {
        const value = this.adoTaskObj.getInput('hostingMode');

        return isEmpty(value) ? undefined : value;
    }

    public getMaxUrls(): number {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return parseInt(this.adoTaskObj.getInput('maxUrls')!);
    }

    public getDiscoveryPatterns(): string | undefined {
        const value = this.adoTaskObj.getInput('discoveryPatterns');

        return isEmpty(value) ? undefined : value;
    }

    public getInputFile(): string | undefined {
        return this.getAbsolutePath(this.adoTaskObj.getInput('inputFile') ?? undefined);
    }

    public getInputUrls(): string | undefined {
        const value = this.adoTaskObj.getInput('inputUrls');

        return isEmpty(value) ? undefined : value;
    }

    public getScanTimeout(): number {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return parseInt(this.adoTaskObj.getInput('scanTimeout')!);
    }

    public getStaticSitePort(): number | undefined {
        const value = this.adoTaskObj.getInput('staticSitePort');

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return isEmpty(value) ? undefined : parseInt(value!, 10);
    }

    public getRunId(): number | undefined {
        const value = this.processObj.env.BUILD_BUILDID;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return isEmpty(value) ? undefined : parseInt(value!, 10);
    }

    public getFailOnAccessibilityError(): boolean {
        return this.adoTaskObj.getBoolInput('failOnAccessibilityError');
    }

    public getSingleWorker(): boolean {
        return this.adoTaskObj.getBoolInput('singleWorker');
    }

    public getBaselineFile(): string | undefined {
        const value = this.getAbsolutePath(this.adoTaskObj.getInput('baselineFile'));

        return isEmpty(value) ? undefined : value;
    }

    public getCommitHash(): string | undefined {
        return this.processObj.env.BUILD_SOURCEVERSION ?? undefined;
    }

    public getCollectionUri(): string | undefined {
        return this.processObj.env.SYSTEM_COLLECTIONURI ?? undefined;
    }

    public getTeamProject(): string | undefined {
        return this.processObj.env.SYSTEM_TEAMPROJECT ?? undefined;
    }

    public getOutputArtifactName(): string {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.adoTaskObj.getInput('outputArtifactName')!;
    }

    public getUploadOutputArtifact(): boolean {
        return this.adoTaskObj.getBoolInput('uploadOutputArtifact');
    }

    // This allows us to pull in predefined Azure Pipelines variables listed here:
    // https://docs.microsoft.com/en-us/azure/devops/pipelines/build/variables?view=azure-devops&tabs=yaml
    // Note, these variables are not case-sensitive.
    public getVariable(definedVariableName: string): string | undefined {
        return this.adoTaskObj.getVariable(definedVariableName);
    }

    private getAbsolutePath(path: string | undefined): string | undefined {
        if (isEmpty(path)) {
            return undefined;
        }

        const dirname = this.processObj.env.SYSTEM_DEFAULTWORKINGDIRECTORY ?? __dirname;

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return normalizePath(this.resolvePath(dirname, normalizePath(path!)));
    }

    public getServiceAccountName(): string | undefined {
        return this.adoTaskObj.getInput('serviceAccountName');
    }

    public getServiceAccountPassword(): string | undefined {
        return this.adoTaskObj.getInput('serviceAccountPassword');
    }

    public getAuthType(): string | undefined {
        return this.adoTaskObj.getInput('authType');
    }

    public getSnapshot(): boolean {
        return this.adoTaskObj.getBoolInput('snapshot');
    }

    public getInputName(key: TaskInputKey): string {
        const keyToName = {
            HostingMode: 'hostingMode',
            StaticSiteDir: 'staticSiteDir',
            StaticSiteUrlRelativePath: 'staticSiteUrlRelativePath',
            Url: 'url',
            StaticSitePort: 'staticSitePort',
        };
        return keyToName[key];
    }

    public getUsageDocsUrl(): string {
        const url = 'https://aka.ms/ado-extension-usage';
        return url;
    }

    public getNPMRegistryUrl(): string | undefined {
        return this.adoTaskObj.getInput('npmRegistryUrl');
    }
}
