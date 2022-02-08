// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */

export type StreamTransformer = (data: string) => string;

// This method hooks a stream at its _write method, which is the lowest level that
// is exposed via the interface. Calling the method returned from hookStream
// removes the hook by restoring the previous _write method.
export const hookStream = (stream: NodeJS.WriteStream, transformer: (rawData: string) => string): (() => void) => {
    const oldWrite = (chunk: any, encoding: BufferEncoding, callback: (error?: Error) => void) => {
        return stream._write(chunk, encoding, callback);
    };

    const unhook = () => {
        stream._write = oldWrite;
    };

    const newWrite = (chunk: any, encoding: BufferEncoding, callback: (error?: Error) => void): void => {
        const transformedValue = transformer(String(chunk));

        if (transformedValue) {
            oldWrite.call(stream, transformedValue, encoding, callback);
        }
    };

    stream._write = newWrite;

    return unhook;
};
