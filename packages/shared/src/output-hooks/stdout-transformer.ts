// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { stderr } from 'process';

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
        oldStart: '\u001B[32mINFO\u001b[39m ', // The initial characters are escape characters used for color formatting
        newStart: '##[debug]',
    },
];

export const stdoutTransformer = (rawData: string): string => {
    for (const startSubstitution of startSubstitutions) {
        const newData = makeSubstitutionAtStart(rawData, startSubstitution.oldStart, startSubstitution.newStart);
        if (newData) return newData;
    }

    return rawData;
};

function makeSubstitutionAtStart(rawData: string, oldStart: string, newStart: string): string | null {
    if (rawData.startsWith(oldStart)) {
        return newStart + rawData.substring(oldStart.length);
    }

    return null;
}
