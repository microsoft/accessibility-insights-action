// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { ProgressReporter } from './progress-reporter';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { iocTypes } from '../ioc/ioc-types';
import { BaselineEvaluation } from '../baseline-types';
import { Logger } from '../logger/logger';

@injectable()
export class AllProgressReporter extends ProgressReporter {
    constructor(@inject(iocTypes.ProgressReporters) protected readonly progressReporters: ProgressReporter[]) {
        super();
    }

    public async start(logger?: Logger): Promise<void> {
        await this.execute((r) => r.start(), logger);
    }

    public async completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void> {
        if (baselineEvaluation) {
            await this.execute((r) => r.completeRun(combinedReportResult, baselineEvaluation));
        } else {
            await this.execute((r) => r.completeRun(combinedReportResult));
        }
    }

    public async failRun(message: string): Promise<void> {
        await this.execute((r) => r.failRun(message));
    }

    private async execute(callback: (reporter: ProgressReporter) => Promise<void>, logger?: Logger): Promise<void> {
        const length = this.progressReporters.length;
        logger?.logInfo(`DHT - Found ${length} reporters`);
        for (let pos = 0; pos < length; pos += 1) {
            const reporter: ProgressReporter = this.progressReporters[pos];
            logger?.logInfo(`DHT - calling reporter # ${pos}`);
            await callback(reporter);
        }
    }
}
