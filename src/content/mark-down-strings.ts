// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { link } from '../mark-down/markdown-formatter';
import { toolName, webToolName } from './strings';

export const assessmentLink = link('https://accessibilityinsights.io/docs/en/web/getstarted/assessment', 'Assessment');
export const webToolLink = link('https://accessibilityinsights.io/docs/en/web/overview', webToolName);
export const wcag21AALink = link('https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa', 'WCAG 2.1 AA');
export const disclaimerText = `The ${toolName} ran a set of automated checks to help find some of the most common accessibility issues. The best way to evaluate web accessibility compliance is to complete an ${assessmentLink} using ${webToolLink}, a free and open source dev tool that walks you through assessing a website for ${wcag21AALink} coverage.`;
