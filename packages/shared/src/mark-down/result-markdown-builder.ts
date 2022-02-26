// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { CombinedReportParameters } from 'accessibility-insights-report';
import { inject, injectable } from 'inversify';
import { ArtifactsInfoProvider } from '../artifacts-info-provider';
import { BaselineInfo } from '../baseline-info';
import { BaselineEvaluation } from 'accessibility-insights-scan';
import { brand } from '../content/strings';
import { bold, escaped, footerSeparator, heading, link, listItem, productTitle, sectionSeparator } from './markdown-formatter';
import { iocTypes } from '../ioc/ioc-types';

@injectable()
export class ResultMarkdownBuilder {
    constructor(@inject(iocTypes.ArtifactsInfoProvider) private readonly artifactsInfoProvider: ArtifactsInfoProvider) {}

    public buildErrorContent(): string {
        const lines = [
            this.headingWithMessage('Something went wrong'),
            sectionSeparator(),
            `You can review the log to troubleshoot the issue. Fix it and re-run the workflow to run the automated accessibility checks again.`,
            sectionSeparator(),
        ];

        return this.scanResultDetails(lines.join(''));
    }

    public buildContent(combinedReportResult: CombinedReportParameters, title?: string, baselineInfo?: BaselineInfo): string {
        const passedChecks = combinedReportResult.results.resultsByRule.passed.length;
        const inapplicableChecks = combinedReportResult.results.resultsByRule.notApplicable.length;
        const failedChecks = combinedReportResult.results.resultsByRule.failed.length;

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
                this.fixedFailureDetails(baselineInfo),
                this.failureDetailsBaseline(combinedReportResult, baselineInfo),
                sectionSeparator(),
                this.baselineDetails(baselineInfo),
                sectionSeparator(),
                sectionSeparator(),
                this.downloadArtifactsWithLink(combinedReportResult, baselineInfo.baselineEvaluation),
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

    private baselineDetails = (baselineInfo: BaselineInfo): string => {
        const baselineFileName = baselineInfo.baselineFileName;
        const baselineEvaluation = baselineInfo.baselineEvaluation;
        const baseliningDocsUrl = `https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md#using-a-baseline-file`;
        const baseliningDocsLink = link(baseliningDocsUrl, 'baselining docs');
        const scanArgumentsLink = link(this.artifactsInfoProvider.getArtifactsUrl(), 'scan arguments');
        const baselineNotConfiguredHelpText = `A baseline lets you mark known failures so it's easier to identify new failures as they're introduced. See ${baseliningDocsLink} for more.`;
        const baselineNotDetectedHelpText = `To update the baseline with these changes, copy the updated baseline file to ${scanArgumentsLink}. See ${baseliningDocsLink} for more.`;
        let lines = [''];

        if (baselineFileName === undefined) {
            lines = [bold('Baseline not configured'), sectionSeparator(), baselineNotConfiguredHelpText];
        } else if (baselineEvaluation === undefined) {
            lines = [bold('Baseline not detected'), sectionSeparator(), baselineNotDetectedHelpText];
        } else {
            const newFailures = baselineEvaluation.totalNewViolations;
            const baselineFailures = baselineEvaluation.totalBaselineViolations;
            if (baselineFailures === undefined || (baselineFailures === 0 && newFailures > 0)) {
                lines = [bold('Baseline not detected'), sectionSeparator(), baselineNotDetectedHelpText];
            } else if (baselineFailures > 0 || this.shouldUpdateBaselineFile(baselineEvaluation)) {
                const headingWithBaselineFailures = `${baselineFailures} failure instances in baseline`;
                let baselineFailuresHelpText = `not shown; see ${baseliningDocsLink}`;
                if (this.shouldUpdateBaselineFile(baselineEvaluation)) {
                    baselineFailuresHelpText = baselineFailuresHelpText.concat(' for how to integrate your changes into the baseline');
                }
                lines = [bold(headingWithBaselineFailures), sectionSeparator(), `(${baselineFailuresHelpText})`];
            }
        }

        return lines.join('');
    };

    private shouldUpdateBaselineFile(baselineEvaluation: BaselineEvaluation): boolean {
        return baselineEvaluation && baselineEvaluation.suggestedBaselineUpdate ? true : false;
    }

    private hasFixedFailureResults(baselineEvaluation: BaselineEvaluation): boolean {
        if (baselineEvaluation && baselineEvaluation.fixedViolationsByRule) {
            for (const _ in baselineEvaluation.fixedViolationsByRule) {
                return true;
            }
        }

        return false;
    }

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

    private fixedFailureDetails = (baselineInfo: BaselineInfo): string => {
        if (!baselineInfo || !this.hasFixedFailureResults(baselineInfo.baselineEvaluation)) {
            return sectionSeparator();
        }

        let totalFixedFailureInstanceCount = 0;
        const fixedFailureInstanceLines = [];
        for (const ruleId in baselineInfo.baselineEvaluation.fixedViolationsByRule) {
            const fixedFailureInstanceCount = baselineInfo.baselineEvaluation.fixedViolationsByRule[ruleId];
            totalFixedFailureInstanceCount += fixedFailureInstanceCount;
            fixedFailureInstanceLines.push(
                [this.fixedRuleListItemBaseline(fixedFailureInstanceCount, ruleId), sectionSeparator()].join(''),
            );
        }

        const lines = [
            sectionSeparator(),
            bold(`${totalFixedFailureInstanceCount} failure instances from baseline no longer exist:`),
            sectionSeparator(),
            ...fixedFailureInstanceLines,
        ];
        return lines.join('');
    };

    private failureDetailsBaseline = (combinedReportResult: CombinedReportParameters, baselineInfo: BaselineInfo): string => {
        let lines = [];
        if (
            this.hasFailures(combinedReportResult, baselineInfo.baselineEvaluation) ||
            this.shouldUpdateBaselineFile(baselineInfo.baselineEvaluation)
        ) {
            const failedRulesList = this.getFailedRulesList(combinedReportResult, baselineInfo.baselineEvaluation);
            const failureInstances = this.getFailureInstances(combinedReportResult, baselineInfo.baselineEvaluation);
            const failureInstancesHeading = this.getFailureInstancesHeading(failureInstances, baselineInfo.baselineEvaluation);
            lines = [sectionSeparator(), bold(failureInstancesHeading), sectionSeparator(), ...failedRulesList];
        } else {
            lines = [sectionSeparator(), ...this.getNoFailuresText(baselineInfo.baselineEvaluation)];
        }

        return lines.join('');
    };

    private getNoFailuresText = (baselineEvaluation: BaselineEvaluation): string[] => {
        const checkMark = ':white_check_mark:';
        const pointRight = ':point_right:';
        let failureDetailsHeading = `${checkMark} No failures detected`;
        let failureDetailsDescription = `No failures were detected by automatic scanning.`;
        if (this.baselineHasFailures(baselineEvaluation)) {
            failureDetailsHeading = `${checkMark} No new failures`;
            failureDetailsDescription = 'No failures were detected by automatic scanning except those which exist in the baseline.';
        }
        const nextStepHeading = `${pointRight} Next step:`;
        const tabStopsUrl = `https://accessibilityinsights.io/docs/en/web/getstarted/fastpass/#complete-the-manual-test-for-tab-stops`;
        const tabStopsLink = link(tabStopsUrl, 'Accessibility Insights Tab Stops');
        const nextStepDescription = ` Manually assess keyboard accessibility with ${tabStopsLink}`;

        return [
            bold(failureDetailsHeading),
            sectionSeparator(),
            failureDetailsDescription,
            sectionSeparator(),
            sectionSeparator(),
            bold(nextStepHeading),
            nextStepDescription,
            sectionSeparator(),
        ];
    };

    private getTotalFailureInstancesFromResults = (combinedReportResult: CombinedReportParameters): number => {
        return combinedReportResult.results.resultsByRule.failed.reduce((a, b) => a + b.failed.reduce((c, d) => c + d.urls.length, 0), 0);
    };

    private getFailureInstances = (combinedReportResult: CombinedReportParameters, baselineEvaluation: BaselineEvaluation): number => {
        if (baselineEvaluation) {
            return baselineEvaluation.totalNewViolations;
        }

        return this.getTotalFailureInstancesFromResults(combinedReportResult);
    };

    private getFailureInstancesHeading = (failureInstances: number, baselineEvaluation: BaselineEvaluation): string => {
        let failureInstancesHeading = `${failureInstances} failure instances`;
        if (this.baselineHasFailures(baselineEvaluation)) {
            failureInstancesHeading = failureInstancesHeading.concat(' not in baseline');
        }

        return failureInstancesHeading;
    };

    private getFailedRulesList = (combinedReportResult: CombinedReportParameters, baselineEvaluation: BaselineEvaluation): string[] => {
        if (baselineEvaluation) {
            return this.getNewFailuresList(combinedReportResult, baselineEvaluation);
        }

        return this.getFailedRulesListWithNoBaseline(combinedReportResult);
    };

    private getNewFailuresList = (combinedReportResult: CombinedReportParameters, baselineEvaluation: BaselineEvaluation): string[] => {
        const newFailuresList = [];
        for (const ruleId in baselineEvaluation.newViolationsByRule) {
            const failureCount = baselineEvaluation.newViolationsByRule[ruleId];
            const ruleDescription = this.getRuleDescription(combinedReportResult, ruleId);
            newFailuresList.push([this.failedRuleListItemBaseline(failureCount, ruleId, ruleDescription), sectionSeparator()].join(''));
        }

        return newFailuresList;
    };

    private getFailedRulesListWithNoBaseline = (combinedReportResult: CombinedReportParameters): string[] => {
        const failedRulesList = combinedReportResult.results.resultsByRule.failed.map((failuresGroup) => {
            const failureCount = failuresGroup.failed.reduce((a, b) => a + b.urls.length, 0);
            const ruleId = failuresGroup.failed[0].rule.ruleId;
            const ruleDescription = failuresGroup.failed[0].rule.description;
            return [this.failedRuleListItemBaseline(failureCount, ruleId, ruleDescription), sectionSeparator()].join('');
        });

        return failedRulesList;
    };

    private getRuleDescription = (combinedReportResult: CombinedReportParameters, ruleId: string): string => {
        const matchingFailuresGroup = combinedReportResult.results.resultsByRule.failed.find((failuresGroup) => {
            return failuresGroup.failed[0].rule.ruleId === ruleId;
        });

        return matchingFailuresGroup.failed[0].rule.description;
    };

    private failedRuleListItemBaseline = (failureCount: number, ruleId: string, description: string) => {
        return listItem(`(${failureCount}) ${bold(escaped(ruleId))}:  ${escaped(description)}`);
    };

    private fixedRuleListItemBaseline = (failureCount: number, ruleId: string) => {
        return listItem(`(${failureCount}) ${bold(escaped(ruleId))}`);
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

    private downloadArtifactsWithLink(combinedReportResult: CombinedReportParameters, baselineEvaluation?: BaselineEvaluation): string {
        const artifactsLink = link(this.artifactsInfoProvider.getArtifactsUrl(), 'run artifacts');
        let details = 'all failures and scan details';
        if (!this.baselineHasFailures(baselineEvaluation) && !this.hasFailures(combinedReportResult, baselineEvaluation)) {
            details = 'scan details';
        }
        return `See ${details} by downloading the report from ${artifactsLink}`;
    }

    private baselineHasFailures = (baselineEvaluation: BaselineEvaluation): boolean => {
        return (
            baselineEvaluation !== undefined && baselineEvaluation.totalBaselineViolations && baselineEvaluation.totalBaselineViolations > 0
        );
    };

    private hasFailures = (combinedReportResult: CombinedReportParameters, baselineEvaluation: BaselineEvaluation): boolean => {
        if (baselineEvaluation !== undefined) {
            return baselineEvaluation.totalNewViolations > 0;
        }

        return this.getTotalFailureInstancesFromResults(combinedReportResult) > 0;
    };
}
