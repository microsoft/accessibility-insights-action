// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import tseslint from 'typescript-eslint';
import security from 'eslint-plugin-security';
import globals from 'globals';

export default tseslint.config(
    { ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/*.js'] },
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    security.configs.recommended,
    {
        languageOptions: {
            globals: { ...globals.node },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            // Too many false positives; see https://github.com/nodesecurity/eslint-plugin-security/issues/21#issuecomment-326031625
            'security/detect-object-injection': 'off',
        },
    },
    {
        files: ['**/src/**/*.spec.ts'],
        rules: {
            // Test stubs are allowed to use "as any" assignments/calls/returns
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
);
