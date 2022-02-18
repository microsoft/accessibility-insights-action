// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';
import { ConsoleLogOutputFormatter } from './console-log-output-formatter';

describe('ConsoleLogOutputFormatter', () => {
    const testSubject = new ConsoleLogOutputFormatter();
    it('escaped', () => {
        expect(testSubject.escaped('<img>')).toEqual('\\<img>');
    });

    it('snippet', () => {
        expect(testSubject.snippet('code')).toMatchSnapshot();
    });

    it('link', () => {
        expect(testSubject.link('href', 'text')).toMatchSnapshot();
    });

    it('image', () => {
        expect(testSubject.image('alt', 'src')).toMatchSnapshot();
    });

    it('listItem', () => {
        expect(testSubject.listItem('li')).toMatchSnapshot();
    });

    it('heading', () => {
        expect(testSubject.heading('heading', 2)).toMatchSnapshot();
    });

    it('bold', () => {
        expect(testSubject.bold('text')).toMatchSnapshot();
    });

    it('productTitle', () => {
        expect(testSubject.productTitle()).toMatchSnapshot();
    });

    it('footerSeparator', () => {
        expect(testSubject.footerSeparator()).toMatchSnapshot();
    });

    it('sectionSeparator', () => {
        expect(testSubject.sectionSeparator()).toMatchSnapshot();
    });
});
