// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { StreamTransformer } from './stream-transformer';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

// This method hooks a stream at its _write method, which is the lowest level that
// is exposed via the interface. Calling the method returned from hookStream
// removes the hook by restoring the previous _write method.
export const hookStream = (stream: NodeJS.WriteStream, transformer: StreamTransformer): (() => void) => {
    const oldWrite = stream._write;

    const unhook = () => {
        stream._write = oldWrite;
    };

    const newWrite = (chunk: any, encoding: BufferEncoding, callback: (err?: Error) => void) => {
        const transformedValue = transformer(String(chunk));

        if (transformedValue) {
            oldWrite.call(stream, transformedValue, encoding, callback);
        }
    };

    stream._write = newWrite;

    return unhook;
};
