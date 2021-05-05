// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';
import { CombinedReportParameters } from 'accessibility-insights-report';
import * as marked from 'marked';
import * as TerminalRenderer from 'marked-terminal';

@injectable()
export abstract class ProgressReporter {
    constructor() {
        if (process.env.ACT === 'true') {
            marked.setOptions({
                renderer: new TerminalRenderer(),
            });
        }
    }

    public abstract start(): Promise<void>;
    public abstract completeRun(combinedReportResult: CombinedReportParameters): Promise<void>;
    public abstract failRun(message: string): Promise<void>;

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
