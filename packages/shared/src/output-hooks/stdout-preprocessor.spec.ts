// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { stdoutPreprocessor } from './stdout-preprocessor';

describe(stdoutPreprocessor, () => {
    it('Leaves logs as-is if they contain nothing that should be filtered', () => {
        const input = 'Just your average log message';

        const output = stdoutPreprocessor(input);

        expect(output).toBe(input);
    });

    it('removes info about --updateBaseline from output', () => {
        const input =
            'To update the baseline with these changes, either rerun with --updateBaseline or copy the updated baseline file to /path/to/test.baseline';

        const output = stdoutPreprocessor(input);

        expect(output).toBe('To update the baseline with these changes, copy the updated baseline file to /path/to/test.baseline');
    });
});
