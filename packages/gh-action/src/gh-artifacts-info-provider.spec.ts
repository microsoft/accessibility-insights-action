// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { GitHubArtifactsInfoProvider } from './gh-artifacts-info-provider';

describe(GitHubArtifactsInfoProvider, () => {
    let gitHubArtifactsInfoProvider: GitHubArtifactsInfoProvider;

    beforeEach(() => {
        gitHubArtifactsInfoProvider = new GitHubArtifactsInfoProvider();
    });

    it('getArtifactsUrl returns undefined', () => {
        expect(gitHubArtifactsInfoProvider.getArtifactsUrl()).toEqual(undefined);
    });

    it('getCommitHash returns undefined', () => {
        expect(gitHubArtifactsInfoProvider.getCommitHash()).toEqual(undefined);
    });
});
