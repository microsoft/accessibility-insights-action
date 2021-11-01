// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export function throwOnAnyErrors(errors: Error[]): void {
    if (errors.length === 1) {
        throw errors[0];
    } else if (errors.length > 1) {
        throw new AggregateError(errors);
    }
}

export class AggregateError extends Error {
    private _errors: Error[];

    constructor(errors: Error[]) {
        const combinedStacks = errors
            .map(error => error.stack ?? error.message)
            .join('\n');

        const indentedCombinedStacks = combinedStacks
            .split('\n')
            .map(s => '    ' + s)
            .join('\n');

		super('\n' + indentedCombinedStacks);

        this.name = 'AggregateError';
		this._errors = errors;
	}

	get errors(): Error[] {
		return this._errors.slice();
	}
}
