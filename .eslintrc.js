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
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-unused-vars': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/no-inferrable-types': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/restrict-plus-operands': 'off',
        '@typescript-eslint/unbound-method': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/restrict-template-expressions': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/require-await': 'off',
        '@typescript-eslint/no-implied-eval': 'off',
        '@typescript-eslint/prefer-regexp-exec': 'off',
        '@typescript-eslint/await-thenable': 'off',
        'security/detect-object-injection': 'off',
        'no-prototype-builtins': 'off',
    },
    overrides: [
        {
            files: ['src/**/*.spec.ts'],
            rules: {
                // Disable those errors and warnings which are not a threat to test code because the code is not run in production environments
                'security/detect-non-literal-regexp': 'off',
                'security/detect-non-literal-fs-filename': 'off',
                'security/detect-unsafe-regex': 'off',
                'security/detect-child-process': 'off',
                'security/detect-eval-with-expression': 'off',
            },
        },
    ],
};
