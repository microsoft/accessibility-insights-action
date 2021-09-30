// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as actionCore from '@actions/core';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';
import * as process from 'process';
import { iocTypes, TaskConfig } from '@accessibility-insights-action/shared';
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
        return this.getAbsolutePath(this.actionCoreObj.getInput('output-dir'));
    }

    public getSiteDir(): string {
        return this.actionCoreObj.getInput('site-dir');
    }

    public getScanUrlRelativePath(): string {
        return this.actionCoreObj.getInput('scan-url-relative-path');
    }

    public getToken(): string {
        return this.actionCoreObj.getInput('repo-token');
    }

    public getChromePath(): string {
        let chromePath;
        chromePath = this.getAbsolutePath(this.actionCoreObj.getInput('chrome-path'));

        if (isEmpty(chromePath)) {
            chromePath = this.processObj.env.CHROME_BIN;
        }

        return chromePath;
    }

    public getUrl(): string {
        return this.actionCoreObj.getInput('url');
    }

    public getMaxUrls(): number {
        return parseInt(this.actionCoreObj.getInput('max-urls'));
    }

    public getDiscoveryPatterns(): string {
        const value = this.actionCoreObj.getInput('discovery-patterns');

        return isEmpty(value) ? undefined : value;
    }

    public getInputFile(): string {
        return this.getAbsolutePath(this.actionCoreObj.getInput('input-file'));
    }

    public getInputUrls(): string {
        const value = this.actionCoreObj.getInput('input-urls');

        return isEmpty(value) ? undefined : value;
    }

    public getScanTimeout(): number {
        return parseInt(this.actionCoreObj.getInput('scan-timeout'));
    }

    public getLocalhostPort(): number {
        const value = this.actionCoreObj.getInput('localhost-port');

        return isEmpty(value) ? undefined : parseInt(value, 10);
    }

    public getRunId(): number {
        return parseInt(this.processObj.env.GITHUB_RUN_ID, 10);
    }

    public getBaseLine(): boolean {
        return this.actionCoreObj.getBooleanInput('base-line');
    }

    public getBaseLineFile(): string | undefined {
        const value = this.getAbsolutePath(this.actionCoreObj.getInput('base-line-file'));

        return isEmpty(value) ? undefined : value;
    }

    private getAbsolutePath(path: string): string {
        if (isEmpty(path)) {
            return undefined;
        }

        const dirname = this.processObj.env.GITHUB_WORKSPACE ?? __dirname;

        return normalizePath(this.resolvePath(dirname, normalizePath(path)));
    }
}
