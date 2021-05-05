// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { brand, brandLogoImg, toolName } from '../content/strings';

export const snippet = (text: string): string => {
    return `\`${text}\``;
};

export const link = (href: string, text: string): string => {
    return `[${text}](${href})`;
};

export const image = (altText: string, src: string): string => {
    return `![${altText}](${src})`;
};

export const listItem = (text: string): string => {
    return `* ${text}`;
};

export const heading = (text: string, headingLevel: number): string => {
    return `${'#'.repeat(headingLevel)} ${text}`;
};

export const bold = (text: string): string => {
    return `**${text}**`;
};

export const productTitle = (): string => {
    return `${image(`${brand}`, brandLogoImg)} ${toolName}`;
};

export const footerSeparator = (): string => `---`;

export const sectionSeparator = (): string => '\n';
