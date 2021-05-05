// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { link } from '../mark-down/markdown-formatter';
import { toolName, webToolName } from './strings';

export const assessmentLink = link('https://accessibilityinsights.io/docs/en/web/getstarted/assessment', 'Assessments');
export const webToolLink = link('https://accessibilityinsights.io/docs/en/web/overview', webToolName);
export const wcag21AALink = link('https://www.w3.org/WAI/WCAG21/quickref/?currentsidebar=%23col_customize&levels=aaa', 'WCAG 2.1 AA');
export const disclaimerText = `The ${toolName} runs a set of automated checks to help find some of the most common accessibility issues. The automated checks can detect accessibility problems such as missing or invalid properties, but most accessibility problems can only be discovered through manual testing.\n\nWe recommend automated testing, to continuously protect against some common issues, and regular ${assessmentLink} using ${webToolLink}, a free and open source tool that helps you assess your website or web app for ${wcag21AALink} coverage.`;
