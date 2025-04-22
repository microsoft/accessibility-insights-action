// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { installRuntimeDependencies } from './install-runtime-dependencies';

installRuntimeDependencies();

 
import('./ado-extension').then(async (adoExtension) => {
    await adoExtension.runScan();
    process.exit();
});
