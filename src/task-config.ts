// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as actionCore from '@actions/core';
import { inject, injectable } from 'inversify';
import * as path from 'path';
import * as process from 'process';
import { iocTypes } from './ioc/ioc-types';

@injectable()
export class TaskConfig {
    constructor(@inject(iocTypes.Process) private readonly processObj: typeof process, private readonly actionCoreObj = actionCore) {}

    public getReportOutDir(): string {
        return path.join(this.processObj.env.GITHUB_WORKSPACE, '_accessibility-reports');
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
        return this.actionCoreObj.getInput('chrome-path');
    }

    public getRunId(): number {
        return parseInt(this.processObj.env.GITHUB_RUN_ID, 10);
    }
}
