// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
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

export const heading = (text: string, headingLevel: number) => {
    return `${'#'.repeat(headingLevel)} ${text}`;
};

export const bold = (text: string) => {
    return `**${text}**`;
};

export const productTitle = (brand: string, brandLogoImg: string) => {
    return `${image(`${brand}`, brandLogoImg)} ${brand}`;
};

export const footerSeparator = () => `---`;

export const sectionSeparator = () => '\n';
