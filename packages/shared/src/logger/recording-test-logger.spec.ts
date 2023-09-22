// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { LogLevel } from './log-level';
import { RecordingTestLogger } from './recording-test-logger';

describe(RecordingTestLogger, () => {
    it('records different log calls in order with readable snapshotting', () => {
        const testSubject = new RecordingTestLogger();
        testSubject.log('message 1 (info)', LogLevel.info);
        testSubject.logDebug('message 2 (debug)');
        testSubject.logInfo('message 3 (info)');
        testSubject.logInfo('message 4 (info w/props)', { key: 'val' });
        testSubject.trackException(new Error('message 5 (exception)'));
        testSubject.trackExceptionAny('error', 'message 6 (exceptionAny)');
        testSubject.logWarning('message 7 (warning)');
        testSubject.logError('message 8 (error)');
        testSubject.logStartGroup('message 9 (start group)');
        testSubject.logEndGroup();

        expect(testSubject.recordedLogs()).toMatchSnapshot();
    });
});
