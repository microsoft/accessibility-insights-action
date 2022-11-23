// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, Mock, Times } from 'typemoq';
import { ErrorSender, TelemetryErrorCollector } from './telemetry-error-collector';

describe(TelemetryErrorCollector, () => {
    let listMock: IMock<string[]>;
    let errorSenderMock: IMock<ErrorSender>;
    let telemetryErrorCollector: TelemetryErrorCollector;

    beforeEach(() => {
        listMock = Mock.ofType<string[]>();
        errorSenderMock = Mock.ofType<ErrorSender>();
        telemetryErrorCollector = new TelemetryErrorCollector(errorSenderMock.object);
    });
    describe('constructor', () => {
        it('initialize', () => {
            telemetryErrorCollector = buildTelemetryErrorCollectorWithMocks();
        });
    });

    describe('errorList', () => {
        it('Does nothing if try to clean empty error list', () => {
            telemetryErrorCollector.cleanErrorList();
            setUpPop();
            //expect(telemetryErrorCollector.errorList.pop()).toBeCalledTimes(0);
        });
    });

    const buildTelemetryErrorCollectorWithMocks = () => new TelemetryErrorCollector(errorSenderMock.object);

    const setUpPop = () => {
        listMock.setup((o) => o.pop()).verifiable(Times.never());
    };
});
