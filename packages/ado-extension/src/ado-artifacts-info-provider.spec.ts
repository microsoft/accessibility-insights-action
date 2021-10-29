// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, Times, IMock } from 'typemoq';
import { ADOArtifactsInfoProvider } from './ado-artifacts-info-provider';
import { ADOTaskConfig } from './task-config/ado-task-config';

describe(ADOArtifactsInfoProvider, () => {
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let adoArtifactsInfoProvider: ADOArtifactsInfoProvider;

    beforeEach(() => {
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>();
        adoArtifactsInfoProvider = new ADOArtifactsInfoProvider(adoTaskConfigMock.object);
    });

    describe('getArtifactsUrl', () => {
        const collectionUri = 'https://dev.azure.com/myOrganizationName/';
        const teamProject = 'myProject';
        const teamProjectEscaped = 'my Projéct';
        const runId = 100;
        const expectedArtifactsUrl = `${collectionUri}${teamProject}/_build/results?buildId=${runId}&view=artifacts&pathAsName=false&type=publishedArtifacts`;
        const expectedEscapedArtifactsUrl = `https://dev.azure.com/myOrganizationName/my%20Proj%C3%A9ct/_build/results?buildId=100&view=artifacts&pathAsName=false&type=publishedArtifacts`;

        it.each`
            collectionUri    | teamProject    | runId        | expectedUrl
            ${collectionUri} | ${teamProject} | ${100}       | ${expectedArtifactsUrl}
            ${collectionUri} | ${teamProjectEscaped} | ${100}       | ${expectedEscapedArtifactsUrl}
            ${collectionUri} | ${teamProject} | ${undefined} | ${undefined}
            ${collectionUri} | ${teamProject} | ${''}        | ${undefined}
            ${collectionUri} | ${undefined}   | ${100}       | ${undefined}
            ${collectionUri} | ${undefined}   | ${undefined} | ${undefined}
            ${collectionUri} | ${undefined}   | ${''}        | ${undefined}
            ${collectionUri} | ${''}          | ${100}       | ${undefined}
            ${collectionUri} | ${''}          | ${undefined} | ${undefined}
            ${collectionUri} | ${''}          | ${''}        | ${undefined}
            ${undefined}     | ${teamProject} | ${100}       | ${undefined}
            ${undefined}     | ${teamProject} | ${undefined} | ${undefined}
            ${undefined}     | ${teamProject} | ${''}        | ${undefined}
            ${undefined}     | ${undefined}   | ${100}       | ${undefined}
            ${undefined}     | ${undefined}   | ${undefined} | ${undefined}
            ${undefined}     | ${undefined}   | ${''}        | ${undefined}
            ${undefined}     | ${''}          | ${100}       | ${undefined}
            ${undefined}     | ${''}          | ${undefined} | ${undefined}
            ${undefined}     | ${''}          | ${''}        | ${undefined}
            ${''}            | ${teamProject} | ${100}       | ${undefined}
            ${''}            | ${teamProject} | ${undefined} | ${undefined}
            ${''}            | ${teamProject} | ${''}        | ${undefined}
            ${''}            | ${undefined}   | ${100}       | ${undefined}
            ${''}            | ${undefined}   | ${undefined} | ${undefined}
            ${''}            | ${undefined}   | ${''}        | ${undefined}
            ${''}            | ${''}          | ${100}       | ${undefined}
            ${''}            | ${''}          | ${undefined} | ${undefined}
            ${''}            | ${''}          | ${''}        | ${undefined}
        `(
            `returns '$expectedUrl' with collectionUri '$collectionUri', teamProject '$teamProject', runId '$runId'`,
            ({ collectionUri, teamProject, runId, expectedUrl }) => {
                adoTaskConfigMock
                    .setup((atc) => atc.getCollectionUri())
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    .returns(() => collectionUri)
                    .verifiable(Times.once());
                adoTaskConfigMock
                    .setup((atc) => atc.getTeamProject())
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    .returns(() => teamProject)
                    .verifiable(Times.once());
                adoTaskConfigMock
                    .setup((atc) => atc.getRunId())
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
                    .returns(() => runId)
                    .verifiable(Times.once());

                expect(adoArtifactsInfoProvider.getArtifactsUrl()).toEqual(expectedUrl);
            },
        );
    });

    it.each`
        hashValue                    | expectedValue
        ${'abcd1234efgh5678ijklmno'} | ${'abcd1234'}
        ${undefined}                 | ${undefined}
    `(`getCommitHash with hash value '$hashValue' returns '$expectedValue'`, ({ hashValue, expectedValue }) => {
        adoTaskConfigMock
            .setup((atc) => atc.getCommitHash())
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            .returns(() => hashValue)
            .verifiable(Times.once());

        expect(adoArtifactsInfoProvider.getCommitHash()).toEqual(expectedValue);
    });
});
