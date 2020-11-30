// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
module.exports = {
    env: {
        es2017: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'plugin:security/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        sourceType: 'module', // Allows for the use of imports
        project: './tsconfig.json',
        ecmaVersion: 8,
    },
    plugins: ['@typescript-eslint', 'security'],
    rules: {
        // Disabled because we don't think the rule is valuable
        '@typescript-eslint/no-inferrable-types': 'off', // Explicitness for readability is fine
        'security/detect-object-injection': 'off', // Too many false positives
        // Disabled due to number of pre-existing violations
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/require-await': 'off',
    },
};
