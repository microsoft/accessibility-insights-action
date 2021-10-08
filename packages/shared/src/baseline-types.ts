// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

export type UrlNormalizer = (originalUrl: string) => string;

export type BaselineOptions = {
    baselineContent: BaselineFileContent | null;

    // If specified, this function will be applied to each URL that
    // would appear in a baseline file before saving a baseline.
    //
    // For example, if you are scanning a localhost website on a dynamic
    // port, you might use this to strip out the port number from URLs.
    urlNormalizer?: UrlNormalizer;
};

export type CountsByRule = { [ruleId in string]: number };

export type BaselineEvaluation = {
    // null implies "no update required"
    suggestedBaselineUpdate: null | BaselineFileContent;

    newViolationsByRule: CountsByRule;
    fixedViolationsByRule: CountsByRule;
    totalNewViolations: number;
    totalFixedViolations: number;
};

export type BaselineResult = {
    rule: string;
    cssSelector: string;
    xpathSelector?: string;
    htmlSnippet: string;

    // Invariant: must be sorted
    urls: string[];
};

export type BaselineFileContent = {
    metadata: { fileFormatVersion: '1' };

    // Invariant: must be sorted by ['rule', 'cssSelector', 'xpathSelector', 'htmlSnippet']
    results: BaselineResult[];
};
