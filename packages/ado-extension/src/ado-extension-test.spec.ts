// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { runScan } from './ado-extension';
import * as adoTask from 'azure-pipelines-task-lib/task';
import { Logger, Scanner } from '@accessibility-insights-action/shared';
import * as inversify from 'inversify';

let scanResponse: Promise<any>;

jest.mock('./ioc/setup-ioc-container', mockContainer);
jest.mock('azure-pipelines-task-lib/task');

describe('runScan', () => {
    const errorMessage = 'Scan timed out';
    it.each`
        scanResult | expectedCode                    | expectedMessage
        ${true}    | ${adoTask.TaskResult.Succeeded} | ${'Scan completed successfully'}
        ${false}   | ${adoTask.TaskResult.Failed}    | ${errorMessage}
    `(`show '$expectedMessage' when scan returns '$scanResult'`, async ({ scanResult, expectedCode, expectedMessage }) => {
        scanResponse = Promise.resolve(scanResult);
        if (scanResult === false) jest.spyOn(Logger.prototype, 'getAllErrors').mockReturnValueOnce(errorMessage);
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

function mockContainer() {
    return {
        setupIocContainer: jest.fn().mockImplementation(() => {
            return {
                get: mockContainerGet,
            };
        }),
    };
}

// Mock get(Scanner), but leave other values like get(Logger) intact
function mockContainerGet(serviceIdentifier: inversify.interfaces.ServiceIdentifier<Scanner | Logger>): { scan: jest.Mock } | Logger {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const originalModule = jest.requireActual('./ioc/setup-ioc-container');

    if (serviceIdentifier === Scanner) {
        return {
            scan: jest.fn().mockImplementationOnce(() => scanResponse),
        };
    } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
        return originalModule.setupIocContainer().get(serviceIdentifier);
    }
}
