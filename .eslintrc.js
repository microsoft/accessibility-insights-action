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
        // Too many false positives; see https://github.com/nodesecurity/eslint-plugin-security/issues/21#issuecomment-326031625
        'security/detect-object-injection': 'off',
    },
    overrides: [
        {
            files: ['src/**/*.spec.ts'],
            rules: {
                // Test stubs are allowed to use "as any" assignments/calls/returns
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/no-unsafe-assignment': 'off',
                '@typescript-eslint/no-unsafe-call': 'off',
                '@typescript-eslint/no-unsafe-return': 'off',
                '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            },
        },
    ],
    ignorePatterns: ['**/*.js'],
};
