// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeScanResults } from 'accessibility-insights-scan';
import * as axe from 'axe-core';
import { injectable } from 'inversify';

import { brand, brandLogoImg } from '../content/strings';
import { bold, footerSeparator, heading, link, listItem, productTitle, sectionSeparator } from '../utils/markdown-formatter';

@injectable()
export class CheckResultMarkdownBuilder {
    public failureDetails = (axeScanResults: AxeScanResults): string => {
        const failedRulesList = axeScanResults.results.violations.map((rule: axe.Result) => {
            return [this.failedRuleListItem(rule.nodes.length, rule.id, rule.description), sectionSeparator()].join('');
        });
        const sections = [
            this.failureSummary(
                axeScanResults.results.violations.length,
                axeScanResults.results.passes.length,
                axeScanResults.results.inapplicable.length,
            ),
            sectionSeparator(),

            `${heading('Failed instances', 4)}`,
            sectionSeparator(),
        ];

        return this.scanResultDetails(sections.concat(failedRulesList).join(''), this.scanResultFooter(axeScanResults));
    };

    public errorContent = (): string => {
        const lines = [
            heading(`${productTitle()}: Something went wrong`, 3),
            sectionSeparator(),

            `You can review the log to troubleshoot the issue. Fix it and re-run the workflow to run the automated accessibility checks again.`,
            sectionSeparator(),
        ];

        return this.scanResultDetails(lines.join(''));
    };

    public congratsContent = (axeScanResults: AxeScanResults): string => {
        const passed = axeScanResults.results.passes.length;
        const inapplicable = axeScanResults.results.inapplicable.length;
        const lines = [
            heading(`${productTitle()}: All applicable checks passed`, 3),
            sectionSeparator(),

            listItem(`${bold(`${passed} check(s) passed`)}, and ${inapplicable} were not applicable`),
            sectionSeparator(),

            this.downloadArtifacts(),
        ];

        return this.scanResultDetails(lines.join(''), this.scanResultFooter(axeScanResults));
    };

    private readonly scanResultDetails = (scanResult: string, footer?: string): string => {
        const lines = [scanResult, sectionSeparator(), footerSeparator(), sectionSeparator(), footer];

        return lines.join('');
    };

    private readonly scanResultFooter = (axeScanResults: AxeScanResults): string => {
        const axeVersion = axeScanResults.results.testEngine.version;
        const axeCoreUrl = `https://github.com/dequelabs/axe-core/releases/tag/v${axeVersion}`;
        const axeLink = link(axeCoreUrl, `axe-core ${axeVersion}`);

        return `This scan used ${axeLink} with ${axeScanResults.browserSpec}.`;
    };

    private readonly failureSummary = (failed: number, passed: number, inapplicable: number) => {
        const lines = [
            heading(`${productTitle()}`, 3),
            sectionSeparator(),

            listItem(`${bold(`${failed} check(s) failed`)}, ${passed} passed, and ${inapplicable} were not applicable`),
            sectionSeparator(),
            this.downloadArtifacts(),
        ];

        return lines.join('');
    };

    private readonly failedRuleListItem = (failureCount: number, ruleId: string, description: string) => {
        return listItem(`${bold(`${failureCount} × ${ruleId}`)}:  ${description}`);
    };

    private readonly downloadArtifacts = () => {
        return listItem(`Download the ${bold(brand)} artifact to view the detailed results of these checks`);
    };
}
