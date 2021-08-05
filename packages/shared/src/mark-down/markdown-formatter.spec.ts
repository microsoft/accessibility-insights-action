// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import {
    bold,
    escaped,
    footerSeparator,
    heading,
    image,
    link,
    listItem,
    productTitle,
    sectionSeparator,
    snippet,
} from './markdown-formatter';

describe('MarkdownFormatter', () => {
    it('escaped', () => {
        expect(escaped('<img>')).toEqual('\\<img>');
    });

    it('snippet', () => {
        expect(snippet('code')).toMatchSnapshot();
    });

    it('link', () => {
        expect(link('href', 'text')).toMatchSnapshot();
    });

    it('image', () => {
        expect(image('alt', 'src')).toMatchSnapshot();
    });

    it('listItem', () => {
        expect(listItem('li')).toMatchSnapshot();
    });

    it('heading', () => {
        expect(heading('heading', 2)).toMatchSnapshot();
    });

    it('bold', () => {
        expect(bold('text')).toMatchSnapshot();
    });

    it('productTitle', () => {
        expect(productTitle()).toMatchSnapshot();
    });

    it('footerSeparator', () => {
        expect(footerSeparator()).toMatchSnapshot();
    });

    it('sectionSeparator', () => {
        expect(sectionSeparator()).toMatchSnapshot();
    });
});
