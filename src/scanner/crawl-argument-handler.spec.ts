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
        discoveryPatterns: ['a', 'b', 'c'],
        inputUrls: ['d', 'e', 'f'],
        url: 'url',
    };

    beforeEach(() => {
        taskConfigMock.reset();
        scanUrlResolverMock.reset();
        resolveMock.reset();
        validateMock.reset();
    });

    it('returns expected arguments when remote URL provided', async () => {
        setupProcessScanArguments();
        const startFileServerMock = Mock.ofInstance(() => Promise.resolve('localhost'));

        const expectedArgs: ScanArguments = {
            ...actionInputDefaultArgs,
            crawl: true,
            restart: true,
            axeSourcePath: 'axe',
        };

        validateMock.setup((m) => m(expectedArgs));

        const actualArgs = await crawlArgumentHandler.processScanArguments(startFileServerMock.object);
        expect(actualArgs).toStrictEqual(expectedArgs);

        taskConfigMock.verifyAll();
        validateMock.verifyAll();
        scanUrlResolverMock.verify((m) => m.resolveLocallyHostedUrls(It.isAny()), Times.never());
        startFileServerMock.verify((m) => m(), Times.never());
    });

    it('starts server & resolves local URLs when remote URL is not provided', async () => {
        setupProcessScanArguments({
            url: undefined,
        });

        const startFileServerMock = Mock.ofType<() => Promise<string>>();
        startFileServerMock.setup((m) => m()).returns((_) => Promise.resolve('localhost'));
        scanUrlResolverMock.setup((m) => m.resolveLocallyHostedUrls('localhost')).returns((_) => ({ url: 'localhost' }));

        const expectedArgs: ScanArguments = {
            ...actionInputDefaultArgs,
            crawl: true,
            restart: true,
            axeSourcePath: 'axe',
            url: 'localhost',
        };

        validateMock.setup((m) => m(expectedArgs));

        const actualArgs = await crawlArgumentHandler.processScanArguments(startFileServerMock.object);
        expect(actualArgs).toStrictEqual(expectedArgs);

        taskConfigMock.verifyAll();
        validateMock.verifyAll();
        scanUrlResolverMock.verifyAll();
        startFileServerMock.verifyAll();
    });

    function setupProcessScanArguments(overwriteDefaultArgs?: Partial<ScanArguments>) {
        const args = {
            ...actionInputDefaultArgs,
            ...overwriteDefaultArgs,
        };

        resolveMock.setup((m) => m(It.isAnyString(), 'node_modules', 'axe-core', 'axe.js')).returns((_) => 'axe');

        taskConfigMock.setup((m) => m.getInputFile()).returns((_) => args.inputFile);
        taskConfigMock.setup((m) => m.getReportOutDir()).returns((_) => args.output);
        taskConfigMock.setup((m) => m.getMaxUrls()).returns((_) => 10);
        taskConfigMock.setup((m) => m.getChromePath()).returns((_) => args.chromePath);
        taskConfigMock.setup((m) => m.getDiscoveryPatterns()).returns((_) => args.discoveryPatterns.join(' '));
        taskConfigMock.setup((m) => m.getInputUrls()).returns((_) => args.inputUrls.join(' '));
        taskConfigMock.setup((m) => m.getUrl()).returns((_) => args.url);
    }
});
