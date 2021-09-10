// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

/* eslint-disable
@typescript-eslint/no-var-requires,
@typescript-eslint/no-unsafe-call,
@typescript-eslint/no-unsafe-member-access,
@typescript-eslint/no-unsafe-assignment,
@typescript-eslint/no-explicit-any
*/

export {};

const moduleRef = require('module');
moduleRef._resolveFilename = new Proxy(moduleRef._resolveFilename, {
    apply(target: any, thisArg: any, argumentsList: any): any {
        const moduleName = argumentsList[0] as string;
        let path = Reflect.apply(target, thisArg, argumentsList) as string;
        if (moduleName.startsWith('@uifabric/styling')) {
            if (require('os').type() === 'Windows_NT') {
                path = path.replace('\\lib\\', '\\lib-commonjs\\');
            } else {
                path = path.replace('/lib/', '/lib-commonjs/');
            }
        }

        return path;
    },
});
