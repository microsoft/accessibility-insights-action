// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CombinedReportParameters } from 'accessibility-insights-report';
import { injectable } from 'inversify';
import { ArtifactsInfoProvider } from '../artifacts-info-provider';
import { BaselineInfo } from '../baseline-info';
import { BaselineEvaluation } from 'accessibility-insights-scan';
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

    public buildContent(combinedReportResult: CombinedReportParameters, title?: string, baselineInfo?: BaselineInfo, artifactsInfoProvider?: ArtifactsInfoProvider): string {
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

        // baselining is available
        if (baselineInfo !== undefined) {
            lines = [
                this.headingWithMessage(),
                sectionSeparator(),
                this.failureDetailsBaseline(combinedReportResult, failedChecks, baselineInfo.baselineEvaluation),
                sectionSeparator(),
                this.baselineDetails(baselineInfo, artifactsInfoProvider, failedChecks),
                sectionSeparator(),
                sectionSeparator(),
                this.downloadArtifactsWithLink(failedChecks, artifactsInfoProvider, baselineInfo.baselineEvaluation),
                sectionSeparator(),
                sectionSeparator(),
                footerSeparator(),
                sectionSeparator(),
                heading('Scan summary', 4),
                sectionSeparator(),
                this.urlsListItemBaseline(
                    combinedReportResult.results.urlResults.passedUrls,
                    combinedReportResult.results.urlResults.unscannableUrls,
                    combinedReportResult.results.urlResults.failedUrls,
                ),
                sectionSeparator(),
                this.rulesListItemBaseline(passedChecks, inapplicableChecks, failedChecks),
                sectionSeparator(),
            ];
        }

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

    private baselineDetails = (baselineInfo: BaselineInfo, artifactsInfoProvider: ArtifactsInfoProvider, failedChecks?: number): string => {
        const baselineFileName = baselineInfo.baselineFileName;
        const baselineEvaluation = baselineInfo.baselineEvaluation;
        const baseliningDocsLink = link('temporarily-empty', 'baselining docs'); // TODO update link
        const scanArgumentsLink = link(artifactsInfoProvider.getArtifactsUrl(), 'scan arguments');
        const baselineNotConfiguredHelpText = `A baseline lets you mark known failures so it's easier to identify new failures as they're introduced. See ${baseliningDocsLink} for more.`;
        const baselineNotDetectedHelpText = `To update the baseline with these changes, copy the updated baseline file to ${scanArgumentsLink}. See ${baseliningDocsLink} for more.`;
        let lines = [''];

        if (baselineFileName === undefined) {
            lines = [bold('Baseline not configured'), sectionSeparator(), baselineNotConfiguredHelpText];
        } else if (baselineEvaluation === undefined) {
            lines = [bold('Baseline not detected'), sectionSeparator(), baselineNotDetectedHelpText];
        } else {
            const baselineFailures = baselineEvaluation.totalBaselineViolations;
            if (baselineFailures === undefined || (baselineFailures === 0 && failedChecks > 0)) {
                lines = [bold('Baseline not detected'), sectionSeparator(), baselineNotDetectedHelpText];
            } else if (baselineFailures > 0) {
                const headingWithBaselineFailures = `${baselineFailures} failure instances in baseline`;
                let baselineFailuresHelpText = `not shown; see ${baseliningDocsLink}`;
                if (failedChecks > 0) {
                    baselineFailuresHelpText = baselineFailuresHelpText.concat(' for how to include new failures into the baseline');
                }
                lines = [bold(headingWithBaselineFailures), sectionSeparator(), `(${baselineFailuresHelpText})`];
            }
        }

        return lines.join('');
    };

    private urlsListItem = (passedUrls: number, unscannableUrls: number, failedUrls: number): string => {
        const failedUrlsSummary = `${failedUrls} URL(s) failed, `;
        const passedAndUnscannableUrlsSummary = `${passedUrls} URL(s) passed, and ${unscannableUrls} were not scannable`;
        const urlsSummary = failedUrls === 0 ? passedAndUnscannableUrlsSummary : failedUrlsSummary.concat(passedAndUnscannableUrlsSummary);
        return listItem(`${bold(`URLs`)}: ${urlsSummary}`);
    };

    private urlsListItemBaseline = (passedUrls: number, unscannableUrls: number, failedUrls: number): string => {
        const urlsSummary = `${failedUrls} with failures, ${passedUrls} passed, ${unscannableUrls} not scannable`;
        return `${bold(`URLs`)}: ${urlsSummary}`;
    };

    private rulesListItem = (passedChecks: number, inapplicableChecks: number, failedChecks: number) => {
        const failedRulesSummary = `${failedChecks} check(s) failed, `;
        const passedAndInapplicableRulesSummary = `${passedChecks} check(s) passed, and ${inapplicableChecks} were not applicable`;
        const rulesSummary =
            failedChecks === 0 ? passedAndInapplicableRulesSummary : failedRulesSummary.concat(passedAndInapplicableRulesSummary);
        return listItem(`${bold(`Rules`)}: ${rulesSummary}`);
    };

    private rulesListItemBaseline = (passedChecks: number, inapplicableChecks: number, failedChecks: number) => {
        const rulesSummary = `${failedChecks} with failures, ${passedChecks} passed, ${inapplicableChecks} not applicable`;
        return `${bold(`Rules`)}: ${rulesSummary}`;
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

    private failureDetailsBaseline = (
        combinedReportResult: CombinedReportParameters,
        failedChecks: number,
        baselineEvaluation: BaselineEvaluation,
    ): string => {
        let lines = [];
        if (failedChecks === 0) {
            const checkMark = ':white_check_mark:';
            const pointRight = ':point_right:';
            let failureDetailsHeading = `${checkMark} No failures detected`;
            let failureDetailsDescription = `No failures were detected by automatic scanning.`;
            if (baselineEvaluation !== undefined && baselineEvaluation.totalBaselineViolations > 0) {
                failureDetailsHeading = `${checkMark} No new failures`;
                failureDetailsDescription = 'No failures were detected by automatic scanning except those which exist in the baseline.';
            }
            const nextStepHeading = `${pointRight} Next step:`;
            const tabStopsUrl = `https://accessibilityinsights.io/docs/en/web/getstarted/fastpass/#complete-the-manual-test-for-tab-stops`;
            const tabStopsLink = link(tabStopsUrl, 'Accessibility Insights Tab Stops');
            const nextStepDescription = ` Manually assess keyboard accessibility with ${tabStopsLink}`;

            lines = [
                bold(failureDetailsHeading),
                sectionSeparator(),
                failureDetailsDescription,
                sectionSeparator(),
                sectionSeparator(),
                bold(nextStepHeading),
                nextStepDescription,
                sectionSeparator(),
            ];
        } else {
            const failedRulesList = combinedReportResult.results.resultsByRule.failed.map((failuresGroup) => {
                const failureCount = failuresGroup.failed.length;
                const ruleId = failuresGroup.failed[0].rule.ruleId;
                const ruleDescription = failuresGroup.failed[0].rule.description;
                return [this.failedRuleListItemBaseline(failureCount, ruleId, ruleDescription), sectionSeparator()].join('');
            });
            let failureInstancesHeading = `${failedChecks} failure instances`;
            if (baselineEvaluation !== undefined && baselineEvaluation.totalBaselineViolations > 0) {
                failureInstancesHeading = failureInstancesHeading.concat(' not in baseline');
            }
            lines = [sectionSeparator(), bold(failureInstancesHeading), sectionSeparator(), ...failedRulesList];
        }

        return lines.join('');
    };

    private failedRuleListItemBaseline = (failureCount: number, ruleId: string, description: string) => {
        return listItem(`(${failureCount}) ${bold(escaped(ruleId))}:  ${escaped(description)}`);
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

    private downloadArtifactsWithLink(failedChecks: number, artifactsInfoProvider: ArtifactsInfoProvider, baselineEvaluation?: BaselineEvaluation): string {
        const artifactsLink = link(artifactsInfoProvider.getArtifactsUrl(), 'run artifacts');
        let details = 'all failures and scan details';
        if (failedChecks === 0 && baselineEvaluation !== undefined && !baselineEvaluation.totalBaselineViolations) {
            details = 'scan details';
        }
        return `See ${details} by downloading the report from ${artifactsLink}`;
    }
}
