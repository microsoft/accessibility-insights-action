// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

try {
    const url = process.argv.slice(2)[0];
    console.log(`Scanning ${url}`);
} catch (error) {
    console.log('Exception thrown in action: ', error);
    process.exit(1);
}
