// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { stdout } from 'process';
import { hookStream } from './hook-stream';
import { stdoutTransformer } from './stdout-transformer';

export const hookStdout = (): (() => void) => {
    return hookStream(stdout, stdoutTransformer);
};
