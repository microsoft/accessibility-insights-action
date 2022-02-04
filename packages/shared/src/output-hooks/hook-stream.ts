// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/unbound-method */

export type StreamTransformer = (data: string) => string;

type WriteFunc = {
    (buffer: string | Uint8Array, cb?: (err?: Error) => void): boolean;
    (str: string | Uint8Array, encoding?: BufferEncoding, cb?: (err?: Error) => void): boolean;
};

export const hookStream = (stream: NodeJS.WriteStream, transformer: (rawData: string) => string): (() => void) => {
    const oldWrite: WriteFunc = stream.write;

    const unhook = () => {
        stream.write = oldWrite;
    };

    const newWrite = (output: string | Uint8Array, encoding?: BufferEncoding, callback?: (err?: Error) => void) => {
        const transformedValue = transformer(String(output));

        if (transformedValue) {
            return oldWrite.call(stream, transformedValue, encoding, callback);
        }

        return false;
    };

    stream.write = newWrite as WriteFunc;

    return unhook;
};
