// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { runScan } from './ado-extension';
import * as adoTask from 'azure-pipelines-task-lib/task';

let scanResponse: Promise<any>;

jest.mock('./ioc/setup-ioc-container', () => ({
    setupIocContainer: jest.fn().mockImplementation(() => ({
        get: jest.fn().mockImplementation(() => ({
            setup: jest.fn().mockResolvedValue(undefined),
            scan: jest.fn().mockImplementationOnce(() => scanResponse),
        })),
    })),
}));

jest.mock('azure-pipelines-task-lib/task');

describe('runScan', () => {
    it.each`
        scanResult | expectedCode                    | expectedMessage
        ${true}    | ${adoTask.TaskResult.Succeeded} | ${'Scan completed successfully'}
        ${false}   | ${adoTask.TaskResult.Failed}    | ${'Scan completed with errors. To see all failures and scan details, visit the Extensions tab to download the accessibility report.'}
    `(`show '$expectedMessage' when scan returns '$scanResult'`, async ({ scanResult, expectedCode, expectedMessage }) => {
        scanResponse = Promise.resolve(scanResult);
        const setResultMock = jest.spyOn(adoTask, 'setResult');
        runScan();
        await flushPromises();
        expect(setResultMock).toBeCalledWith(expectedCode, expectedMessage);
    });

    it('show exception message when runScan experiences an error', async () => {
        scanResponse = Promise.reject(new Error('test error'));
        const setResultMock = jest.spyOn(adoTask, 'setResult');
        runScan();
        await flushPromises();
        expect(setResultMock).toBeCalledWith(adoTask.TaskResult.Failed, 'Exception thrown in extension: test error');
    });
});

// runScan is a synchronous function with a nested self-invoking async function,
// flushPromises waits for the async function to complete
function flushPromises() {
    return new Promise((resolve) => setImmediate(resolve));
}
