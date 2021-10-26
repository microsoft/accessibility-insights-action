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

    it('getArtifactsUrl returns expected artifacts URL based on adoTaskConfig', () => {
        const collectionUri = 'https://dev.azure.com/myOrganizationName/';
        const teamProject = 'myProject';
        const runId = 100;

        adoTaskConfigMock
            .setup((atc) => atc.getCollectionUri())
            .returns(() => collectionUri)
            .verifiable(Times.once());
        adoTaskConfigMock
            .setup((atc) => atc.getTeamProject())
            .returns(() => teamProject)
            .verifiable(Times.once());
        adoTaskConfigMock
            .setup((atc) => atc.getRunId())
            .returns(() => runId)
            .verifiable(Times.once());

        const expectedArtifactsUrl = `${collectionUri}${teamProject}/_build/results?buildId=${runId}&view=artifacts&pathAsName=false&type=publishedArtifacts`;

        const actualArtifactsUrl = adoArtifactsInfoProvider.getArtifactsUrl();

        expect(actualArtifactsUrl).toEqual(expectedArtifactsUrl);
    });

    it('getCommitHash returns expected commit hash', () => {
        const commitHashStub = 'abcd1234efgh5678ijklmno';
        const truncatedCommitHashStub = 'abcd1234';
        adoTaskConfigMock
            .setup((atc) => atc.getCommitHash())
            .returns(() => commitHashStub)
            .verifiable(Times.once());

        expect(adoArtifactsInfoProvider.getCommitHash()).toEqual(truncatedCommitHashStub);
    });
});
