// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
module.exports = {
    clearMocks: true,
    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.js',
        '<rootDir>/src/**/*.ts',
        '!<rootDir>/dist/**',
        '!<rootDir>/out/**',
        '!<rootDir>/**/jest.config.js',
        '!<rootDir>/**/prettier.config.js',
        '!<rootDir>/**/webpack.config.js',
        '!<rootDir>/**/node_modules/**',
        '!<rootDir>/**/test-results/**',
    ],
    coverageDirectory: '<rootDir>/test-results/unit/coverage',
    coverageReporters: ['json', 'lcov', 'text', 'cobertura'],
    displayName: 'unit tests',
    moduleDirectories: ['node_modules'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    reporters: ['default', ['jest-junit', { outputDirectory: '<rootDir>/test-results/unit', outputName: 'junit.xml' }]],
    setupFilesAfterEnv: ['jest-extended'],
    transform: {
        '^.+\\.(jsx?|tsx?)$': [
            'ts-jest',
            {
                isolatedModules: true,
            },
        ],
    },
    transformIgnorePatterns: ['/node_modules/(?!(serialize-error|get-port))'], // Transform pure ESM with ts-jest
    testMatch: ['**/*.spec.[tj]s', '**/*.test.[tj]s'],
    testPathIgnorePatterns: ['/dist/', '/out/'],
    verbose: true,
};
