// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { hookStream } from './hook-stream';
import { Writable } from 'stream';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const defaultEncoding = 'buffer';

type WriteCall = {
    chunk: any;
    encoding: BufferEncoding;
    callback: (error?: Error | null) => void;
};

// This class simply records the contents of any _write calls for validation
class TestStream extends Writable {
    private writeCalls: WriteCall[] = [];

    _write = (chunk: any, encoding: BufferEncoding, callback: (error?: Error | null) => void): void => {
        this.writeCalls.push({ chunk, encoding, callback });
    };

    getWriteCalls(): WriteCall[] {
        return this.writeCalls;
    }
}

describe(hookStream, () => {
    let stream: TestStream;

    function testTransformer(input: string): string | null {
        switch (input) {
            case 'return null':
                return null;
            case 'return xyz':
                return 'xyz';
        }

        return input;
    }

    beforeEach(() => {
        stream = new TestStream();
    });

    it.each`
        input
        ${'abc'}
        ${'return xyz'}
        ${'return null'}
    `(`with hook never enabled, input value '$input' writes unchanged'`, ({ input }) => {
        stream.write(input);

        const writeCalls = stream.getWriteCalls();

        expect(writeCalls.length).toBe(1);
        expect(String(writeCalls[0].chunk)).toBe(input);
        expect(writeCalls[0].encoding).toBe(defaultEncoding);
        expect(writeCalls[0].callback).toBeTruthy();
    });

    it.each`
        input            | expectedOutput
        ${'abc'}         | ${'abc'}
        ${'return xyz'}  | ${'xyz'}
        ${'return null'} | ${null}
    `(`with hook enabled, input value '$input' writes as '$expectedOutput'`, ({ input, expectedOutput }) => {
        hookStream(stream as unknown as NodeJS.WriteStream, testTransformer);

        stream.write(input);

        const writeCalls = stream.getWriteCalls();

        if (expectedOutput) {
            expect(writeCalls.length).toBe(1);
            expect(String(writeCalls[0].chunk)).toBe(expectedOutput);
            expect(writeCalls[0].encoding).toBe(defaultEncoding);
            expect(writeCalls[0].callback).toBeTruthy();
        } else {
            expect(writeCalls.length).toBe(0);
        }
    });

    it.each`
        input
        ${'abc'}
        ${'return xyz'}
        ${'return null'}
    `(`with hook enabled then disabled, input value '$input' writes unchanged'`, ({ input }) => {
        const unhook = hookStream(stream as unknown as NodeJS.WriteStream, testTransformer);
        unhook();

        stream.write(input);

        const writeCalls = stream.getWriteCalls();

        expect(writeCalls.length).toBe(1);
        expect(String(writeCalls[0].chunk)).toBe(input);
        expect(writeCalls[0].encoding).toBe(defaultEncoding);
        expect(writeCalls[0].callback).toBeTruthy();
    });
});
