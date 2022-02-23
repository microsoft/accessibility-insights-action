// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { footerSeparator, link, listItem, productTitle, sectionSeparator } from './console-log-formatter';

describe('ConsoleLogFormatter', () => {
    it('link', () => {
        expect(link('href', 'text')).toMatchSnapshot();
    });

    it('listItem', () => {
        expect(listItem('li')).toMatchSnapshot();
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
