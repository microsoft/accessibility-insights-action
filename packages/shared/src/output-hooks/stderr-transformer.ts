// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export const stderrTransformer = (rawData: string): string => {
    if (rawData.startsWith('waitFor is deprecated')) return null;
    if (rawData.startsWith('Some icons were re-registered.')) return null;

    return rawData;
};
