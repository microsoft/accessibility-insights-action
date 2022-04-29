// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as actionCore from '@actions/core';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';
import * as process from 'process';
import { iocTypes, TaskConfig, TaskInputKey } from '@accessibility-insights-action/shared';
import normalizePath from 'normalize-path';
import { resolve } from 'path';
@injectable()
export class GHTaskConfig extends TaskConfig {
    constructor(
        @inject(iocTypes.Process) protected readonly processObj: typeof process,
        private readonly actionCoreObj = actionCore,
        private readonly resolvePath: typeof resolve = resolve,
    ) {
        super(processObj);
    }

    public getReportOutDir(): string {
        // Relying on action.yml to make this required
        return this.getOptionalPathInput('output-dir');
    }

    public getStaticSiteDir(): string | undefined {
        return this.getOptionalPathInput('site-dir');
    }

    public getStaticSiteUrlRelativePath(): string | undefined {
        return this.getOptionalStringInput('scan-url-relative-path');
    }

    public getToken(): string {
        // Relying on action.yml to make this required
        return this.getOptionalStringInput('repo-token');
    }

    public getChromePath(): string | undefined {
        return this.getOptionalPathInput('chrome-path') ?? this.processObj.env.CHROME_BIN;
    }

    public getUrl(): string | undefined {
        return this.getOptionalStringInput('url');
    }

    public getMaxUrls(): number {
        // Relying on action.yml to provide a default if necessary
        return this.getOptionalIntInput('max-urls');
    }

    public getDiscoveryPatterns(): string | undefined {
        return this.getOptionalStringInput('discovery-patterns');
    }

    public getInputFile(): string | undefined {
        return this.getOptionalPathInput('input-file');
    }

    public getInputUrls(): string | undefined {
        return this.getOptionalStringInput('input-urls');
    }

    public getScanTimeout(): number {
        // Relying on action.yml to provide a default if necessary
        return this.getOptionalIntInput('scan-timeout');
    }

    public getStaticSitePort(): number | undefined {
        return this.getOptionalIntInput('localhost-port');
    }

    public getRunId(): number {
        return parseInt(this.processObj.env.GITHUB_RUN_ID, 10);
    }

    public getSingleWorker(): boolean {
        const value = this.actionCoreObj.getInput('single-worker');
        return isEmpty(value) || value.toLowerCase().trim() !== 'false' ? true : false;
    }

    public getBaselineFile(): string | undefined {
        return this.getOptionalPathInput('baseline-file');
    }

    public getHostingMode(): string | undefined {
        return this.getOptionalStringInput('hosting-mode');
    }

    public getInputName(key: TaskInputKey): string {
        const keyToName = {
            HostingMode: 'hosting-mode',
            StaticSiteDir: 'site-dir',
            StaticSiteUrlRelativePath: 'scan-url-relative-path',
            Url: 'url',
            StaticSitePort: 'localhost-port',
        };
        return keyToName[key];
    }

    public getUsageDocsUrl(): string {
        const url = 'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md';
        return url;
    }

    private getAbsolutePath(path: string | undefined): string | undefined {
        if (isEmpty(path)) {
            return undefined;
        }

        const dirname = this.processObj.env.GITHUB_WORKSPACE ?? __dirname;

        return normalizePath(this.resolvePath(dirname, normalizePath(path)));
    }

    private getOptionalPathInput(inputName: string): string | undefined {
        const rawValue = this.actionCoreObj.getInput(inputName);
        return this.getAbsolutePath(rawValue);
    }

    private getOptionalStringInput(inputName: string): string | undefined {
        const rawValue = this.actionCoreObj.getInput(inputName);
        return isEmpty(rawValue) ? undefined : rawValue;
    }

    private getOptionalIntInput(inputName: string): number | undefined {
        const rawValue = this.actionCoreObj.getInput(inputName);
        return isEmpty(rawValue) ? undefined : parseInt(rawValue, 10);
    }
}
