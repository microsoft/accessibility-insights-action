// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';
import { CombinedReportParameters } from 'accessibility-insights-report';
import { Renderer, marked } from 'marked';
import { BaselineEvaluation } from 'accessibility-insights-scan';

@injectable()
export abstract class ProgressReporter {
    constructor() {
        if (process.env.ACT === 'true') {
            marked.setOptions({
                renderer: new Renderer(),
            });
        }
    }

    public abstract start(): Promise<void>;
    public abstract completeRun(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): Promise<void>;
    public abstract failRun(): Promise<void>;
    public didScanSucceed(): Promise<boolean> {
        return Promise.resolve(true); // Will be overridden in classes that use this
    }

    protected async invoke<T>(fn: () => Promise<T>): Promise<T> {
        return process.env.ACT !== 'true' ? fn() : Promise.resolve(undefined as T);
    }

    protected traceMarkdown(markdown: string): void {
        if (process.env.ACT === 'true') {
            console.log('[ProgressReporter] ===');
            console.log(marked(markdown));
        }
    }
}
