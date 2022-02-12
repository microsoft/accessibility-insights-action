// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const debugPrefix = '::debug::';

type RegexTransformation = {
    regex: RegExp;
    method: (rawData: string, regex?: RegExp) => string;
};

const regexTransformations: RegexTransformation[] = [
    {
        regex: new RegExp('^Processing page .*'),
        method: useUnmodifiedString,
    },
    {
        regex: new RegExp('^Discovered \\d* links on page '),
        method: useUnmodifiedString,
    },
    {
        regex: new RegExp('^Found \\d* accessibility issues on page '),
        method: useUnmodifiedString,
    },
    {
        regex: new RegExp('^\\[error\\]'),
        method: replaceFirstMatchWithErrorPrefix,
    },
    {
        regex: new RegExp('^\\[info\\]'),
        method: removeFirstMatch,
    },
    {
        regex: new RegExp('^\\[warn\\]'),
        method: replaceFirstMatchWithWarningPrefix,
    },
    {
        regex: new RegExp('^\\[verbose\\]'),
        method: replaceFirstMatchWithDebugPrefix,
    },
    {
        regex: new RegExp('^\\[debug\\]'),
        method: replaceFirstMatchWithDebugPrefix,
    },
    {
        regex: new RegExp('^\\[group\\]'),
        method: replaceFirstMatchWithGroupPrefix,
    },
    {
        regex: new RegExp('^\\[endgroup\\]'),
        method: replaceFirstMatchWithEndgroupPrefix,
    },
    {
        // eslint-disable-next-line no-control-regex
        regex: new RegExp('^\u001B\\[32mINFO\u001b\\[39m '), // Includes escape characters used for color formatting)
        method: replaceFirstMatchWithDebugPrefix,
    },
];

export const ghStdoutTransformer = (rawData: string): string | null => {
    for (const startSubstitution of regexTransformations) {
        const newData = regexTransformation(rawData, startSubstitution.regex, startSubstitution.method);

        if (newData) {
            return newData;
        }
    }

    return prependDebugPrefix(rawData);
};

const regexTransformation = (input: string, regex: RegExp, modifier: (input: string, regex?: RegExp) => string): string | null => {
    const matches = input.match(regex);
    if (matches) {
        return modifier(input, regex);
    }

    return null;
};

function useUnmodifiedString(input: string): string {
    return input;
}

function removeFirstMatch(input: string, regex: RegExp): string {
    return `${input.replace(regex, '$`')}`;
}

function replaceFirstMatchWithDebugPrefix(input: string, regex: RegExp): string {
    return `${debugPrefix}${input.replace(regex, '$`')}`;
}

function replaceFirstMatchWithWarningPrefix(input: string, regex: RegExp): string {
    return `::warning::${input.replace(regex, '$`')}`;
}

function replaceFirstMatchWithErrorPrefix(input: string, regex: RegExp): string {
    return `::error::${input.replace(regex, '$`')}`;
}

function replaceFirstMatchWithGroupPrefix(input: string, regex: RegExp): string {
    return `::group::${input.replace(regex, '$`')}`;
}

function replaceFirstMatchWithEndgroupPrefix(input: string, regex: RegExp): string {
    return `::endgroup::${input.replace(regex, '$`')}`;
}

function prependDebugPrefix(input: string): string {
    return `${debugPrefix}${input}`;
}
