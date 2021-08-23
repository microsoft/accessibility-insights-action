echo "Setting user name and email"
git config --global user.name $(user)
git config --global user.email $(email)

echo 'create a new branch to use for creating the release'
git checkout -b releases/ado/$(tag)

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
git tag $(tag)

echo 'push the release tag'
git push origin $(tag)
