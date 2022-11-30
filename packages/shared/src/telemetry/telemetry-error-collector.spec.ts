// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, Mock } from 'typemoq';
import { ErrorSender, TelemetryErrorCollector } from './telemetry-error-collector';

describe(TelemetryErrorCollector, () => {
    let errorSenderMock: IMock<ErrorSender>;
    let telemetryErrorCollector: TelemetryErrorCollector;

    beforeEach(() => {
        errorSenderMock = Mock.ofType<ErrorSender>();
        telemetryErrorCollector = new TelemetryErrorCollector(errorSenderMock.object);
    });
    describe('constructor', () => {
        it('initialize', () => {
            telemetryErrorCollector = buildTelemetryErrorCollectorWithMocks();
        });
    });

    describe('cleanErrorList', () => {
        it('it cleans errorList while any data on it', () => {
            telemetryErrorCollector.errorReport.errorList = ['Error'];
            telemetryErrorCollector.cleanErrorList();

            expect(telemetryErrorCollector.errorReport.errorList.length).toBe(0);
        });

        it('does nothing if try to clean empty errorList', () => {
            const spy = jest.spyOn(telemetryErrorCollector.errorReport.errorList, 'pop');
            telemetryErrorCollector.cleanErrorList();
            expect(spy).not.toBeCalled();
        });
    });

    describe('collectError', () => {
        it('Adds new errors into errorList', () => {
            telemetryErrorCollector.errorReport.errorList = [];
            expect(telemetryErrorCollector.errorReport.errorList.length).toBe(0);
            telemetryErrorCollector.collectError('Error');
            expect(telemetryErrorCollector.errorReport.errorList.length).toBe(1);
        });
    });

    describe('returnErrorList', () => {
        it('it returns the correct list of errors while errors where added', () => {
            const errorObj = {
                sender: 'InputValidator',
                errorList: ['Error1', 'Error2'],
            };

            telemetryErrorCollector = new TelemetryErrorCollector('InputValidator');
            telemetryErrorCollector.collectError('Error1');
            telemetryErrorCollector.collectError('Error2');

            expect(telemetryErrorCollector.returnErrorList()).toEqual(errorObj);
        });

        it('it returns empty list of errors while errors where not added', () => {
            const errorList: any[] = [];
            const errorObj = {
                sender: 'InputValidator',
                errorList: errorList,
            };

            telemetryErrorCollector = new TelemetryErrorCollector('InputValidator');

            expect(telemetryErrorCollector.returnErrorList()).toEqual(errorObj);
        });
    });

    const buildTelemetryErrorCollectorWithMocks = () => new TelemetryErrorCollector(errorSenderMock.object);
});
