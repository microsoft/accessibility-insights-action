// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { ArtifactsInfoProvider } from '@accessibility-insights-action/shared';
import { inject, injectable } from 'inversify';

import { ADOTaskConfig } from './task-config/ado-task-config';

@injectable()
export class ADOArtifactsInfoProvider extends ArtifactsInfoProvider {
    constructor(@inject(ADOTaskConfig) private readonly adoTaskConfig: ADOTaskConfig) {
        super();
    }
    public getArtifactsUrl(): string | undefined {
        const collectionUri = this.adoTaskConfig.getCollectionUri();
        const teamProject = this.adoTaskConfig.getTeamProject();
        const runId = this.adoTaskConfig.getRunId();
        if (!collectionUri || !teamProject || !runId) {
            return undefined;
        }

        const url = new URL(
            `${collectionUri}${teamProject}/_build/results?buildId=${runId}&view=artifacts&pathAsName=false&type=publishedArtifacts`,
        );
        return url.toString();
    }

    public getCommitHash(): string | undefined {
        return this.adoTaskConfig.getCommitHash()?.substring(0, 8);
    }
}
