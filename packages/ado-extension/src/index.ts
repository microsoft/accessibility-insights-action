// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { installRuntimeDependencies } from './install-runtime-dependencies';

installRuntimeDependencies();

// eslint-disable-next-line @typescript-eslint/no-floating-promises
import('./ado-extension').then(async (adoExtension) => {
    await adoExtension.runScan();
    process.exit();
});
