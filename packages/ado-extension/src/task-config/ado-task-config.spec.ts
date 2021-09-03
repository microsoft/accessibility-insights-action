// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as adoTask from 'azure-pipelines-task-lib/task';
import normalizePath from 'normalize-path';
import path from 'path';
import { Mock, Times, IMock } from 'typemoq';
import { ADOTaskConfig } from './ado-task-config';

describe(ADOTaskConfig, () => {
    let processStub: any;
    let adoTaskMock: IMock<typeof adoTask>;
    let taskConfig: ADOTaskConfig;

    beforeEach(() => {
        processStub = {
            env: {},
        } as any;
        adoTaskMock = Mock.ofType<typeof adoTask>();
        taskConfig = new ADOTaskConfig(processStub, adoTaskMock.object);
    });

    afterEach(() => {
        adoTaskMock.verifyAll();
    });

    function getPlatformAgnosticPath(inputPath: string): string {
        return normalizePath(path.resolve(inputPath));
    }

    it.each`
        inputOption                     | inputValue        | expectedValue                                         | getInputFunc
        ${'repoToken'}                  | ${'token'}        | ${'token'}                                            | ${() => taskConfig.getToken()}
        ${'scanUrlRelativePath'}        | ${'path'}         | ${'path'}                                             | ${() => taskConfig.getScanUrlRelativePath()}
        ${'chromePath'}                 | ${'./chromePath'} | ${getPlatformAgnosticPath(__dirname + '/chromePath')} | ${() => taskConfig.getChromePath()}
        ${'inputFile'}                  | ${'./inputFile'}  | ${getPlatformAgnosticPath(__dirname + '/inputFile')}  | ${() => taskConfig.getInputFile()}
        ${'outputDir'}                  | ${'./outputDir'}  | ${getPlatformAgnosticPath(__dirname + '/outputDir')}  | ${() => taskConfig.getReportOutDir()}
        ${'siteDir'}                    | ${'path'}         | ${'path'}                                             | ${() => taskConfig.getSiteDir()}
        ${'url'}                        | ${'url'}          | ${'url'}                                              | ${() => taskConfig.getUrl()}
        ${'discoveryPatterns'}          | ${'abc'}          | ${'abc'}                                              | ${() => taskConfig.getDiscoveryPatterns()}
        ${'inputUrls'}                  | ${'abc'}          | ${'abc'}                                              | ${() => taskConfig.getInputUrls()}
        ${'maxUrls'}                    | ${'20'}           | ${20}                                                 | ${() => taskConfig.getMaxUrls()}
        ${'scanTimeout'}                | ${'100000'}       | ${100000}                                             | ${() => taskConfig.getScanTimeout()}
        ${'repoServiceConnectionName'}  | ${'testName'}     | ${'testName'}                                         | ${() => taskConfig.getRepoServiceConnectionName()}
    `(
        `input value '$inputValue' returned as '$expectedValue' for '$inputOption' parameter`,
        ({ inputOption, getInputFunc, inputValue, expectedValue }) => {
            adoTaskMock
                .setup((am) => am.getInput(inputOption))
                .returns(() => inputValue)
                .verifiable(Times.once());
            const retrievedOption = getInputFunc();
            expect(retrievedOption).toStrictEqual(expectedValue);
        },
    );

    it.each`
        inputOption                    | inputValue        | expectedValue | getInputFunc
        ${'failOnAccessibilityError'}  | ${true}           | ${true}       | ${() => taskConfig.getFailOnAccessibilityError()}
    `(
        `bool input value '$inputValue' returned as '$expectedValue' for '$inputOption' parameter`,
        ({ inputOption, getInputFunc, inputValue, expectedValue }) => {
            adoTaskMock
                .setup((am) => am.getBoolInput(inputOption))
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
        adoTaskMock
            .setup((o) => o.getInput('chromePath'))
            .returns(() => '')
            .verifiable(Times.once());
        taskConfig = new ADOTaskConfig(processStub, adoTaskMock.object);

        const absolutePath = taskConfig.getChromePath();

        expect(absolutePath).toBe(chromePath);
    });

    it('should use workspace to build absolute file path', () => {
        const workspace = '/home/user/workspace';
        processStub = {
            env: {
                PIPELINE_WORKSPACE: workspace,
            },
        } as any;
        adoTaskMock
            .setup((o) => o.getInput('inputFile'))
            .returns(() => './file.txt')
            .verifiable(Times.once());
        taskConfig = new ADOTaskConfig(processStub, adoTaskMock.object);

        const absolutePath = taskConfig.getInputFile();

        expect(absolutePath).toBe(getPlatformAgnosticPath(`${workspace}/file.txt`));
    });

    it('should return run id from environment', () => {
        const runId = 789;
        processStub = {
            env: {
                BUILD_BUILDID: `${runId}`,
            },
        } as any;
        taskConfig = new ADOTaskConfig(processStub, adoTaskMock.object);

        const actualRunId = taskConfig.getRunId();

        expect(actualRunId).toBe(runId);
    });
});
