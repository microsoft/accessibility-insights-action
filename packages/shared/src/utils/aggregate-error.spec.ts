// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { throwOnAnyErrors, AggregateError } from './aggregate-error';

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
        const secondError = new Error('second error');
        testSubject = new AggregateError([firstError, secondError]);
    });

    it('uses the pinned message format', () => {
        expect(testSubject.message).toMatchInlineSnapshot(`
            "Multiple errors occurred
                first error
                second error"
        `);
    });

    it('uses the pinned stack format', () => {
        const stackWithPathsStripped = testSubject.stack.replace(/^(\s*at .+) \((.+)\)$/gm, '$1 (...)');

        expect(stackWithPathsStripped).toMatchInlineSnapshot(`
            "AggregateError: Multiple errors occurred
                Error: first error
                    at Object.<anonymous> (...)
                    at Promise.then.completed (...)
                    at new Promise (...)
                    at callAsyncCircusFn (...)
                    at _callCircusHook (...)
                    at processTicksAndRejections (...)
                    at _runTest (...)
                    at _runTestsForDescribeBlock (...)
                    at _runTestsForDescribeBlock (...)
                    at run (...)
                Error: second error
                    at Object.<anonymous> (...)
                    at Promise.then.completed (...)
                    at new Promise (...)
                    at callAsyncCircusFn (...)
                    at _callCircusHook (...)
                    at processTicksAndRejections (...)
                    at _runTest (...)
                    at _runTestsForDescribeBlock (...)
                    at _runTestsForDescribeBlock (...)
                    at run (...)
                at new AggregateError (...)
                at Object.<anonymous> (...)
                at Promise.then.completed (...)
                at new Promise (...)
                at callAsyncCircusFn (...)
                at _callCircusHook (...)
                at processTicksAndRejections (...)
                at _runTest (...)
                at _runTestsForDescribeBlock (...)
                at _runTestsForDescribeBlock (...)"
        `);
    });

    it('uses the name "AggregateError"', () => {
        expect(testSubject.name).toBe('AggregateError');
    });

    it('is an Error', () => {
        expect(testSubject).toBeInstanceOf(Error);
    });
});
