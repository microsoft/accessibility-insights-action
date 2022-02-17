// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { inject, injectable } from 'inversify';
import { MarkdownOutputFormatter } from '../mark-down/markdown-formatter';
import { toolName, webToolName } from './strings';

@injectable()
export class DisclaimerTextGenerator {
    constructor(@inject(MarkdownOutputFormatter) private readonly markdownOutputFormatter: MarkdownOutputFormatter) {}

    private assessmentLink = this.markdownOutputFormatter.link(
        'https://accessibilityinsights.io/docs/en/web/getstarted/assessment',
        'Assessments',
    );
    private webToolLink = this.markdownOutputFormatter.link('https://accessibilityinsights.io/docs/en/web/overview', webToolName);
    private wcag21AALink = this.markdownOutputFormatter.link(
        'https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa',
        'WCAG 2.1 AA',
    );

    public generateDisclaimerText(): string {
        return `The ${toolName} runs a set of automated checks to help find some of the most common accessibility issues. The automated checks can detect accessibility problems such as missing or invalid properties, but most accessibility problems can only be discovered through manual testing.\n\nWe recommend automated testing, to continuously protect against some common issues, and regular ${this.assessmentLink} using ${this.webToolLink}, a free and open source tool that helps you assess your website or web app for ${this.wcag21AALink} coverage.`;
    }
}
