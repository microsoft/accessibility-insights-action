// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// #1575: This file is used to declare types for the wmi-client module that doesn't have type declarations.
// This module is used in install-runtime-dependencies.ts only on windows clients to check if
// the platform has the necessary dependencies to run Chrome.
declare module 'wmi-client' {
    export = wmic;
    class wmic {
        constructor(options?: WMICOptions);
        private _getArgs;
        private _getArgsForLinux;
        private _getArgsForWindows;
        /**
         * Prepeare WQL query
         * @param wql
         * @param namespace
         * @param callback
         * @returns {wmic}
         */
        query(query: string, callback: (err: string, features: Feature[]) => void): wmic;
        wql: string;
        namespace: string;
        private _exec;
        private _wql2wmic;
    }

    interface WMICOptions {
        host: string | null;
        username: string;
        password: string;
        namespace: string;
        timeout: number;
        wmic: string;
        ntlm2: boolean;
        cwd: string;
    }
}
