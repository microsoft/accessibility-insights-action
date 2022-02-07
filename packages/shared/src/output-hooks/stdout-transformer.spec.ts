// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { stdoutTransformer } from './stdout-transformer';

describe(stdoutTransformer, () => {
    it.each`
        input                             | expectedOutput
        ${'abc'}                          | ${'abc'}
        ${'[Trace][info] ==='}            | ${'[Trace][info] ==='}
        ${'[Trace][info] === '}           | ${'##[debug] '}
        ${'[Trace][info] === abc'}        | ${'##[debug] abc'}
        ${'\u001B[32mINFO\u001b[39m'}     | ${'\u001B[32mINFO\u001b[39m'}
        ${'\u001B[32mINFO\u001b[39m '}    | ${'##[debug] '}
        ${'\u001B[32mINFO\u001b[39m abc'} | ${'##[debug] abc'}
        ${'Processing page'}              | ${'Processing page'}
        ${'Processing page '}             | ${'##[debug] Processing page '}
        ${'Processing page abc'}          | ${'##[debug] Processing page abc'}
    `(`input value '$input' returned as '$expectedOutput'`, ({ input, expectedOutput }) => {
        const output = stdoutTransformer(input);
        expect(output).toBe(expectedOutput);
    });
});
