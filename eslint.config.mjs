// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import tseslint from '@typescript-eslint/eslint-plugin';
import security from 'eslint-plugin-security';
import tsParser from '@typescript-eslint/parser';
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
    {
        ignores: ['**/build/**', '**/dist/**', '**/lib/**', '**/node_modules/**'],
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            parserOptions: {
                project: ['./tsconfig.json', './packages/ado-extension/tsconfig.json', './packages/shared/tsconfig.json'],
                tsconfigRootDir: __dirname,
                sourceType: 'module',
            },
            globals: {
                ...globals.node,
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            security: security,
        },

        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unsafe-assignment': 'off',
            '@typescript-eslint/no-unsafe-call': 'off',
            '@typescript-eslint/no-unsafe-return': 'off',
            '@typescript-eslint/no-unsafe-argument': 'off',

            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        },
    },
    {
        files: ['packages/ado-extension/**/*.{ts,js}'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node,
            },
        },
    },
];
