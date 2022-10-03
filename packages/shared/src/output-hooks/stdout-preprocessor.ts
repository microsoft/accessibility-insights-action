// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export const stdoutPreprocessor = (rawData: string): string => {
    return rawData.replace('either rerun with --updateBaseline or ', '');
};
