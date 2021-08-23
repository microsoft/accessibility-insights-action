# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

echo 'cloning the repo'
git clone https://$REPO_TOKEN@$REPO_URL

echo 'cd to repo folder'
cd accessibility-insights-action
echo "Setting user name and email"
git config --global user.name $USER
git config --global user.email $EMAIL

echo 'create a new branch to use for creating the release'
git checkout -b releases/ado/$TAG

echo 'delete all files in the repo'
git rm -rf .

echo 'copy drop artifacts to the branch'
cp -r "$WORK_DIR/ado-extension-drop/NOTICE.html" "$WORK_DIR/accessibility-insights-action/"
cp -r "$WORK_DIR/ado-extension-drop/ado-extension.json" "$WORK_DIR/accessibility-insights-action/"
cp -r "$WORK_DIR/ado-extension-drop/pkg" "$WORK_DIR/accessibility-insights-action/pkg"
cp -r "$WORK_DIR/ado-extension-drop/drop/RELEASE_COMMIT.md" "$WORK_DIR/accessibility-insights-action/README.md"

echo 'git add'
git add .

echo 'git commit'
git commit --allow-empty -m "root commit"

echo 'create release tag'
git tag $TAG

echo 'push the release tag'
git push origin $TAG
