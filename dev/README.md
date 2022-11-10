<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# Project structure

This repository contains code for two projects:

-   `packages/gh-action` contains a GitHub action, also released to tags in this repository
-   `packages/ado-extension` is an in-progress Azure DevOps extension
-   `packages/shared` contains most of the shared logic from the two projects; over time, product-specific code should move from `packages/shared` into the appropriate product folder

We use `lerna` and `yarn workspaces` to manage the monorepo. In most cases, running yarn scripts in the root directory should produce output from all packages.

# Development workflow

To make a change, you can follow these steps:

-   clone the repository. While our team typically uses forks, the action (and therefore our self-test workflow) doesn't support pull requests from forks yet (tracked [here](https://github.com/microsoft/accessibility-insights-action/issues/629)). For this reason, maintainers might consider working off branches of the main repository. To test a fork, you can consume your fork's branch from a different repository.
-   run `yarn install`. You might encounter `Found incompatible module` because one of our dependencies expects node versions `^10.17.0 || ^12.3.0`. You can use `yarn install --ignore-engines` to ignore this error.
-   make your code change
-   run `yarn build` and/or `yarn test`. If you're changing `shared`, you may need to build it before `gh-action` picks up changes.
-   test your changes either
    -   locally: follow the instructions below this section
    -   remotely: push your changes to GitHub and consume your branch from a separate repository. Replace `uses: microsoft/accessibility-insights-action@v2` with `uses: YourAccount/accessibility-insights-action@YourBranchOrSHA`
-   push your changes to GitHub
-   create a pull request. If your branch is on the main repo, the PR build should run your implementation against the test files in `website-root`.

# Deploy GitHub Action to your own test repo

You can follow the [instructions to deploy to GitHub](../packages/gh-action/deploy-scripts/deploy-to-github-test.md).

# Run GitHub Actions locally

## Prerequisites (Windows)

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

## Prerequisites (Mac OS)

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install [act](https://github.com/nektos/act)

## Run action

_Note_: To run action on Windows use WSL 2.

1. Build action using `yarn cbuild` or `yarn build` command
2. Run action using `act`

_Note_: When run act first time choose **large** image option.

_Note_: When you get an error about composite actions is not supported then [build act from source](https://github.com/nektos/act#building-from-source) to use latest features.

Action is running inside a docker container. After action is completed the docker container is still running to preserve chrome setup and reduce subsequent action startup time.




