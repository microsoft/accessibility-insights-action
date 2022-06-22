<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# Deploying to GitHub

Sometimes you might want to test your local GitHub action changes in the remote runner.

You can do so by running the following commands in your terminal (e.g. PowerShell).

Prerequisites:

-   install the [GitHub CLI](https://cli.github.com/) once & ensure you're logged into the right account

## How the script works

This script populates a new folder called `dist-test-deployment` that contains a built version of the action. It then pushes this folder to a new **public GitHub repository** inside your account. The repo includes a GitHub workflow file that self-tests the action, so upon repo creation you can immediately see the action running.

## When you're ready to deploy

Run these commands from `packages/gh-action` after running `yarn build`.

```
rm -r -Force dist-test-deployment

mkdir dist-test-deployment\dev\
mkdir dist-test-deployment\.github\workflows

cp -r dist dist-test-deployment
cp action.yml dist-test-deployment
cp deploy-scripts\validation.yml dist-test-deployment\.github\workflows\
cp -r ..\..\dev\website-root dist-test-deployment\dev\website-root

git -C dist-test-deployment init -b main
git -C dist-test-deployment add .
git -C dist-test-deployment commit -m "adding all files"

gh repo create accessibility-insights-action-test-deployment --source=dist-test-deployment --public --push
```

## To update the remote repo

I usually just delete & recreate the repo, but if you prefer to keep it long-running, you can try:

-   rerun `yarn build`
-   replace `dist` contents inside `dist-test-deployment`
-   commit & push the changes in `dist-test-deployment`

## To delete the remote repo

You can delete the created repo manually, or run this GH command (`--confirm` skips the prompt, so adjust as needed).

`gh repo delete accessibility-insights-action-test-deployment --confirm`
