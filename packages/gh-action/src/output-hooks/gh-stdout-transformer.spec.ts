// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { IMock, Mock, Times } from 'typemoq';
import { ghStdoutTransformer } from './gh-stdout-transformer';

describe(ghStdoutTransformer, () => {
    const rawInput = 'unpreprocessed log data';
    let preprocessorMock: IMock<(rawData: string) => string>;

    beforeEach(() => {
        preprocessorMock = Mock.ofInstance(() => '');
    });

    afterEach(() => {
        preprocessorMock.verifyAll();
    });

    it.each`
        input                         | expectedOutput
        ${'abc'}                      | ${'::debug::abc'}
        ${'\u001B[32mINFO\u001b[39m'} | ${'::debug::\u001B[32mINFO\u001b[39m'}
        ${'Processing page'}          | ${'::debug::Processing page'}
        ${'Discovered 12 links on'}   | ${'::debug::Discovered 12 links on'}
    `(`Debug tag added to raw input - input value '$input' returned as '$expectedOutput'`, ({ input, expectedOutput }) => {
        setupPreprocessor(input);
        const output = ghStdoutTransformer(rawInput, preprocessorMock.object);
        expect(output).toBe(expectedOutput);
    });

    it.each`
        input                             | expectedOutput
        ${'\u001B[32mINFO\u001b[39m '}    | ${'::debug::'}
        ${'\u001B[32mINFO\u001b[39m abc'} | ${'::debug::abc'}
    `(`Debug tag added to modified input - input value '$input' returned as '$expectedOutput'`, ({ input, expectedOutput }) => {
        setupPreprocessor(input);
        const output = ghStdoutTransformer(rawInput, preprocessorMock.object);
        expect(output).toBe(expectedOutput);
    });

    it.each`
        input
        ${'Processing page abc'}
        ${'Discovered 2 links on page abc'}
        ${'Discovered 2345 links on page abc'}
        ${'Found 3 accessibility issues on page abc'}
        ${'Found 3456 accessibility issues on page abc'}
    `(`Debug tag not added - input value '$input' returned as '$input'`, ({ input }) => {
        setupPreprocessor(input);
        const output = ghStdoutTransformer(rawInput, preprocessorMock.object);
        expect(output).toBe(input);
    });

    it.each`
        input              | expectedOutput
        ${'[group]abc'}    | ${'::group::abc'}
        ${'[endgroup]abc'} | ${'::endgroup::abc'}
        ${'[debug]abc'}    | ${'::debug::abc'}
        ${'[warning]abc'}  | ${'::warning::abc'}
        ${'[info]abc'}     | ${'abc'}
    `(`LogLevel tags mapped input as '$input', returned as '$expectedOutput'`, ({ input, expectedOutput }) => {
        setupPreprocessor(input);
        const output = ghStdoutTransformer(rawInput, preprocessorMock.object);
        expect(output).toBe(expectedOutput);
    });

    function setupPreprocessor(processedData: string): void {
        preprocessorMock
            .setup((p) => p(rawInput))
            .returns(() => processedData)
            .verifiable(Times.once());
    }
});
