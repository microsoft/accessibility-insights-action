// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { stdoutTransformer } from './stdout-transformer';

describe(stdoutTransformer, () => {
    it.each`
        input                         | expectedOutput
        ${'abc'}                      | ${'##[debug] abc'}
        ${'[Trace][info] ==='}        | ${'##[debug] [Trace][info] ==='}
        ${'\u001B[32mINFO\u001b[39m'} | ${'##[debug] \u001B[32mINFO\u001b[39m'}
        ${'Processing page'}          | ${'##[debug] Processing page'}
        ${'Discovered 12 links on'}   | ${'##[debug] Discovered 12 links on'}
    `(`Debug tag added to raw input - input value '$input' returned as '$expectedOutput'`, ({ input, expectedOutput }) => {
        const output = stdoutTransformer(input);
        expect(output).toBe(expectedOutput);
    });

    it.each`
        input                             | expectedOutput
        ${'[Trace][info] === '}           | ${'##[debug] '}
        ${'[Trace][info] === abc'}        | ${'##[debug] abc'}
        ${'\u001B[32mINFO\u001b[39m '}    | ${'##[debug] '}
        ${'\u001B[32mINFO\u001b[39m abc'} | ${'##[debug] abc'}
    `(`Debug tag added to modified input - input value '$input' returned as '$expectedOutput'`, ({ input, expectedOutput }) => {
        const output = stdoutTransformer(input);
        expect(output).toBe(expectedOutput);
    });

    it.each`
        input
        ${'##[error] abc'}
        ${'##[debug] abc'}
        ${'##vso[task.debug] abc'}
        ${'Processing page abc'}
        ${'Discovered 2 links on page abc'}
        ${'Discovered 2345 links on page abc'}
        ${'Found 3 accessibility issues on page abc'}
        ${'Found 3456 accessibility issues on page abc'}
    `(`Debug tag not added - input value '$input' returned as '$input'`, ({ input }) => {
        const output = stdoutTransformer(input);
        expect(output).toBe(input);
    });
});
