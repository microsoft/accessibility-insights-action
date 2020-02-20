// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';

@injectable()
export class PromiseUtils {
    public async waitFor<T, Y>(promise: Promise<T>, timeoutInMilliSec: number, onTimeoutCallback: () => Promise<Y>): Promise<T | Y> {
        let timeoutHandle: NodeJS.Timeout;
        let hasTimedOut = false;

        const timeoutPromise = new Promise<Y>((resolve, reject) => {
            timeoutHandle = setTimeout(() => {
                hasTimedOut = true;
                resolve();
            }, timeoutInMilliSec);
        });

        const racePromise = Promise.race([promise, timeoutPromise]);

        try {
            await racePromise;
        } finally {
            clearTimeout(timeoutHandle);
        }

        if (hasTimedOut) {
            return onTimeoutCallback();
        }

        return promise;
    }
}
