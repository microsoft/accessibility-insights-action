// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { injectable } from 'inversify';
import { toolName } from '../content/strings';
import { OutputFormatter } from '../output/output-formatter';
@injectable()
export class ConsoleLogOutputFormatter implements OutputFormatter {
    public escaped(text: string): string {
        return text;
    }
    public snippet(text: string): string {
        return `\`${text}\``;
    }
    public link(href: string, text: string): string {
        return `${text}: ${href}`;
    }
    public image(altText: string, src: string): string {
        return `![${altText}](${src})`;
    }
    public listItem(text: string): string {
        return `* ${text}`;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public heading(text: string, headingLevel: number): string {
        return text;
    }
    public bold(text: string): string {
        return text;
    }
    public productTitle(): string {
        return `${toolName}`;
    }
    public footerSeparator(): string {
        return `----------------------------------------`;
    }
    public sectionSeparator(): string {
        return '\n';
    }
}
