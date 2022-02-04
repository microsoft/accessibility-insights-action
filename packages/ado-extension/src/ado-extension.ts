// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import 'reflect-metadata';
import './module-name-mapper';

import { Logger } from '@accessibility-insights-action/shared';
import { Scanner } from '@accessibility-insights-action/shared';
import { setupIocContainer } from './ioc/setup-ioc-container';
import { hookStderr } from '@accessibility-insights-action/shared';
import { hookStdout } from '@accessibility-insights-action/shared';

export function runScan() {
    (async () => {
        hookStderr();
        hookStdout();

        // function hookOutputStream(stream: NodeJS.WriteStream, callback: any) {
        //     const old_write = stream.write;

        //     console.log('DHT = input = ')
        //     const y = function (buffer: string | Uint8Array, cb?: ((err?: Error | undefined) => void) | undefined): boolean || (str: string | Uint8Array, encoding?: BufferEncoding | undefined, cb?: ((err?: Error | undefined) => void) | undefined): boolean) {}

        //     const x = function(buffer: any, encoding: any, fd: any) {
        //         const updatedString = callback(buffer);

        //         if (updatedString) {
        //             old_write(updatedString, encoding, fd);
        //         }
        //     }

        //     stream.write = x;
        // }

        // // hookOutputStream(process.stdout, function(buffer: string): string | null {
        // //     return buffer;
        // // });

        // hookOutputStream(process.stderr, function(buffer: string): string | null {
        //     if (buffer.startsWith('waitFor')) return null;

        //     return buffer;
        // });

        const container = setupIocContainer();
        const logger = container.get(Logger);
        await logger.setup();

        const scanner = container.get(Scanner);
        await scanner.scan();
    })().catch((error) => {
        console.log('Exception thrown in extension: ', error);
        process.exit(1);
    });
}
