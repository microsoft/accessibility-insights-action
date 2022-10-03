// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
const path = require('path');
const packageJson = require(process.cwd() + '/package.json');
const getWebpackConfig = require(process.cwd() + '/webpack.config');
const { buildRuntimePackageMetadata } = require('../shared/build-runtime-package-metadata');

buildRuntimePackageMetadata({
    packageJson,
    webpackConfig: getWebpackConfig(),
    outputDirectory: path.join('.', 'dist'),
});

console.log('prepare-package-dir complete');
