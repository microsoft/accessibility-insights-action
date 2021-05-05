<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

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
2. Run action using `yarn act`

_Note_: When run act first time choose **large** image option.

_Note_: When you get an error about composite actions is not supported then [build act from source](https://github.com/nektos/act#building-from-source) to use latest features.

Action is running inside a docker container. After action is completed the docker container is still running to preserve chrome setup and reduce subsequent action startup time.
