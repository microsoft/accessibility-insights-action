// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as actionCore from '@actions/core';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';
import * as process from 'process';
import { iocTypes } from './ioc/ioc-types';

@injectable()
export class TaskConfig {
    constructor(@inject(iocTypes.Process) private readonly processObj: typeof process, private readonly actionCoreObj = actionCore) {}

    public getReportOutDir(): string {
        return this.actionCoreObj.getInput('output-dir');
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
        chromePath = this.actionCoreObj.getInput('chrome-path');

        if (isEmpty(chromePath)) {
            chromePath = process.env.CHROME_BIN;
        }

        return chromePath;
    }

    public getUrl(): string {
        return this.actionCoreObj.getInput('url');
    }

    public getRunId(): number {
        return parseInt(this.processObj.env.GITHUB_RUN_ID, 10);
    }
}
