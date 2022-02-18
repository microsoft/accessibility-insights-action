// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';
import { IMock, Mock } from 'typemoq';
import { MarkdownOutputFormatter } from '../mark-down/markdown-output-formatter';
import { DisclaimerTextGenerator } from './disclaimer-text-generator';

describe(DisclaimerTextGenerator, () => {
    let testSubject: DisclaimerTextGenerator;
    let markdownOutputFormatterMock: IMock<MarkdownOutputFormatter>;

    beforeEach(() => {
        markdownOutputFormatterMock = Mock.ofType<MarkdownOutputFormatter>();
        testSubject = new DisclaimerTextGenerator(markdownOutputFormatterMock.object);
    });

    it('generates disclaimer text', () => {
        const disclaimerText = testSubject.getDisclaimerText();
        expect(disclaimerText).toMatchSnapshot();
    });
});
