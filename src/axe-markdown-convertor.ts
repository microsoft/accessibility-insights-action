// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeScanResults } from 'accessibility-insights-scan';
import { inject, injectable } from 'inversify';
import { isEmpty } from 'lodash';

import { CheckResultMarkdownBuilder } from './check-result-markdown-builder';

@injectable()
export class AxeMarkdownConvertor {
    constructor(@inject(CheckResultMarkdownBuilder) private readonly checkResultMarkdownBuilder: CheckResultMarkdownBuilder) {}

    public convert(axeScanResults: AxeScanResults): string {
        if (isEmpty(axeScanResults.results.violations)) {
            return this.checkResultMarkdownBuilder.congratsContent(axeScanResults);
        } else {
            return this.checkResultMarkdownBuilder.failureDetails(axeScanResults);
        }
    }

    public getErrorMarkdown(): string {
        return this.checkResultMarkdownBuilder.errorContent();
    }
}
