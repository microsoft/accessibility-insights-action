// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { stdout } from 'process';
import { hookStream } from './hook-stream';
import { StreamTransformer } from './stream-transformer';

export const hookStdout = (transformer: StreamTransformer): (() => void) => {
    return hookStream(stdout, transformer);
};
