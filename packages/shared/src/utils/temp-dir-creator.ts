// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as fs from 'fs';
import * as path from 'path';
import { injectable, inject, optional } from 'inversify';

@injectable()
export class TempDirCreator {
    constructor(
        @optional() @inject('fsObj') private readonly fsObj: typeof fs = fs,
        private readonly pathObj: typeof path = path,
    ) {}

    public createTempDirSync(baseTempDir?: string): string {
        const prefix = `${baseTempDir}${this.pathObj.sep}accessibility-insights-action-`;
        return this.fsObj.mkdtempSync(prefix);
    }
}
