// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export const regexTransformation = (input: string, regex: RegExp, modifier: (input: string, regex?: RegExp) => string): string | null => {
    const matches = input.match(regex);
    if (matches) {
        return modifier(input, regex);
    }

    return null;
};
