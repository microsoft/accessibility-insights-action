// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export interface OutputFormatter {
    escaped(text: string): string;
    snippet(text: string): string;
    link(href: string, text: string): string;
    image(altText: string, src: string): string;
    listItem(text: string): string;
    heading(text: string, headingLevel: number): string;
    bold(text: string): string;
    productTitle(): string;
    footerSeparator(): string;
    sectionSeparator(): string;
}
