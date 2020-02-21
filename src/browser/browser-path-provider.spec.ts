// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// tslint:disable:no-import-side-effect no-any
import * as os from 'os';
import * as path from 'path';
import 'reflect-metadata';
import { IMock, Mock, Times } from 'typemoq';
import { Logger } from '../logger/logger';
import { BrowserPathProvider } from './browser-path-provider';

// tslint:disable: no-object-literal-type-assertion no-unsafe-any

describe(BrowserPathProvider, () => {
    let browserPathProvider: BrowserPathProvider;
    let osObjMock: IMock<typeof os>;
    let loggerMock: IMock<Logger>;
    let processStub: typeof process;
    let exitMock: IMock<(code: number) => any>;

    beforeEach(() => {
        loggerMock = Mock.ofType(Logger);
        exitMock = Mock.ofInstance((code: number) => undefined);
        osObjMock = Mock.ofType<typeof os>();
        processStub = {
            exit: exitMock.object,
        } as typeof process;

        browserPathProvider = new BrowserPathProvider(loggerMock.object, processStub, osObjMock.object);
    });

    it('should create instance', () => {
        expect(browserPathProvider).not.toBeNull();
    });

    describe('getChromePath', () => {
        it('Windows_NT, x64', () => {
            const programFilesPath = 'programFilesPath';
            processStub.env = { ['PROGRAMFILES(X86)']: programFilesPath };

            osObjMock
                .setup(om => om.type())
                .returns(() => 'Windows_NT')
                .verifiable(Times.once());

            osObjMock
                .setup(om => om.arch())
                .returns(() => 'x64')
                .verifiable(Times.once());

            const actualPath = browserPathProvider.getChromePath();
            const expectedPath = path.join(programFilesPath, 'Google/Chrome/Application/chrome.exe');

            expect(expectedPath).toEqual(actualPath);

            verifyMocks();
        });

        it('Windows_NT, x86', () => {
            const programFilesPath = 'programFilesPath';
            processStub.env = {};
            processStub.env.PROGRAMFILES = programFilesPath;

            osObjMock
                .setup(om => om.type())
                .returns(() => 'Windows_NT')
                .verifiable(Times.once());

            osObjMock
                .setup(om => om.arch())
                .returns(() => 'x86')
                .verifiable(Times.once());

            const actualPath = browserPathProvider.getChromePath();
            const expectedPath = path.join(programFilesPath, 'Google/Chrome/Application/chrome.exe');

            expect(expectedPath).toEqual(actualPath);

            verifyMocks();
        });

        it('Linux', () => {
            osObjMock
                .setup(om => om.type())
                .returns(() => 'Linux')
                .verifiable(Times.once());

            const actualPath = browserPathProvider.getChromePath();
            const expectedPath = '/usr/bin/google-chrome';

            expect(expectedPath).toEqual(actualPath);

            verifyMocks();
        });

        it('not supported', () => {
            osObjMock
                .setup(om => om.type())
                .returns(() => 'NA')
                .verifiable(Times.once());
            loggerMock.setup(lm => lm.logError('OS NA is not supported')).verifiable(Times.once());

            try {
                browserPathProvider.getChromePath();
                throw new Error('Should fail!');
            } catch (error) {
                verifyMocks();
            }
        });
    });

    function verifyMocks(): void {
        loggerMock.verifyAll();
        exitMock.verifyAll();
        osObjMock.verifyAll();
    }
});
