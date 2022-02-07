// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

type StartSubstitution = {
    oldStart: string;
    newStart: string;
};

const startSubstitutions: StartSubstitution[] = [
    {
        oldStart: '[Trace][info] === ',
        newStart: '##[debug] ',
    },
    {
        oldStart: '\u001B[32mINFO\u001b[39m ', // Includes escape characters used for color formatting
        newStart: '##[debug] ',
    },
    {
        oldStart: 'Processing page ',
        newStart: '##[debug] Processing page ',
    },
];

export const stdoutTransformer = (rawData: string): string => {
    for (const startSubstitution of startSubstitutions) {
        const newData = applySubstitutionAtStart(rawData, startSubstitution.oldStart, startSubstitution.newStart);

        if (newData) {
            return newData;
        }
    }

    return rawData;
};

function applySubstitutionAtStart(rawData: string, oldStart: string, newStart: string): string | null {
    if (rawData.startsWith(oldStart)) {
        return newStart + rawData.substring(oldStart.length);
    }

    return null;
}
