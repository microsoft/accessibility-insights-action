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
    globals: {
        'ts-jest': {
            tsconfig: '<rootDir>/tsconfig.json',
        },
    },
    moduleDirectories: ['node_modules'],
    moduleFileExtensions: ['ts', 'js', 'json'],
    moduleNameMapper: {
        'office-ui-fabric-react/lib/(.*)$': 'office-ui-fabric-react/lib-commonjs/$1',
        '@uifabric/styling': '@uifabric/styling/lib-commonjs',
    },
    reporters: ['default', ['jest-junit', { outputDirectory: '<rootDir>/test-results/unit', outputName: 'junit.xml' }]],
    setupFilesAfterEnv: ['jest-extended', `<rootDir>/src/jest-setup.ts`],
    transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
    },
    testMatch: ['**/*.spec.[tj]s'],
    testPathIgnorePatterns: ['/dist/', '/out/'],
    verbose: true,
};
