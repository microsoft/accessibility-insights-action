// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as adoTask from 'azure-pipelines-task-lib/task';
import normalizePath from 'normalize-path';
import path from 'path';
import { Mock, Times, IMock } from 'typemoq';
import { ADOTaskConfig } from './ado-task-config';

describe(ADOTaskConfig, () => {
    let processStub: NodeJS.Process;
    let adoTaskMock: IMock<typeof adoTask>;
    let taskConfig: ADOTaskConfig;

    beforeEach(() => {
        processStub = {
            env: {},
        } as NodeJS.Process;
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
        inputOption                    | inputValue          | expectedValue                                           | getInputFunc
        ${'repoToken'}                 | ${'token'}          | ${'token'}                                              | ${() => taskConfig.getToken()}
        ${'repoToken'}                 | ${undefined}        | ${undefined}                                            | ${() => taskConfig.getToken()}
        ${'staticSiteUrlRelativePath'} | ${'path'}           | ${'path'}                                               | ${() => taskConfig.getStaticSiteRelativePath()}
        ${'chromePath'}                | ${'./chromePath'}   | ${getPlatformAgnosticPath(__dirname + '/chromePath')}   | ${() => taskConfig.getChromePath()}
        ${'chromePath'}                | ${undefined}        | ${undefined}                                            | ${() => taskConfig.getChromePath()}
        ${'inputFile'}                 | ${'./inputFile'}    | ${getPlatformAgnosticPath(__dirname + '/inputFile')}    | ${() => taskConfig.getInputFile()}
        ${'inputFile'}                 | ${undefined}        | ${undefined}                                            | ${() => taskConfig.getInputFile()}
        ${'outputDir'}                 | ${'./outputDir'}    | ${getPlatformAgnosticPath(__dirname + '/outputDir')}    | ${() => taskConfig.getReportOutDir()}
        ${'staticSiteDir'}             | ${'path'}           | ${'path'}                                               | ${() => taskConfig.getStaticSiteDir()}
        ${'url'}                       | ${'url'}            | ${'url'}                                                | ${() => taskConfig.getUrl()}
        ${'url'}                       | ${undefined}        | ${undefined}                                            | ${() => taskConfig.getUrl()}
        ${'discoveryPatterns'}         | ${'abc'}            | ${'abc'}                                                | ${() => taskConfig.getDiscoveryPatterns()}
        ${'discoveryPatterns'}         | ${undefined}        | ${undefined}                                            | ${() => taskConfig.getDiscoveryPatterns()}
        ${'inputUrls'}                 | ${'abc'}            | ${'abc'}                                                | ${() => taskConfig.getInputUrls()}
        ${'inputUrls'}                 | ${undefined}        | ${undefined}                                            | ${() => taskConfig.getInputUrls()}
        ${'maxUrls'}                   | ${'20'}             | ${20}                                                   | ${() => taskConfig.getMaxUrls()}
        ${'scanTimeout'}               | ${'100000'}         | ${100000}                                               | ${() => taskConfig.getScanTimeout()}
        ${'staticSitePort'}            | ${'8080'}           | ${8080}                                                 | ${() => taskConfig.getStaticSitePort()}
        ${'staticSitePort'}            | ${undefined}        | ${undefined}                                            | ${() => taskConfig.getStaticSitePort()}
        ${'baselineFile'}              | ${'./baselineFile'} | ${getPlatformAgnosticPath(__dirname + '/baselineFile')} | ${() => taskConfig.getBaselineFile()}
        ${'failOnAccessibilityError'}  | ${true}             | ${true}                                                 | ${() => taskConfig.getFailOnAccessibilityError()}
        ${'singleWorker'}              | ${true}             | ${true}                                                 | ${() => taskConfig.getSingleWorker()}
    `(
        `input value '$inputValue' returned as '$expectedValue' for '$inputOption' parameter`,
        ({ inputOption, getInputFunc, inputValue, expectedValue }) => {
            if (typeof inputValue == 'boolean') {
                adoTaskMock
                    .setup((am) => am.getBoolInput(inputOption))
                    .returns(() => inputValue)
                    .verifiable(Times.once());
            } else {
                adoTaskMock
                    .setup((am) => am.getInput(inputOption))
                    .returns(() => inputValue as string)
                    .verifiable(Times.once());
            }
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            const retrievedOption: unknown = getInputFunc();
            expect(retrievedOption).toStrictEqual(expectedValue);
        },
    );

    it('should use environment value when chrome-path input is undefined', () => {
        const chromePath = 'some path';
        processStub = {
            env: {
                CHROME_BIN: chromePath,
            },
        } as unknown as NodeJS.Process;
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
                SYSTEM_DEFAULTWORKINGDIRECTORY: workspace,
            },
        } as unknown as NodeJS.Process;
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
        } as unknown as NodeJS.Process;
        taskConfig = new ADOTaskConfig(processStub, adoTaskMock.object);

        const actualRunId = taskConfig.getRunId();

        expect(actualRunId).toBe(runId);
    });

    it('should return collectionUri from environment', () => {
        const collectionUri = 'test-collection-uri';
        processStub = {
            env: {
                SYSTEM_COLLECTIONURI: `${collectionUri}`,
            },
        } as unknown as NodeJS.Process;
        taskConfig = new ADOTaskConfig(processStub, adoTaskMock.object);

        const actualCollectionUri = taskConfig.getCollectionUri();

        expect(actualCollectionUri).toEqual(collectionUri);
    });

    it('should return teamProject from environment', () => {
        const teamProject = 'test-team-project';
        processStub = {
            env: {
                SYSTEM_TEAMPROJECT: `${teamProject}`,
            },
        } as unknown as NodeJS.Process;
        taskConfig = new ADOTaskConfig(processStub, adoTaskMock.object);

        const actualTeamProject = taskConfig.getTeamProject();

        expect(actualTeamProject).toEqual(teamProject);
    });

    it('should return commit hash from environment', () => {
        const commitHash = 'commit-hash';
        processStub = {
            env: {
                BUILD_SOURCEVERSION: `${commitHash}`,
            },
        } as unknown as NodeJS.Process;
        taskConfig = new ADOTaskConfig(processStub, adoTaskMock.object);

        const actualCommitHash = taskConfig.getCommitHash();

        expect(actualCommitHash).toEqual(commitHash);
    });
});
