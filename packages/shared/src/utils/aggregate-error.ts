// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export function throwOnAnyErrors(errors: Error[], context?: string): void {
    if (errors.length === 1) {
        throw errors[0];
    } else if (errors.length > 1) {
        throw new AggregateError(errors, context);
    }
}

export class AggregateError extends Error {
    private _errors: Error[];

    constructor(errors: Error[], context?: string) {
        const messagePrefix = (context ?? 'Multiple errors occurred') + '\n';

        const combinedSubstacks = errors.map((error) => error.stack ?? error.message).join('\n');

        const indentedCombinedSubstacks = combinedSubstacks
            .split('\n')
            .map((s) => '    ' + s)
            .join('\n');

        const tempErrorForStack = new Error(messagePrefix + indentedCombinedSubstacks);
        tempErrorForStack.name = 'AggregateError';
        const fullCombinedStack = tempErrorForStack.stack;

        const combinedSubmessages = errors.map((e) => '    ' + e.message).join('\n');
        const fullCombinedMessage = messagePrefix + combinedSubmessages;

        super(fullCombinedMessage);

        this.name = 'AggregateError';
        this.stack = fullCombinedStack;
        this._errors = errors;
    }

    get errors(): Error[] {
        return this._errors.slice();
    }
}
