// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';

@injectable()
export abstract class ArtifactsInfoProvider {
    abstract getArtifactsUrl(): string | undefined;
    abstract getCommitHash(): string | undefined;
}
