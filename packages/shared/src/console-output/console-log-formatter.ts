// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { toolName } from '../content/strings';

export const link = (href: string, text: string): string => {
    return `${text} (${href})`;
};

export const listItem = (text: string): string => {
    return `* ${text}`;
};

export const productTitle = (): string => {
    return `${toolName}`;
};

export const footerSeparator = (): string => `-------------------`;

export const sectionSeparator = (): string => '\n';
