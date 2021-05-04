// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CombinedReportParameters } from 'accessibility-insights-report';

export interface ProgressReporter {
    start(): Promise<void>;
    completeRun(combinedReportResult: CombinedReportParameters): Promise<void>;
    failRun(message: string): Promise<void>;
}
