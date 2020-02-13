// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const rootDir = './';
const srcDir = '<rootDir>/src';

module.exports = {
    clearMocks: true,
    moduleDirectories: ['node_modules', 'src'],
    // This ensures that failures in beforeAll/beforeEach result in dependent tests not trying to run.
    // See https://github.com/facebook/jest/issues/2713
    testRunner: 'jest-circus/runner',
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    coverageDirectory: '<rootDir>/test-results/unit/coverage',
    displayName: 'unit tests',
    moduleFileExtensions: ['ts', 'tsx', 'js'],
    collectCoverageFrom: ['<rootDir>/src/**/*.{ts,tsx}', '!<rootDir>/src/tests/**/*', '!<rootDir>/src/**/*.d.ts'],
    rootDir: rootDir,
    roots: [srcDir],
    coverageReporters: ['json', 'lcov', 'text', 'cobertura'],
    testEnvironment: 'jsdom',
    testMatch: [`${srcDir}/**/*.spec.(ts|tsx|js)`],
    reporters: ['default', ['jest-junit', { outputDirectory: '.', outputName: '<rootDir>/test-results/unit/junit.xml' }]],
    verbose: false,
};
