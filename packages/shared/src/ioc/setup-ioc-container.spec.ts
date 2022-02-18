// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';
import { reporterFactory } from 'accessibility-insights-report';
import express from 'express';
import getPort from 'get-port';
import { Container } from 'inversify';
import serveStatic from 'serve-static';
import { Logger } from '../logger/logger';
import { Scanner } from '../scanner/scanner';
import { iocTypes } from './ioc-types';
import { setupSharedIocContainer, setupIocContainer } from './setup-ioc-container';
import { TaskConfig } from '../task-config';
import { ProgressReporter } from '../progress-reporter/progress-reporter';
import { OutputFormatter, ResultOutputBuilder } from '..';
import { IMock, Mock } from 'typemoq';

describe(setupSharedIocContainer, () => {
    let testSubject: Container;
    let outputFormatterMock: IMock<OutputFormatter>;

    beforeEach(() => {
        testSubject = setupIocContainer();
    });

    test.each([Scanner, Logger])('verify singleton resolution %p', (key: any) => {
        verifySingletonDependencyResolution(testSubject, key);
    });
    test.each([
        { key: iocTypes.Console, value: console },
        { key: iocTypes.Process, value: process },
        { key: iocTypes.GetPort, value: getPort },
        { key: iocTypes.Express, value: express },
        { key: iocTypes.ServeStatic, value: serveStatic },
        { key: iocTypes.ReportFactory, value: reporterFactory },
        { key: iocTypes.TaskConfig, value: TaskConfig },
        { key: iocTypes.ProgressReporters, value: [ProgressReporter] },
    ])('verify constant value resolution %s', (pair: { key: string; value: any }) => {
        expect(testSubject.get(pair.key)).toEqual(pair.value);
    });

    test('verify factory resolution for ResultOutputBuilderFactory', () => {
        outputFormatterMock = Mock.ofType<OutputFormatter>();
        expect(testSubject.get(iocTypes.ResultOutputBuilderFactory)).toBeInstanceOf(Function);
        const resultOutputFactory: (outputFormatter: OutputFormatter) => ResultOutputBuilder = testSubject.get(
            iocTypes.ResultOutputBuilderFactory,
        );
        expect(resultOutputFactory(outputFormatterMock.object)).toBeInstanceOf(ResultOutputBuilder);
    });

    function verifySingletonDependencyResolution(container: Container, key: any): void {
        expect(container.get(key)).toBeDefined();
        expect(container.get(key)).toBe(container.get(key));
    }
});
