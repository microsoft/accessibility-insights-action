// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export const stderrTransformer = (rawData: string): string => {
    if (rawData.startsWith('waitFor is deprecated')) return null;
    if (rawData.startsWith('Warning: Each child in a list should have a unique "key" prop')) return null;

    return rawData;
};
