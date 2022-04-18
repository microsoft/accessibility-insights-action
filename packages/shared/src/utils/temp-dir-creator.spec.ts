// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import type * as fs from 'fs';
import type * as path from 'path';
import { IMock, Mock, It } from 'typemoq';

import { TempDirCreator } from './temp-dir-creator';

describe(TempDirCreator, () => {
    describe('createTempDirSync', () => {
        const stubPath = { sep: 'SEP' } as typeof path;
        let mockFs: IMock<typeof fs>;
        let testSubject: TempDirCreator;

        beforeEach(() => {
            mockFs = Mock.ofType<typeof fs>();
            testSubject = new TempDirCreator(mockFs.object, stubPath);
        });

        it('passes through to the expected fs and path APIs', () => {
            const baseTempDir = '/base/temp/dir';
            const expectedmkdtempSyncInput = '/base/temp/dirSEPaccessibility-insights-action-';
            const mkdtempSyncOutput = 'mkdtempSyncOutput';
            mockFs.setup((m) => m.mkdtempSync(expectedmkdtempSyncInput)).returns(() => mkdtempSyncOutput);

            const output = testSubject.createTempDirSync(baseTempDir);

            expect(output).toBe(mkdtempSyncOutput);
            mockFs.verifyAll();
        });

        it('propagates exceptions from fs.mkdtempSync', () => {
            const mkdtempSyncError = new Error('from mkdtempSync');
            mockFs
                .setup((m) => m.mkdtempSync(It.isAny()))
                .throws(mkdtempSyncError)
                .verifiable();

            expect(() => testSubject.createTempDirSync('irrelevant')).toThrowError(mkdtempSyncError);

            mockFs.verifyAll();
        });
    });
});
