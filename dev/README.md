<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# Run GitHub Actions locally

## Prerequisites

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install [act](https://github.com/nektos/act)

## Run action

1. Build action using `yarn cbuild` or `yarn build` command
2. Run action using `yarn act`

_Note_: When run act first time choose **large** image option.

_Note_: When you get an error about composite actions is not supported then [build act from source](https://github.com/nektos/act#building-from-source) to use latest features.

Action is running inside a docker container. After action is completed the docker container is still running to preserve chrome setup and reduce subsequent action startup time.
