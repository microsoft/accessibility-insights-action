// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { throwOnAnyErrors, AggregateError } from './aggregate-error';

/* eslint-disable no-regex-spaces */

describe(throwOnAnyErrors, () => {
    it('does not throw if passed zero errors', () => {
        expect(() => throwOnAnyErrors([])).not.toThrow();
    });

    it('rethrows the error as-is if passed one error', () => {
        const originalError = new Error('the original error');
        expect(() => throwOnAnyErrors([originalError])).toThrow(originalError);
    });

    it('throws an AggregateError if passed multiple errors', () => {
        const firstError = new Error('first error');
        const secondError = new Error('second error');

        try {
            throwOnAnyErrors([firstError, secondError]);
            fail(); // should throw
        } catch (e) {
            expect(e).toBeInstanceOf(AggregateError);
            expect((e as AggregateError).errors).toStrictEqual([firstError, secondError]);
        }
    });
});

describe(AggregateError, () => {
    let testSubject: AggregateError;

    beforeEach(() => {
        const firstError = new Error('first error');
        firstError.stack = `Error: first error\n    at <normalized first location>`;
        const secondError = new Error('second error');
        secondError.stack = `Error: second error\n    at <normalized second location>`;
        testSubject = new AggregateError([firstError, secondError]);
    });

    it('uses the pinned message format', () => {
        expect(testSubject.message).toMatchSnapshot();
    });

    it('uses the pinned stack format', () => {
        // We normalize the actual stack location because it depends on system paths/node version
        const stackWithLocationsCollapsed = testSubject.stack
            .replace(/^(    at) .*\n/gm, '') // This removes all stack lines except the last one (which won't have the \n)
            .replace(/^(    at) .*$/gm, '$1 <normalized location>'); // This normalizes the path/location in the last stack line

        expect(stackWithLocationsCollapsed).toMatchSnapshot();
    });

    it('uses the name "AggregateError"', () => {
        expect(testSubject.name).toBe('AggregateError');
    });

    it('is an Error', () => {
        expect(testSubject).toBeInstanceOf(Error);
    });
});
