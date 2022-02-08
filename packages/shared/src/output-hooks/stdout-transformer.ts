// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const debugPrefix = '##[debug]';

type RegexTransformation = {
    regex: RegExp;
    method: (rawData: string, regex?: RegExp) => string;
};

const regexTransformations: RegexTransformation[] = [
    {
        regex: new RegExp('^\\[Exception\\]'),
        method: useUnmodifiedString,
    },
    {
        regex: new RegExp('^##\\[error\\]'),
        method: useUnmodifiedString,
    },
    {
        regex: new RegExp('^##\\[debug\\]'),
        method: useUnmodifiedString,
    },
    {
        regex: new RegExp('^##vso\\[task.debug\\]'),
        method: useUnmodifiedString,
    },
    {
        regex: new RegExp('^\\[Trace\\]\\[info\\] === '),
        method: replaceFirstMatchWithDebugPrefix,
    },
    {
        // eslint-disable-next-line no-control-regex
        regex: new RegExp('^\u001B\\[32mINFO\u001b\\[39m '), // Includes escape characters used for color formatting)
        method: replaceFirstMatchWithDebugPrefix,
    },
];

export const stdoutTransformer = (rawData: string): string => {
    for (const startSubstitution of regexTransformations) {
        const newData = evaluateRegexTransformation(rawData, startSubstitution.regex, startSubstitution.method);

        if (newData) {
            return newData;
        }
    }

    return prependDebugPrefix(rawData);
};

export function evaluateRegexTransformation(
    input: string,
    regex: RegExp,
    modifier: (input: string, regex?: RegExp) => string,
): string | null {
    const matches = input.match(regex);
    if (matches) {
        return modifier(input, regex);
    }

    return null;
}

function useUnmodifiedString(input: string): string {
    return input;
}

function replaceFirstMatchWithDebugPrefix(input: string, regex: RegExp): string {
    return `${debugPrefix} ${input.replace(regex, '$`')}`;
}

function prependDebugPrefix(input: string): string {
    return `${debugPrefix} ${input}`;
}
