<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# Project structure

This repository contains code for two packages:

-   `packages/shared` contains the core logic that is not specific to running any specific CI solution. Any code that could be shared across additional CI solutions in the future such as a GitHub Action, should be put in the shared package.
-   `packages/ado-extension` contains the code specifically relevant to the Azure DevOps extension.

We use `lerna` and `yarn workspaces` to manage the monorepo. In most cases, running yarn scripts in the root directory should produce output from all packages.

## Development workflow

To make a change, you can follow these steps:

1. Clone the repository. If you would like to [deploy a staging Azure extension](#deploy-a-staging-azure-extension), maintainers will need to create branches off of the main repository.

2. Run `yarn install`. This project requires Node 16.

3. Make your code change.

4. Run `yarn build` and/or `yarn test`. If you're changing `shared`, you may need to build it before the extension picks up changes.

5. You can test your changes locally or remotely:

    - locally:
        - [Run the Azure extension locally](#run-the-azure-extension-locally)
    - remotely:
        - [Deploy a staging Azure extension](#deploy-a-staging-azure-extension)

6. Push your changes to GitHub.

7. Create a pull request. If your branch is on the main repository, the pull request build should run your implementation against the test files in `website-root`.

## Test the Azure extension

### Deploy a staging Azure extension

The steps to deploy a staging Azure Extension are currently limited to the Accessibility Insights team. Team members can find instruction in the "ADO Extension - ad-hoc test deployments" OneNote.

### Run the Azure extension locally

1. Follow the steps in [Development workflow](#development-workflow) to install dependencies and build the project.

2. From your terminal, move into the extension directory: `cd packages/ado-extension`.

3. Run `yarn start`. This will run the extension locally using the inputs defined in [local-overrides.json](../packages/ado-extension/scripts/local-overrides.json). Modify local-overrides.json, as needed to test your scenario.
