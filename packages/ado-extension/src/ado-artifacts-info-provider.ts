// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ArtifactsInfoProvider } from '@accessibility-insights-action/shared/dist/artifacts-info-provider';
import { inject, injectable } from 'inversify';

import normalizePath from 'normalize-path';
import { ADOTaskConfig } from './task-config/ado-task-config';

@injectable()
export class ADOArtifactsInfoProvider extends ArtifactsInfoProvider {
    constructor(@inject(ADOTaskConfig) private readonly adoTaskConfig: ADOTaskConfig) { super() }
    public getArtifactsUrl(): string | undefined {
        const collectionUri = this.adoTaskConfig.getCollectionUri();
        const teamProject = this.adoTaskConfig.getTeamProject();
        const runId = this.adoTaskConfig.getRunId();
        if (collectionUri === undefined || teamProject === undefined || runId === undefined) {
            return undefined;
        }

        const artifactsUrl = `${collectionUri}${teamProject}/_build/results?buildId=${runId}&view=artifacts&pathAsName=false&type=publishedArtifacts`;

        return normalizePath(artifactsUrl);
    }

    public getCommitHash(): string | undefined {
        return this.adoTaskConfig.getCommitHash();
    }
}
