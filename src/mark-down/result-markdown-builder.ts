// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';
import { brand } from '../content/strings';
import { bold, footerSeparator, heading, link, listItem, productTitle, sectionSeparator } from './markdown-formatter';
import { CombinedReportParameters } from 'accessibility-insights-report';

@injectable()
export class ResultMarkdownBuilder {
    public buildErrorContent(): string {
        const lines = [
            heading(`${productTitle()}: Something went wrong`, 3),
            sectionSeparator(),
            `You can review the log to troubleshoot the issue. Fix it and re-run the workflow to run the automated accessibility checks again.`,
            sectionSeparator(),
        ];

        return this.scanResultDetails(lines.join(''));
    }

    public buildContent(combinedReportResult: CombinedReportParameters): string {
        const passedChecks = combinedReportResult.results.resultsByRule.passed.length;
        const inapplicableChecks = combinedReportResult.results.resultsByRule.notApplicable.length;
        const failedChecks = combinedReportResult.results.resultsByRule.failed.reduce((a, b) => a + b.failed.length, 0);

        const lines = [
            heading(`${productTitle()}`, 3),
            sectionSeparator(),
            listItem(
                `${bold(
                    `Rules`,
                )}: ${failedChecks} check(s) failed, ${passedChecks} check(s) passed, and ${inapplicableChecks} were not applicable`,
            ),
            sectionSeparator(),
            listItem(
                `${bold(`URLs`)}: ${combinedReportResult.results.urlResults.failedUrls} URL(s) failed, ${
                    combinedReportResult.results.urlResults.passedUrls
                } URL(s) passed, and ${combinedReportResult.results.urlResults.unscannableUrls} were not scannable`,
            ),
            sectionSeparator(),

            this.downloadArtifacts(),
        ];

        return this.scanResultDetails(lines.join(''), this.scanResultFooter(combinedReportResult));
    }

    private scanResultDetails(scanResult: string, footer?: string): string {
        const lines = [scanResult, sectionSeparator(), footerSeparator(), sectionSeparator(), footer];

        return lines.join('');
    }

    private scanResultFooter(combinedReportResult: CombinedReportParameters): string {
        const axeVersion = combinedReportResult.axeVersion;
        const axeCoreUrl = `https://github.com/dequelabs/axe-core/releases/tag/v${axeVersion}`;
        const axeLink = link(axeCoreUrl, `axe-core ${axeVersion}`);

        return `This scan used ${axeLink} with ${combinedReportResult.userAgent}.`;
    }

    private downloadArtifacts(): string {
        return listItem(`Download the ${bold(brand)} artifact to view the detailed results of these checks`);
    }
}
