// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { ProgressReporter } from './progress-reporter';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { iocTypes } from '../ioc/ioc-types';

@injectable()
export class AllProgressReporter extends ProgressReporter {
    constructor(@inject(iocTypes.ProgressReporters) protected readonly progressReporters: ProgressReporter[]) {
        super();
    }

    public async start(): Promise<void> {
        await this.execute((r) => r.start());
    }

    public async completeRun(combinedReportResult: CombinedReportParameters): Promise<void> {
        await this.execute((r) => r.completeRun(combinedReportResult));
    }

    public async failRun(message: string): Promise<void> {
        await this.execute((r) => r.failRun(message));
    }

    private async execute(callback: (reporter: ProgressReporter) => Promise<void>): Promise<void> {
        const length = this.progressReporters.length;
        for (let pos = 0; pos < length; pos += 1) {
            await callback(this.progressReporters[pos]);
        }
    }
}
