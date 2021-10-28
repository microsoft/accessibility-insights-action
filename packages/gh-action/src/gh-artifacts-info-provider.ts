// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';
import { ArtifactsInfoProvider } from '@accessibility-insights-action/shared';

@injectable()
export class GitHubArtifactsInfoProvider extends ArtifactsInfoProvider {
    public getArtifactsUrl(): string | undefined {
        return undefined;
    }
    public getCommitHash(): string | undefined {
        return undefined;
    }
}
