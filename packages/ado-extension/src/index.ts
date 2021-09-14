// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// import { installRuntimeDependencies } from './install-runtime-dependencies';

// installRuntimeDependencies();
import 'reflect-metadata';

// eslint-disable-next-line @typescript-eslint/no-floating-promises
import('./ado-extension').then((adoExtension) => {
    adoExtension.runScan();
});
