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
    it('resolves scanner dependency', () => {
        const container = setupIocContainer();

        verifySingletonDependencyResolution(container, Scanner);
    });

    it('resolves console dependency', () => {
        const container = setupIocContainer();

        expect(container.get(iocTypes.Console)).toBe(console);
    });

    it('resolves process dependency', () => {
        const container = setupIocContainer();

        expect(container.get(iocTypes.Process)).toBe(process);
    });

    it('resolves GetPort dependency', () => {
        const container = setupIocContainer();

        expect(container.get(iocTypes.GetPort)).toBe(getPort);
    });

    it('resolves express dependency', () => {
        const container = setupIocContainer();

        expect(container.get(iocTypes.Express)).toBe(express);
    });

    it('resolves ServeStatic dependency', () => {
        const container = setupIocContainer();

        expect(container.get(iocTypes.ServeStatic)).toBe(serveStatic);
    });

    it('resolves ServeStatic dependency', () => {
        const container = setupIocContainer();

        expect(container.get(iocTypes.ReporterFactory)).toBe(reporterFactory);
    });

    it('resolves github dependency', () => {
        const container = setupIocContainer();

        expect(container.get(iocTypes.Github)).toBe(github);
    });

    it('resolves Octokit dependency', () => {
        const container = setupIocContainer();

        verifySingletonDependencyResolution(container, Octokit);
    });

    it('resolves Logger dependency', () => {
        const container = setupIocContainer();

        verifySingletonDependencyResolution(container, Logger);
    });

    function verifySingletonDependencyResolution(container: Container, key: any): void {
        expect(container.get(key)).toBeDefined();
        expect(container.get(key)).toBe(container.get(key));
    }
});
