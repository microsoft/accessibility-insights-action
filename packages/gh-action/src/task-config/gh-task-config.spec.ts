// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as actionCore from '@actions/core';
import normalizePath from 'normalize-path';
import path from 'path';
import { Mock, Times, IMock } from 'typemoq';
import { GHTaskConfig } from './gh-task-config';

describe(GHTaskConfig, () => {
    let processStub: any;
    let actionCoreMock: IMock<typeof actionCore>;
    let taskConfig: GHTaskConfig;
    let markdownSummaryMock: IMock<typeof actionCore.summary>;

    beforeEach(() => {
        processStub = {
            env: {},
        } as any;
        actionCoreMock = Mock.ofType<typeof actionCore>();
        markdownSummaryMock = Mock.ofType<typeof actionCore.summary>();
        taskConfig = new GHTaskConfig(processStub, actionCoreMock.object);
    });

    afterEach(() => {
        actionCoreMock.verifyAll();
        markdownSummaryMock.verifyAll();
    });

    function getPlatformAgnosticPath(inputPath: string): string {
        return normalizePath(path.resolve(inputPath));
    }

    it.each`
        inputOption                        | inputValue             | expectedValue                                              | getInputFunc
        ${'static-site-url-relative-path'} | ${'path'}              | ${'path'}                                                  | ${() => taskConfig.getStaticSiteUrlRelativePath()}
        ${'static-site-url-relative-path'} | ${''}                  | ${undefined}                                               | ${() => taskConfig.getStaticSiteUrlRelativePath()}
        ${'chrome-path'}                   | ${'./chrome-path'}     | ${getPlatformAgnosticPath(__dirname + '/chrome-path')}     | ${() => taskConfig.getChromePath()}
        ${'input-file'}                    | ${'./input-file'}      | ${getPlatformAgnosticPath(__dirname + '/input-file')}      | ${() => taskConfig.getInputFile()}
        ${'input-file'}                    | ${''}                  | ${undefined}                                               | ${() => taskConfig.getInputFile()}
        ${'output-dir'}                    | ${'./output-dir'}      | ${getPlatformAgnosticPath(__dirname + '/output-dir')}      | ${() => taskConfig.getReportOutDir()}
        ${'static-site-dir'}               | ${'./static-site-dir'} | ${getPlatformAgnosticPath(__dirname + '/static-site-dir')} | ${() => taskConfig.getStaticSiteDir()}
        ${'static-site-dir'}               | ${''}                  | ${undefined}                                               | ${() => taskConfig.getStaticSiteDir()}
        ${'url'}                           | ${'url'}               | ${'url'}                                                   | ${() => taskConfig.getUrl()}
        ${'url'}                           | ${''}                  | ${undefined}                                               | ${() => taskConfig.getUrl()}
        ${'discovery-patterns'}            | ${'abc'}               | ${'abc'}                                                   | ${() => taskConfig.getDiscoveryPatterns()}
        ${'discovery-patterns'}            | ${''}                  | ${undefined}                                               | ${() => taskConfig.getDiscoveryPatterns()}
        ${'input-urls'}                    | ${'abc'}               | ${'abc'}                                                   | ${() => taskConfig.getInputUrls()}
        ${'input-urls'}                    | ${''}                  | ${undefined}                                               | ${() => taskConfig.getInputUrls()}
        ${'max-urls'}                      | ${'20'}                | ${20}                                                      | ${() => taskConfig.getMaxUrls()}
        ${'scan-timeout'}                  | ${'100000'}            | ${100000}                                                  | ${() => taskConfig.getScanTimeout()}
        ${'static-site-port'}              | ${'8080'}              | ${8080}                                                    | ${() => taskConfig.getStaticSitePort()}
        ${'static-site-port'}              | ${''}                  | ${undefined}                                               | ${() => taskConfig.getStaticSitePort()}
        ${'baseline-file'}                 | ${'./baseline-file'}   | ${getPlatformAgnosticPath(__dirname + '/baseline-file')}   | ${() => taskConfig.getBaselineFile()}
        ${'baseline-file'}                 | ${''}                  | ${undefined}                                               | ${() => taskConfig.getBaselineFile()}
        ${'single-worker'}                 | ${'true'}              | ${true}                                                    | ${() => taskConfig.getSingleWorker()}
        ${'single-worker'}                 | ${''}                  | ${true}                                                    | ${() => taskConfig.getSingleWorker()}
        ${'single-worker'}                 | ${'false'}             | ${false}                                                   | ${() => taskConfig.getSingleWorker()}
        ${'hosting-mode'}                  | ${'staticSite'}        | ${'staticSite'}                                            | ${() => taskConfig.getHostingMode()}
        ${'hosting-mode'}                  | ${'dynamicSite'}       | ${'dynamicSite'}                                           | ${() => taskConfig.getHostingMode()}
        ${'hosting-mode'}                  | ${''}                  | ${undefined}                                               | ${() => taskConfig.getHostingMode()}
        ${'fail-on-accessibility-error'}   | ${'true'}              | ${true}                                                    | ${() => taskConfig.getFailOnAccessibilityError()}
        ${'fail-on-accessibility-error'}   | ${''}                  | ${true}                                                    | ${() => taskConfig.getFailOnAccessibilityError()}
        ${'fail-on-accessibility-error'}   | ${'false'}             | ${false}                                                   | ${() => taskConfig.getFailOnAccessibilityError()}
    `(
        `input value '$inputValue' returned as '$expectedValue' for '$inputOption' parameter`,
        ({ inputOption, getInputFunc, inputValue, expectedValue }) => {
            if (typeof inputValue == 'boolean') {
                actionCoreMock
                    .setup((am) => am.getBooleanInput(inputOption))
                    .returns(() => inputValue)
                    .verifiable(Times.once());
            } else {
                actionCoreMock
                    .setup((am) => am.getInput(inputOption))
                    .returns(() => inputValue)
                    .verifiable(Times.once());
            }
            const retrievedOption = getInputFunc();
            expect(retrievedOption).toStrictEqual(expectedValue);
        },
    );

    it('should use environment value when chrome-path input is undefined', () => {
        const chromePath = 'some path';
        processStub = {
            env: {
                CHROME_BIN: chromePath,
            },
        } as any;
        actionCoreMock
            .setup((o) => o.getInput('chrome-path'))
            .returns(() => '')
            .verifiable(Times.once());
        taskConfig = new GHTaskConfig(processStub, actionCoreMock.object);

        const absolutePath = taskConfig.getChromePath();

        expect(absolutePath).toBe(chromePath);
    });

    it('should use workspace to build absolute file path', () => {
        const workspace = '/home/user/workspace';
        processStub = {
            env: {
                GITHUB_WORKSPACE: workspace,
            },
        } as any;
        actionCoreMock
            .setup((o) => o.getInput('input-file'))
            .returns(() => './file.txt')
            .verifiable(Times.once());
        taskConfig = new GHTaskConfig(processStub, actionCoreMock.object);

        const absolutePath = taskConfig.getInputFile();

        expect(absolutePath).toBe(getPlatformAgnosticPath(`${workspace}/file.txt`));
    });

    it('should return run id from environment', () => {
        const runId = 789;
        processStub = {
            env: {
                GITHUB_RUN_ID: `${runId}`,
            },
        } as any;
        taskConfig = new GHTaskConfig(processStub, actionCoreMock.object);

        const actualRunId = taskConfig.getRunId();

        expect(actualRunId).toBe(runId);
    });

    it('should write job summary', async () => {
        const markdownStub = 'markdownStub';

        markdownSummaryMock
            .setup((o) => o.addRaw(markdownStub))
            .returns(() => markdownSummaryMock.object)
            .verifiable();
        markdownSummaryMock.setup((o) => o.write()).verifiable();

        actionCoreMock.setup((o) => o.summary).returns(() => markdownSummaryMock.object);

        await taskConfig.writeJobSummary(markdownStub);
    });
});
