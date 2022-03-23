// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import 'reflect-metadata';
import * as path from 'path';
import * as fs from 'fs';

// Extension metadata is written by /pipelines/package-vsix-file.yaml
// Any changes to this type should also be reflected there!
export type AdoExtensionMetadata = {
    publisherId: string;
    extensionId: string;
    extensionName: string;
    extensionVersion: string;
    environment: string;

    // This should only be populated in Microsoft-internal release environments.
    appInsightsConnectionString: string | null;
};

export function readAdoExtensionMetadata(fsObj: typeof fs = fs): AdoExtensionMetadata {
    const metadataFilePath = path.join(__dirname, 'ado-extension-metadata.json');

    // This is a literal filename, the linter just can't see through the path.join
    //
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const rawMetadata = fsObj.readFileSync(metadataFilePath, { encoding: 'utf8' });

    // We allow the unsafe assignment and "as" usage because we trust that
    // package-vsix-file.yaml produces a valid metadata file
    //
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const parsedMetadata = JSON.parse(rawMetadata) as AdoExtensionMetadata;

    if (parsedMetadata.appInsightsConnectionString === '') {
        parsedMetadata.appInsightsConnectionString = null;
    }

    return parsedMetadata;
}
