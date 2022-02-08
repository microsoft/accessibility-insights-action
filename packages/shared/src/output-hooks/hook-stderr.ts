// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { stderr } from 'process';
import { hookStream } from './hook-stream';
import { stderrTransformer } from './stderr-transformer';

export const hookStderr = (): (() => void) => {
    return hookStream(stderr, stderrTransformer);
};
