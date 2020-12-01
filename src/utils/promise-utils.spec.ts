// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock } from 'typemoq';
import { PromiseUtils } from './promise-utils';

describe(PromiseUtils, () => {
    let promiseUtils: PromiseUtils;
    let waitOneSecond: Promise<string>;
    let errorHandleMock: IMock<() => null>;
    let onTimeoutCallback: () => Promise<string>;
    const resolvedMsg = 'waited for one second';
    const timedOutMsg = 'timed out';

    beforeEach(() => {
        promiseUtils = new PromiseUtils();
        errorHandleMock = Mock.ofInstance(() => {
            return null;
        });
        waitOneSecond = new Promise<string>((resolve) => {
            setTimeout(() => {
                resolve(resolvedMsg);
            }, 1000);
        });
        onTimeoutCallback = async () => {
            errorHandleMock.object();

            return Promise.resolve(timedOutMsg);
        };
    });

    describe('waitFor', () => {
        it('promise is resolved before timeout', async () => {
            const res = await promiseUtils.waitFor(waitOneSecond, 2000, null);

            expect(res).toBe(resolvedMsg);
        });

        it('promise timed out', async () => {
            errorHandleMock.setup((em) => em()).verifiable();

            const res = await promiseUtils.waitFor(waitOneSecond, 0, onTimeoutCallback);

            expect(res).toBe(timedOutMsg);
            errorHandleMock.verifyAll();
        });
    });
});
