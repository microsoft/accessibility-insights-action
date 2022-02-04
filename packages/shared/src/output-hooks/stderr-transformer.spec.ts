// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { stderrTransformer } from './stderr-transformer';

describe(stderrTransformer, () => {
    it.each`
        input                                                                  | expectedOutput
        ${'abc'}                                                               | ${'abc'}
        ${'waitFor is deprecate'}                                              | ${'waitFor is deprecate'}
        ${'waitFor is deprecated'}                                             | ${null}
        ${'waitFor is deprecated abc'}                                         | ${null}
        ${'Warning: Each child in a list should have a unique "key" pro'}      | ${'Warning: Each child in a list should have a unique "key" pro'}
        ${'Warning: Each child in a list should have a unique "key" prop'}     | ${null}
        ${'Warning: Each child in a list should have a unique "key" prop abc'} | ${null}
    `(`input value '$input' returned as '$expectedOutput'`, ({ input, expectedOutput }) => {
        const output = stderrTransformer(input);
        expect(output).toBe(expectedOutput);
    });
});
