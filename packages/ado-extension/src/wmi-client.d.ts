/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// #1575: This file is used to declare types for the wmi-client module that doesn't have type declarations.
// This module is used in install-runtime-dependencies.ts only on windows clients to check if
// the platform has the necessary dependencies to run Chrome.
declare module 'wmi-client' {
    declare class WMIC {
        constructor();
        query(query: string, callback: (err: Error, features: Feature[]) => void): void;
    }
}
