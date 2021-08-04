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

echo "pull all"
git pull

echo "Create a new branch"
git checkout -b releases/$tag $sha

echo "include dist to check in"
sed -i 's/dist/no-dist/g' .gitignore

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

echo "git add"
git add --all

echo "git commit"
git commit -am "commit changes"

echo "push changes"
git push
