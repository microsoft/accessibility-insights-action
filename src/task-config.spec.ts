// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as actionCore from '@actions/core';
import * as process from 'process';
import { Mock, Times } from 'typemoq';

import { TaskConfig } from './task-config';

describe(TaskConfig, () => {
    const runId = 789;
    const workspace = 'some-workspace';
    const processStub = {
        env: {
            GITHUB_WORKSPACE: workspace,
            GITHUB_RUN_ID: `${runId}`,
        },
    } as any;

    const actionCoreMock = Mock.ofType<typeof actionCore>();
    const taskConfig = new TaskConfig(processStub, actionCoreMock.object);

    it.each`
        inputOption                 | inputValue | expectedValue | getInputFunc
        ${'repo-token'}             | ${'token'} | ${'token'}    | ${() => taskConfig.getToken()}
        ${'scan-url-relative-path'} | ${'path'}  | ${'path'}     | ${() => taskConfig.getScanUrlRelativePath()}
        ${'chrome-path'}            | ${'path'}  | ${'path'}     | ${() => taskConfig.getChromePath()}
        ${'input-file'}             | ${'path'}  | ${'path'}     | ${() => taskConfig.getInputFile()}
        ${'output-dir'}             | ${'path'}  | ${'path'}     | ${() => taskConfig.getReportOutDir()}
        ${'site-dir'}               | ${'path'}  | ${'path'}     | ${() => taskConfig.getSiteDir()}
        ${'url'}                    | ${'url'}   | ${'url'}      | ${() => taskConfig.getUrl()}
        ${'discovery-patterns'}     | ${'abc'}   | ${'abc'}      | ${() => taskConfig.getDiscoveryPatterns()}
        ${'input-urls'}             | ${'abc'}   | ${'abc'}      | ${() => taskConfig.getInputUrls()}
        ${'max-urls'}               | ${'20'}    | ${20}         | ${() => taskConfig.getMaxUrls()}
    `(
        'parses "$inputValue" as $expectedValue when provided as $inputOption',
        ({ inputOption, getInputFunc, inputValue, expectedValue }) => {
            actionCoreMock
                .setup((am) => am.getInput(inputOption))
                .returns(() => inputValue)
                .verifiable(Times.once());
            const retrievedOption = getInputFunc();
            expect(retrievedOption).toStrictEqual(expectedValue);
        },
    );

    it('getChromePath returns empty', () => {
        const chromePath = 'some path';
        process.env.CHROME_BIN = chromePath;

        actionCoreMock
            .setup((am) => am.getInput('chrome-path'))
            .returns(() => '')
            .verifiable(Times.once());

        const res = taskConfig.getChromePath();

        expect(res).toBe(chromePath);
    });

    it('getRunId', () => {
        const res = taskConfig.getRunId();

        expect(res).toBe(runId);
    });

    afterEach(() => {
        actionCoreMock.verifyAll();
        actionCoreMock.reset();
    });
});
