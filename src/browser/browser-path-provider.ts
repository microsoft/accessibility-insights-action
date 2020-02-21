// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import * as os from 'os';
import * as path from 'path';
import { iocTypes } from '../ioc/ioc-types';
import { Logger } from '../logger/logger';

@injectable()
export class BrowserPathProvider {
    constructor(
        @inject(Logger) private readonly logger: Logger,
        @inject(iocTypes.Process) private readonly proccessObj: typeof process,
        private readonly osObj = os,
    ) {}

    public getChromePath(): string {
        const osType = this.osObj.type();
        let browserPath: string;

        if (osType === 'Windows_NT') {
            const programFilesPath =
                this.osObj.arch() === 'x64' ? this.proccessObj.env['PROGRAMFILES(X86)'] : this.proccessObj.env.PROGRAMFILES;
            browserPath = path.join(programFilesPath, 'Google/Chrome/Application/chrome.exe');
        } else if (osType === 'Linux') {
            browserPath = '/usr/bin/google-chrome';
        } else {
            this.logger.logError(`OS ${osType} is not supported`);
            throw new Error(`OS ${osType} is not supported`);
        }

        return browserPath;
    }
}
