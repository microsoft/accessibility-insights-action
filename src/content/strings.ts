// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { link } from '../utils/markdown-formatter';

export const brand = 'Accessibility Insights';
export const title = `${brand} Action`;
export const productName = title;
export const toolName = title;
export const webToolName = `${brand} Web`;
export const brandLogoImg = 'https://accessibilityinsights.io/img/a11yinsights-blue.svg';
export const checkRunName = 'Accessibility Checks';
export const checkRunDetailsTitle = `Accessibility Automated Checks Results`;
export const assessmentLink = link('https://accessibilityinsights.io/docs/en/web/getstarted/assessment', 'Assessment');
export const webToolLink = link('https://accessibilityinsights.io/docs/en/web/overview', webToolName);
export const wcag21AALink = link('https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa', 'WCAG 2.1 AA');
export const disclaimerText = `The ${toolName} ran a set of automated checks to help find some of the most common accessibility issues. The best way to evaluate web accessibility compliance is to complete an ${assessmentLink} using ${webToolLink}, a free and open source dev tool that walks you through assessing a website for ${wcag21AALink} coverage.`;
