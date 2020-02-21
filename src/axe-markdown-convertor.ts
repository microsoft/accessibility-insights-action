// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { AxeScanResults } from 'accessibility-insights-scan';
import { stripIndent } from 'common-tags';
import { injectable } from 'inversify';
import { isEmpty } from 'lodash';
import * as table from 'markdown-table';

import { toolName } from './content/strings';

@injectable()
export class AxeMarkdownConvertor {
    public convert(axeScanResults: AxeScanResults): string {
        if (isEmpty(axeScanResults.results.violations)) {
            return this.getCongratsText();
        }

        return this.getFailureDetails(axeScanResults);
    }

    private getFailureDetails(axeScanResults: AxeScanResults): string {
        return stripIndent`
        FAILED RULES:

${this.getFailedRuleTable(axeScanResults)}
        `;
    }

    private getCongratsText(): string {
        return stripIndent`
            Congratulations!
            No failed automated checks were found by ${toolName}
        `;
    }

    private getFailedRuleTable(axeScanResults: AxeScanResults): string {
        const tableContent: string[][] = [['Rule', 'Count']];

        const violations = axeScanResults.results.violations;

        violations.forEach(violation => {
            const row: string[] = [violation.id, violation.nodes.length.toString()];
            tableContent.push(row);
        });

        return table(tableContent);
    }
}
