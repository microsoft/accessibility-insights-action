// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeScanResults } from 'accessibility-insights-scan';

export interface ProgressReporter {
    start(): Promise<void>;

    completeRun(axeScanResults: AxeScanResults): Promise<void>;

    failRun(message: string): Promise<void>;
}
