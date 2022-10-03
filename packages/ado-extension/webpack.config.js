// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const path = require('path');
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');

module.exports = (env) => {
    const version = env ? env.version : 'dev';
    console.log(`Building for version : ${version}`);
    return {
        devtool: 'cheap-source-map',
        entry: {
            ['index']: path.resolve('./src/index.ts'),
        },
        // We special case MPL-licensed dependencies ('axe-core', '@axe-core/puppeteer') because we want to avoid including their source in the same file as non-MPL code.
        externals: ['axe-core', 'accessibility-insights-report', 'accessibility-insights-scan', '@types/react', '@types/react-dom'],
        mode: 'development',
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    use: [
                        {
                            loader: 'ts-loader',
                            options: {
                                transpileOnly: true,
                                experimentalWatchApi: true,
                            },
                        },
                    ],
                    exclude: ['/node_modules/', /\.(spec|e2e)\.ts$/],
                },
            ],
        },
        name: 'scan-action',
        node: {
            __dirname: false,
        },
        output: {
            path: path.resolve('./dist/pkg'),
            filename: '[name].js',
            libraryTarget: 'commonjs2',
        },
        plugins: [
            new webpack.DefinePlugin({
                __IMAGE_VERSION__: JSON.stringify(version),
            }),
            new ForkTsCheckerWebpackPlugin(),
            new CaseSensitivePathsPlugin(),
            // we ignore encoding because of https://github.com/microsoft/accessibility-insights-action/pull/752#issuecomment-893026690
            new webpack.IgnorePlugin({ resourceRegExp: /^encoding$/, contextRegExp: /node_modules\\node-fetch\\lib$/ }),
        ],
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            mainFields: ['main'], //This is fix for this issue https://www.gitmemory.com/issue/bitinn/node-fetch/450/494475397
        },
        target: 'node',
    };
};
