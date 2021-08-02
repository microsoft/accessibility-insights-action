// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as Axe from 'axe-core';
import { injectable } from 'inversify';

@injectable()
export class AxeInfo {
    constructor(private readonly axe: typeof Axe = Axe) {}

    public get version(): string {
        return this.axe.version;
    }
}
