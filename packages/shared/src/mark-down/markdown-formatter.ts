// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';
import { brand, brandLogoImg, toolName } from '../content/strings';
import { OutputFormatter } from '../output/output-formatter';
@injectable()
export class MarkdownOutputFormatter implements OutputFormatter {
    public escaped(text: string): string {
        return text.replace(/</g, '\\<');
    }
    public snippet(text: string): string {
        return `\`${text}\``;
    }
    public link(href: string, text: string): string {
        return `[${text}](${href})`;
    }
    public image(altText: string, src: string): string {
        return `![${altText}](${src})`;
    }
    public listItem(text: string): string {
        return `* ${text}`;
    }
    public heading(text: string, headingLevel: number): string {
        return `${'#'.repeat(headingLevel)} ${text}`;
    }
    public bold(text: string): string {
        return `**${text}**`;
    }
    public productTitle(): string {
        return `${this.image(`${brand}`, brandLogoImg)} ${toolName}`;
    }
    public footerSeparator(): string {
        return `---`;
    }
    public sectionSeparator(): string {
        return '\n';
    }
}
