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
cp -r '$(System.DefaultWorkingDirectory)/ado-extension-drop/NOTICE.html' '$(System.DefaultWorkingDirectory)/accessibility-insights-action/'
cp -r '$(System.DefaultWorkingDirectory)/ado-extension-drop/ado-extension.json' '$(System.DefaultWorkingDirectory)/accessibility-insights-action/'
cp -r '$(System.DefaultWorkingDirectory)/ado-extension-drop/pkg' '$(System.DefaultWorkingDirectory)/accessibility-insights-action/pkg'
cp -r '$(System.DefaultWorkingDirectory)/ado-extension-drop/drop/RELEASE_COMMIT.md' '$(System.DefaultWorkingDirectory)/accessibility-insights-action/README.md'

echo 'git add'
git add .

echo 'git commit'
git commit --allow-empty -m "root commit"

echo 'create release tag'
git tag $TAG

echo 'push the release tag'
git push origin $TAG
