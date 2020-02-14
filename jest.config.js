// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
module.exports = {
    clearMocks: true,
    collectCoverage: true,
    displayName: 'all unit tests',
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.json',
        },
    },
    moduleDirectories: ['node_modules'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    // This ensures that failures in beforeAll/beforeEach result in dependent tests not trying to run.
    // See https://github.com/facebook/jest/issues/2713
    testRunner: 'jest-circus/runner',
    transform: {
        '^.+\\.(ts)$': 'ts-jest',
    },
    testMatch: ['**/*.spec.[tj]s'],
    testPathIgnorePatterns: ['/dist/', '/out/'],
    verbose: true,
    coverageDirectory: '<rootDir>/test-results/unit/coverage',
    coverageReporters: ['json', 'lcov', 'text', 'cobertura'],
    collectCoverageFrom: [
        '<rootDir>/**/*.js',
        '<rootDir>/**/*.ts',
        '!<rootDir>/dist/**',
        '!<rootDir>/out/**',
        '!<rootDir>/**/jest.config.js',
        '!<rootDir>/**/prettier.config.js',
        '!<rootDir>/**/webpack.config.js',
        '!<rootDir>/**/node_modules/**',
        '!<rootDir>/**/test-results/**',
        '!<rootDir>/**/test-utilities/**',
        '!<rootDir>/**/dev-scripts/**',
        '!<rootDir>/**/jump-consistent-hash.*',
        '!<rootDir>/**/guid-generator.*',
    ],
    reporters: ['default', ['jest-junit', { outputDirectory: '<rootDir>/test-results/unit', outputName: 'junit.xml' }]],
    testEnvironment: 'node',
    setupFilesAfterEnv: ['jest-extended'],
};
