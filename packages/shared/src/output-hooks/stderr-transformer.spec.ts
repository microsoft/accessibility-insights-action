// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { stderrTransformer } from './stderr-transformer';

describe(stderrTransformer, () => {
    it.each`
        input                                   | expectedOutput
        ${'abc'}                                | ${'abc'}
        ${'waitFor is deprecate'}               | ${'waitFor is deprecate'}
        ${'waitFor is deprecated'}              | ${null}
        ${'waitFor is deprecated abc'}          | ${null}
        ${'Some icons were re-registered'}      | ${'Some icons were re-registered'}
        ${'Some icons were re-registered.'}     | ${null}
        ${'Some icons were re-registered. abc'} | ${null}
    `(`input value '$input' returned as '$expectedOutput'`, ({ input, expectedOutput }) => {
        const output = stderrTransformer(input);
        expect(output).toBe(expectedOutput);
    });
});
