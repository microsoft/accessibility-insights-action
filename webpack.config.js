// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const path = require('path');
const webpack = require('webpack');

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin');
const copyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env) => {
    const version = env ? env.version : 'dev';
    console.log(`Building for version : ${version}`);
    return {
        devtool: 'cheap-source-map',
        entry: {
            ['index']: path.resolve('./src/index.ts'),
        },
        // We special case MPL-licensed deps because we want to avoid including their source in
        // the same file as non-MPL code. Note that each entry here should have a corresponding
        // entry in copyWebpackPlugin config to copy the non-bundled forms to /dist.
        externals: ['apify', 'leveldown'],
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
            path: path.resolve('./dist'),
            filename: '[name].js',
            libraryTarget: 'commonjs2',
        },
        plugins: [
            new webpack.DefinePlugin({
                __IMAGE_VERSION__: JSON.stringify(version),
            }),
            new ForkTsCheckerWebpackPlugin(),
            new CaseSensitivePathsPlugin(),
            new copyWebpackPlugin({
                patterns: [
                    `node_modules/axe-core/*`, // we only use the root-level axe.min.js and the package metadata/LICENSE stuff
                    `node_modules/@axe-core/puppeteer/**/*`,
                ],
            }),
        ],
        resolve: {
            extensions: ['.ts', '.js', '.json'],
            mainFields: ['main'], //This is fix for this issue https://www.gitmemory.com/issue/bitinn/node-fetch/450/494475397
        },
        target: 'node',
    };
};
