<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Release instructions

To create a new release, a repo maintainer should follow these steps:

1. Create and merge a release pull request to `main` which:
  * Updates `/package.json` with a new semantic version number
  * Updates `/NOTICES.txt` based on the dependencies in `yarn.lock`
  * Updates `/dist/` with the results of `yarn build`
2. Wait for a passing CI build against `main`
3. Create/update the corresponding git tags for the release:
  * Create a new release tag using the version in `package.json` (eg, `git tag v1.2.3`)
  * Update the corresponding major-version tag (eg, `git tag -f v1`)
  * Push both tags
