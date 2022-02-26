// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { adoStdoutTransformer } from './ado-stdout-transformer';

describe(adoStdoutTransformer, () => {
    it.each`
        input                         | expectedOutput
        ${'abc'}                      | ${'##[debug]abc'}
        ${'\u001B[32mINFO\u001b[39m'} | ${'##[debug]\u001B[32mINFO\u001b[39m'}
        ${'Processing page'}          | ${'##[debug]Processing page'}
        ${'Discovered 12 links on'}   | ${'##[debug]Discovered 12 links on'}
    `(`Debug tag added to raw input - input value '$input' returned as '$expectedOutput'`, ({ input, expectedOutput }) => {
        const output = adoStdoutTransformer(input);
        expect(output).toBe(expectedOutput);
    });

    it.each`
        input                             | expectedOutput
        ${'\u001B[32mINFO\u001b[39m '}    | ${'##[debug]'}
        ${'\u001B[32mINFO\u001b[39m abc'} | ${'##[debug]abc'}
    `(`Debug tag added to modified input - input value '$input' returned as '$expectedOutput'`, ({ input, expectedOutput }) => {
        const output = adoStdoutTransformer(input);
        expect(output).toBe(expectedOutput);
    });

    // Note: these are special logging commands in ADO that can't be added to the output text of the test because ADO attempts to evaluate them and fails or throws warnings.
    it.each`
        input                          | expectedOutput                 | safeTextIdentifier
        ${'##vso[task.uploadsummary]'} | ${'##vso[task.uploadsummary]'} | ${'task.uploadsummary'}
        ${'##vso[task.logissue]abc'}   | ${'##vso[task.logissue]abc'}   | ${'task.logissue'}
    `(`ADO Special logging command '$safeTextIdentifier' returns as expected`, ({ input, expectedOutput }) => {
        const output = adoStdoutTransformer(input);
        expect(output).toBe(expectedOutput);
    });

    it.each`
        input
        ${'##vso[task.debug]abc'}
        ${'Processing page abc'}
        ${'Discovered 2 links on page abc'}
        ${'Discovered 2345 links on page abc'}
        ${'Found 3 accessibility issues on page abc'}
        ${'Found 3456 accessibility issues on page abc'}
    `(`Debug tag not added - input value '$input' returned as '$input'`, ({ input }) => {
        const output = adoStdoutTransformer(input);
        expect(output).toBe(input);
    });

    it.each`
        input              | expectedOutput
        ${'[group]abc'}    | ${'##[group]abc'}
        ${'[endgroup]abc'} | ${'##[endgroup]abc'}
        ${'[debug]abc'}    | ${'##[debug]abc'}
        ${'[warning]abc'}  | ${'##[warning]abc'}
        ${'[info]abc'}     | ${'abc'}
    `(`LogLevel tags mapped input as '$input', returned as '$expectedOutput'`, ({ input, expectedOutput }) => {
        const output = adoStdoutTransformer(input);
        expect(output).toBe(expectedOutput);
    });
});
