<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# Project structure

This repository contains code for two projects:

-   `packages/gh-action` contains a GitHub action, also released to tags in this repository
-   `packages/ado-extension` contains a Azure DevOps extension
-   `packages/shared` contains most of the shared logic from the two projects; over time, product-specific code should move from `packages/shared` into the appropriate product folder

We use `lerna` and `yarn workspaces` to manage the monorepo. In most cases, running yarn scripts in the root directory should produce output from all packages.

## Table of contents

<!-- prettier-ignore-start -->

- [Table of contents](#table-of-contents)
- [Development workflow](#development-workflow)
- [Test the Azure extension](#test-the-azure-extension)
  - [Deploy a staging Azure extension](#deploy-a-staging-azure-extension)
  - [Run the Azure extension locally](#run-the-azure-extension-locally)
- [Test the GitHub action](#test-the-github-action)
  - [Deploy the GitHub action to your own test repo](#deploy-the-github-action-to-your-own-test-repo)
  - [Run the GitHub action locally](#run-the-github-action-locally)
    - [Prerequisites](#prerequisites)
      - [Prerequisites for Windows](#prerequisites-for-windows)
      - [Prerequisites for Mac OS](#prerequisites-for-mac-os)
    - [Run action](#run-action)

<!-- prettier-ignore-end -->

## Development workflow

To make a change, you can follow these steps:

1. Clone the repository. While our team typically uses forks, the action (and therefore our self-test workflow) doesn't support pull requests from forks yet (tracked [here](https://github.com/microsoft/accessibility-insights-action/issues/629)). For this reason, maintainers might consider working off branches of the main repository. To test a fork, you can consume your fork's branch from a different repository.

2. Run `yarn install`. This projects requires Node 16.

3. Make your code change.

4. Run `yarn build` and/or `yarn test`. If you're changing `shared`, you may need to build it before the action and extension pick up changes.

5. You can test your changes locally or remotely:

    1. locally: [Run the Azure extension locally](#run-the-azure-extension-locally), [Run the GitHub action locally](#run-the-github-action-locally)
    2. remotely: [Deploy a staging Azure extension](#deploy-a-staging-azure-extension), [Deploy the GitHub action to your own test repo](#deploy-the-github-action-to-your-own-test-repo)

6. Push your changes to GitHub.

7. Create a pull request. If your branch is on the main repository, the pull request build should run your implementation against the test files in `website-root`.

## Test the Azure extension

### Deploy a staging Azure extension

The steps to deploy a staging Azure Extension are currently limited to the Accessibility Insights team. Team members can find instruction in the "ADO Extension - ad-hoc test deployments" OneNote.

### Run the Azure extension locally

1. Follow the steps in [Development workflow](#development-workflow) to install dependencies and build the project.

2. From your terminal, move into the extension directory: `cd packages/ado-extension`.

3. Run `yarn start`. This will run the extension locally using the inputs defined in [local-overrides.json](../packages/ado-extension/scripts/local-overrides.json). Modify local-overrides.json as needed to test your scenario.

## Test the GitHub action

### Deploy the GitHub action to your own test repo

You can follow the [instructions to deploy to GitHub](../packages/gh-action/deploy-scripts/deploy-to-github-test.md).

### Run the GitHub action locally

#### Prerequisites

##### Prerequisites for Windows

1. Install [Windows Subsystem for Linux 2 (WSL 2)](https://docs.microsoft.com/en-us/windows/wsl/compare-versions#whats-new-in-wsl-2)

    To do this open the _PowerShell_ tool as an _Administrator_ and run commands below.

    ```
    dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

    dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

    wsl --set-default-version 2
    ```

2. Install [Ubuntu 20.04 LTS](https://www.microsoft.com/en-us/p/ubuntu-2004-lts/9n6svws3rx71)
3. Install [Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701)

4. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

Open _Windows Terminal_ from repository root folder and switch to Linux using command below.

```
wsl
```

From within Linux install applications below.

5. Install [Homebrew](https://brew.sh/). To do this run commands below.

    ```
    sh -c "$(curl -fsSL https://raw.githubusercontent.com/Linuxbrew/install/master/install.sh)"
    ```

    ```
    test -d ~/.linuxbrew && eval $(~/.linuxbrew/bin/brew shellenv)

    test -d /home/linuxbrew/.linuxbrew && eval $(/home/linuxbrew/.linuxbrew/bin/brew shellenv)

    test -r ~/.bash_profile && echo "eval \$($(brew --prefix)/bin/brew shellenv)" >>~/.bash_profile

    echo "eval \$($(brew --prefix)/bin/brew shellenv)" >>~/.profile
    ```

6. Install [act](https://github.com/nektos/act) using command below.
    ```
    brew install act
    ```

##### Prerequisites for Mac OS

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)

2. Install [act](https://github.com/nektos/act)

#### Run action

_Note_: To run action on Windows use WSL 2.

1. Build action using `yarn cbuild` or `yarn build` command.
2. Run action using `act`.

_Note_: When run act first time choose **large** image option.

_Note_: When you get an error about composite actions is not supported then [build act from source](https://github.com/nektos/act#building-from-source) to use latest features.

Action is running inside a docker container. After action is completed the docker container is still running to preserve chrome setup and reduce subsequent action startup time.
