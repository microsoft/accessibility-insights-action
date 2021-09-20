// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CombinedReportParameters } from 'accessibility-insights-report';
import { injectable } from 'inversify';
import { brand } from '../content/strings';
import { bold, escaped, footerSeparator, heading, link, listItem, productTitle, sectionSeparator } from './markdown-formatter';

@injectable()
export class ResultMarkdownBuilder {
    public buildErrorContent(): string {
        const lines = [
            this.headingWithMessage('Something went wrong'),
            sectionSeparator(),
            `You can review the log to troubleshoot the issue. Fix it and re-run the workflow to run the automated accessibility checks again.`,
            sectionSeparator(),
        ];

        return this.scanResultDetails(lines.join(''));
    }

    public buildContent(combinedReportResult: CombinedReportParameters, title?: string): string {
        const passedChecks = combinedReportResult.results.resultsByRule.passed.length;
        const inapplicableChecks = combinedReportResult.results.resultsByRule.notApplicable.length;
        const failedChecks = combinedReportResult.results.resultsByRule.failed.reduce((a, b) => a + b.failed.length, 0);

        let lines = [
            failedChecks === 0 ? this.headingWithMessage('All applicable checks passed') : this.headingWithMessage(),
            sectionSeparator(),
            this.urlsListItem(
                combinedReportResult.results.urlResults.passedUrls,
                combinedReportResult.results.urlResults.unscannableUrls,
                combinedReportResult.results.urlResults.failedUrls,
            ),
            sectionSeparator(),
            this.rulesListItem(passedChecks, inapplicableChecks, failedChecks),
            sectionSeparator(),

            this.downloadArtifacts(),
            this.failureDetails(combinedReportResult),
        ];

        if (title !== undefined) {
            lines = [heading(title, 3), sectionSeparator()].concat(lines);
        }

        return this.scanResultDetails(lines.join(''), this.scanResultFooter(combinedReportResult));
    }

    private headingWithMessage = (message?: string): string => {
        if (message) {
            return heading(`${productTitle()}: ${message}`, 3);
        }
        return heading(`${productTitle()}`, 3);
    };

    private urlsListItem = (passedUrls: number, unscannableUrls: number, failedUrls: number): string => {
        const failedUrlsSummary = `${failedUrls} URL(s) failed, `;
        const passedAndUnscannableUrlsSummary = `${passedUrls} URL(s) passed, and ${unscannableUrls} were not scannable`;
        const urlsSummary = failedUrls === 0 ? passedAndUnscannableUrlsSummary : failedUrlsSummary.concat(passedAndUnscannableUrlsSummary);
        return listItem(`${bold(`URLs`)}: ${urlsSummary}`);
    };

    private rulesListItem = (passedChecks: number, inapplicableChecks: number, failedChecks: number) => {
        const failedRulesSummary = `${failedChecks} check(s) failed, `;
        const passedAndInapplicableRulesSummary = `${passedChecks} check(s) passed, and ${inapplicableChecks} were not applicable`;
        const rulesSummary =
            failedChecks === 0 ? passedAndInapplicableRulesSummary : failedRulesSummary.concat(passedAndInapplicableRulesSummary);
        return listItem(`${bold(`Rules`)}: ${rulesSummary}`);
    };

    private failureDetails = (combinedReportResult: CombinedReportParameters): string => {
        if (combinedReportResult.results.resultsByRule.failed.length === 0) {
            return '';
        }

        const failedRulesList = combinedReportResult.results.resultsByRule.failed.map((failuresGroup) => {
            const failureCount = failuresGroup.failed.length;
            const ruleId = failuresGroup.failed[0].rule.ruleId;
            const ruleDescription = failuresGroup.failed[0].rule.description;
            return [this.failedRuleListItem(failureCount, ruleId, ruleDescription), sectionSeparator()].join('');
        });
        const lines = [sectionSeparator(), `${heading('Failed instances', 4)}`, sectionSeparator(), ...failedRulesList];

        return lines.join('');
    };

    private failedRuleListItem = (failureCount: number, ruleId: string, description: string) => {
        return listItem(`${bold(`${failureCount} × ${escaped(ruleId)}`)}:  ${escaped(description)}`);
    };

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
        const artifactName = `${brand} artifact`;
        return listItem(`Download the ${bold(artifactName)} to view the detailed results of these checks`);
    }
}
