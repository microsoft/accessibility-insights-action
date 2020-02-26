// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as github from '@actions/github';
import { Octokit } from '@octokit/rest';
import { reporterFactory } from 'accessibility-insights-report';
import * as express from 'express';
import * as getPort from 'get-port';
import { Container } from 'inversify';
import * as serveStatic from 'serve-static';

import { Logger } from '../logger/logger';
import { Scanner } from '../scanner/scanner';
import { iocTypes } from './ioc-types';
import { setupIocContainer } from './setup-ioc-container';

// tslint:disable: no-any no-unsafe-any no-object-literal-type-assertion

describe(setupIocContainer, () => {
    let testSubject: Container;

    beforeEach(() => {
        testSubject = setupIocContainer();
    });

    test.each([Scanner, Octokit, Logger])('verify singleton resolution %o', (key: any) => {
        verifySingletonDependencyResolution(testSubject, key);
    });
    test.each([
        { key: iocTypes.Console, value: console },
        { key: iocTypes.Process, value: process },
        { key: iocTypes.GetPort, value: getPort },
        { key: iocTypes.Express, value: express },
        { key: iocTypes.ServeStatic, value: serveStatic },
        { key: iocTypes.ReporterFactory, value: reporterFactory },
        { key: iocTypes.Github, value: github },
    ])('verify constant value resolution %s', (pair: { key: string; value: any }) => {
        expect(testSubject.get(pair.key)).toBe(pair.value);
    });

    function verifySingletonDependencyResolution(container: Container, key: any): void {
        expect(container.get(key)).toBeDefined();
        expect(container.get(key)).toBe(container.get(key));
    }
});
