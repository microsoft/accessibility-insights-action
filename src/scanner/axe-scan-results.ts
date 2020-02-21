// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AxeResults } from 'axe-core';

export type ScanErrorTypes =
    | 'UrlNavigationTimeout'
    | 'SslError'
    | 'ResourceLoadFailure'
    | 'InvalidUrl'
    | 'EmptyPage'
    | 'HttpErrorCode'
    | 'NavigationError'
    | 'InvalidContentType'
    | 'UrlNotResolved'
    | 'ScanTimeout';

export interface ScanError {
    errorType: ScanErrorTypes;
    message: string;
}

export interface AxeScanResults {
    results?: AxeResults;
    error?: string | ScanError;
    pageResponseCode: number;
    unscannable?: boolean;
    scannedUrl?: string;
    pageTitle?: string;
    browserSpec?: string;
}
