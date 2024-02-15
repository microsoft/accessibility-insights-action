// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { It, Mock, MockBehavior, Times } from 'typemoq';
import { resolve } from 'path';
import { CrawlArgumentHandler } from './crawl-argument-handler';
import { TaskConfig } from '../task-config';
import { ScanUrlResolver } from './scan-url-resolver';
import { ScanArguments, validateScanArguments } from 'accessibility-insights-scan';

describe(CrawlArgumentHandler, () => {
    const taskConfigMock = Mock.ofType<TaskConfig>(null, MockBehavior.Strict);
    const scanUrlResolverMock = Mock.ofType<ScanUrlResolver>(null, MockBehavior.Strict);
    const resolveMock = Mock.ofType<typeof resolve>(null, MockBehavior.Strict);
    const validateMock = Mock.ofType<typeof validateScanArguments>(null, MockBehavior.Strict);
    const crawlArgumentHandler = new CrawlArgumentHandler(
        taskConfigMock.object,
        scanUrlResolverMock.object,
        resolveMock.object,
        validateMock.object,
    );

    const actionInputDefaultArgs: Partial<ScanArguments> = {
        inputFile: 'inputFile',
        output: 'output',
        maxUrls: 10,
        chromePath: 'chrome',
        url: 'url',
        keepUrlFragment: false,
        singleWorker: false,
        baselineFile: null,
    };

    beforeEach(() => {
        taskConfigMock.reset();
        scanUrlResolverMock.reset();
        resolveMock.reset();
        validateMock.reset();
    });

    it('returns expected arguments when remote URL provided', () => {
        setupProcessScanArguments({
            discoveryPatterns: 'a b c',
            inputUrls: 'd e f',
        });

        const expectedArgs: ScanArguments = {
            ...actionInputDefaultArgs,
            crawl: true,
            restart: true,
            axeSourcePath: 'axe',
            discoveryPatterns: ['a', 'b', 'c'],
            inputUrls: ['d', 'e', 'f'],
            serviceAccountName: undefined,
            serviceAccountPassword: undefined,
            authType: undefined,
            snapshot: undefined,
        };

        validateMock.setup((m) => m(expectedArgs));

        const actualArgs = crawlArgumentHandler.processScanArguments();
        expect(actualArgs).toStrictEqual(expectedArgs);

        taskConfigMock.verifyAll();
        validateMock.verifyAll();
        scanUrlResolverMock.verify((m) => m.resolveLocallyHostedUrls(It.isAny()), Times.never());
    });

    it('resolves local URLs when remote URL is not provided', () => {
        setupProcessScanArguments({
            url: undefined,
        });

        scanUrlResolverMock.setup((m) => m.resolveLocallyHostedUrls('localhost')).returns((_) => ({ url: 'localhost' }));

        const expectedArgs: ScanArguments = {
            ...actionInputDefaultArgs,
            crawl: true,
            restart: true,
            axeSourcePath: 'axe',
            url: 'localhost',
            discoveryPatterns: undefined,
            inputUrls: undefined,
            serviceAccountName: undefined,
            serviceAccountPassword: undefined,
            authType: undefined,
            snapshot: undefined,
        };

        validateMock.setup((m) => m(expectedArgs));

        const actualArgs = crawlArgumentHandler.processScanArguments('localhost');
        expect(actualArgs).toStrictEqual(expectedArgs);

        taskConfigMock.verifyAll();
        validateMock.verifyAll();
        scanUrlResolverMock.verifyAll();
    });

    it('returns expected arguments when discoveryPatterns / inputFiles empty strings', () => {
        setupProcessScanArguments({
            discoveryPatterns: '',
            inputUrls: '',
        });

        const expectedArgs: ScanArguments = {
            ...actionInputDefaultArgs,
            crawl: true,
            restart: true,
            axeSourcePath: 'axe',
            discoveryPatterns: undefined,
            inputUrls: undefined,
            serviceAccountName: undefined,
            serviceAccountPassword: undefined,
            authType: undefined,
            snapshot: undefined,
        };

        validateMock.setup((m) => m(expectedArgs));

        const actualArgs = crawlArgumentHandler.processScanArguments();
        expect(actualArgs).toStrictEqual(expectedArgs);
    });

    it('returns baseline file when specified', () => {
        const baselineFile = 'test.baseline';

        setupProcessScanArguments({
            baselineFile,
        });

        const expectedArgs: ScanArguments = {
            ...actionInputDefaultArgs,
            crawl: true,
            restart: true,
            axeSourcePath: 'axe',
            discoveryPatterns: undefined,
            inputUrls: undefined,
            baselineFile,
            serviceAccountName: undefined,
            serviceAccountPassword: undefined,
            authType: undefined,
            snapshot: undefined,
        };

        validateMock.setup((m) => m(expectedArgs));

        const actualArgs = crawlArgumentHandler.processScanArguments();
        expect(actualArgs).toStrictEqual(expectedArgs);
    });

    function setupProcessScanArguments(overwriteDefaultArgs?: Partial<Record<keyof ScanArguments, any>>) {
        const args = {
            ...actionInputDefaultArgs,
            ...overwriteDefaultArgs,
        };

        resolveMock.setup((m) => m(It.isAnyString(), 'node_modules', 'axe-core', 'axe.js')).returns((_) => 'axe');

        taskConfigMock.setup((m) => m.getInputFile()).returns((_) => args.inputFile);
        taskConfigMock.setup((m) => m.getReportOutDir()).returns((_) => args.output);
        taskConfigMock.setup((m) => m.getMaxUrls()).returns((_) => 10);
        taskConfigMock.setup((m) => m.getChromePath()).returns((_) => args.chromePath);
        taskConfigMock.setup((m) => m.getDiscoveryPatterns()).returns((_) => args.discoveryPatterns);
        taskConfigMock.setup((m) => m.getInputUrls()).returns((_) => args.inputUrls);
        taskConfigMock.setup((m) => m.getUrl()).returns((_) => args.url);
        taskConfigMock.setup((m) => m.getKeepUrlFragment()).returns((_) => args.keepUrlFragment);
        taskConfigMock.setup((m) => m.getSingleWorker()).returns((_) => args.singleWorker);
        taskConfigMock.setup((m) => m.getBaselineFile()).returns((_) => args.baselineFile);
        taskConfigMock.setup((m) => m.getServiceAccountName()).returns((_) => undefined);
        taskConfigMock.setup((m) => m.getServiceAccountPassword()).returns((_) => undefined);
        taskConfigMock.setup((m) => m.getAuthType()).returns((_) => undefined);
        taskConfigMock.setup((m) => m.getSnapshot()).returns((_) => undefined);
    }
});
