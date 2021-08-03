#!/bin/bash

# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

tag="$1"
sha="$2"

echo "Creating a new release"
echo "Tag  $tag"
echo "SHA $sha"

echo "Setting user name and email"
git config --global user.name "a11y-insights"
git config --global user.email "a11y-insights-team@microsoft.com"

echo "Create a new branch"
git checkout -b releases/$tag $sha

echo "Save a copy of packages.json"
cp ./package.json ./old_package.json

echo "Create packages.json for external packages"
node ./create-package-json-for-externals.js

echo "delete old node_modules"
rm -rf node_modules

echo "install external dependencies"
yarn install --frozen-lockfile --production --ignore-optional --ignore-engines

echo "delete pupetter chromium folder"
rm -rf node_modules/puppeteer/.local-chromium

echo "include dist to check in"
sed -i 's/dist/no-dist/g' .gitignore

echo "include node_modules to check in"
sed -i 's/node_modules/no-node_modules/g' .gitignore

echo "git add"
git add --all

echo "git commit"
git commit -am "commit changes"

echo "push the branch"
git push --set-upstream origin releases/$tag

echo "create a release tag"
git tag $tag

echo "push the release tag"
git push origin $tag

echo "delete the packages.json to restore the old one"
rm ./package.json

echo "restore the old package.json"
mv ./old_package.json ./package.json

echo "delete old node_modules"
rm -rf node_modules

echo "delete dist"
rm -rf dist

echo "git add"
git add --all

echo "git commit"
git commit -am "commit changes"

echo "push changes"
git push

echo "exclude dist to check in"
sed -i 's/no-dist/dist/g' .gitignore

echo "exclude node_modules to check in"
sed -i 's/no-node_modules/node_modules/g' .gitignore

echo "git add"
git add --all

echo "git commit"
git commit -am "commit changes"

echo "push changes"
git push
