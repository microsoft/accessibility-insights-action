// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as actionCore from '@actions/core';
import normalizePath from 'normalize-path';
import path from 'path';
import { Mock, Times, IMock } from 'typemoq';
import { TaskConfig } from './task-config';

describe(TaskConfig, () => {
    let processStub: any;
    let actionCoreMock: IMock<typeof actionCore>;
    let taskConfig: TaskConfig;

    beforeEach(() => {
        processStub = {
            env: {},
        } as any;
        actionCoreMock = Mock.ofType<typeof actionCore>();
        taskConfig = new TaskConfig(processStub, actionCoreMock.object);
    });

    afterEach(() => {
        actionCoreMock.verifyAll();
    });

    function getPlatformAgnosticPath(inputPath: string): string {
        return normalizePath(path.resolve(inputPath));
    }

    it.each`
        inputOption                 | inputValue                | expectedValue                                          | getInputFunc
        ${'repo-token'}             | ${'token'}                | ${'token'}                                             | ${() => taskConfig.getToken()}
        ${'scan-url-relative-path'} | ${'path'}                 | ${'path'}                                              | ${() => taskConfig.getScanUrlRelativePath()}
        ${'chrome-path'}            | ${'./../src/chrome-path'} | ${getPlatformAgnosticPath(__dirname + '/chrome-path')} | ${() => taskConfig.getChromePath()}
        ${'input-file'}             | ${'./../src/input-file'}  | ${getPlatformAgnosticPath(__dirname + '/input-file')}  | ${() => taskConfig.getInputFile()}
        ${'output-dir'}             | ${'./../src/output-dir'}  | ${getPlatformAgnosticPath(__dirname + '/output-dir')}  | ${() => taskConfig.getReportOutDir()}
        ${'site-dir'}               | ${'path'}                 | ${'path'}                                              | ${() => taskConfig.getSiteDir()}
        ${'url'}                    | ${'url'}                  | ${'url'}                                               | ${() => taskConfig.getUrl()}
        ${'discovery-patterns'}     | ${'abc'}                  | ${'abc'}                                               | ${() => taskConfig.getDiscoveryPatterns()}
        ${'input-urls'}             | ${'abc'}                  | ${'abc'}                                               | ${() => taskConfig.getInputUrls()}
        ${'max-urls'}               | ${'20'}                   | ${20}                                                  | ${() => taskConfig.getMaxUrls()}
        ${'localhost-port'}         | ${'8080'}                 | ${8080}                                                | ${() => taskConfig.getLocalhostPort()}
    `(
        `input value '$inputValue' returned as '$expectedValue' for '$inputOption' parameter`,
        ({ inputOption, getInputFunc, inputValue, expectedValue }) => {
            actionCoreMock
                .setup((am) => am.getInput(inputOption))
                .returns(() => inputValue)
                .verifiable(Times.once());
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
        taskConfig = new TaskConfig(processStub, actionCoreMock.object);

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
        taskConfig = new TaskConfig(processStub, actionCoreMock.object);

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
        taskConfig = new TaskConfig(processStub, actionCoreMock.object);

        const actualRunId = taskConfig.getRunId();

        expect(actualRunId).toBe(runId);
    });
});
