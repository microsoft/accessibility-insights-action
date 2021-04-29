// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { AxeInfo } from './axe-info';

const VERSION = 'axe.core.version';

describe(AxeInfo, () => {
    const axe = { version: VERSION };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const axeInfo = new AxeInfo(axe as any);

    it('has a default', () => {
        expect(axeInfo).not.toBe(undefined);
    });

    it('returns correct version', () => {
        expect(axeInfo.version).toBe(VERSION);
    });
});