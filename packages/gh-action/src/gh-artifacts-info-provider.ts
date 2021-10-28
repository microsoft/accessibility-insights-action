// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';

@injectable()
export class GitHubArtifactsInfoProvider {
    public getArtifactsUrl(): string | undefined {
        return undefined;
    }
    public getCommitHash(): string | undefined {
        return undefined;
    }
}
