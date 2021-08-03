<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

## Release Strategy

### Repo

-   We will store the both the sources and the releases in the `accessibility-insights-action` repo (unchanged from today). If we later decide to change this, we will move the source code to a new repo and keep the consumption experience unchanged.
-   All code contributions will merge into the main branch
-   All releases will be pipeline-controlled
-   We will create a new branch for each release of the GitHub Action. That branch will contain just the files needed to release the action (`action.yml`, the code packed into `index.js`, etc.)
-   The existing ./dist folder of the repo will first be removed, then added to `./.gitignore`. It will exist only for local building and testing

### Release branches

The repo will contain 1 branch per released version of the GitHub action. We are explicitly assuming that the ADO extension will release via the ADO marketplace and will not require a corresponding release branch. The name of the branch will be the same as the name of the release for the GitHub Action, as shown here:

```
/v1.0.1
/v1.0.2
/v1.0.3
/v2.0.0
```

### Tags

#### Release tags

Each release of the GitHub Action will have a tag that points to each specific release branch within the repo. In addition, each major release version will have a tag that points to the latest release of that major version. We could optionally also have a `latest` tag, which would point to the highest released version, as shown here:

```
/v1.0.1   <== v1.0.1
/v1.0.2   <== v1.0.2
/v1.0.3   <== v1.0.3, v1
/v2.0.0   <== v2.0.0, v2, latest
```

#### Source tags

Each release will have a tag that points to the corresponding sources in the main branch. These tags _must_ have names that are distinct from the release tags, since they point to different branches. To make the tags as intuitive as possible, and to support releases of different packages (_e.g._, the GitHub Action vs the ADO extension), we will use the following pattern

| Version | Type of release | Source tag release |
| ------- | --------------- | ------------------ |
| v1.0.2  | GitHub Action   | v1.0.2-sources-gh  |
| v1.0.2  | ADO Extension   | v1.0.2-sources-ado |

It is expected that there will be some cases where the `-gh` suffixed tag and the `-ado` suffixed tag will point to the same commit.

### Pipelines

Logically we will have one build pipeline and two release pipelines (one for the GitHub action, one for the ADO extension). These may or may not be completely separate pipelines at first. Here are the responsibilities of each pipeline.

#### Build pipeline

On each iteration, the **build pipeline** will do the following:

-   Clone the repo (`main` branch)
-   Build the `/dist` folder and the _signed_ ADO extension (if signing is required)
-   Perform any possible self-validation
-   Publish the contents of the `/dist` folder as the _Action artifact_
-   Publish the ADO extension as the _ADO artifact_

#### Action release pipeline

On each iteration, the **action release pipeline** will do the following: Assume that our release version is `vX.Y.Z`

-   Clone the repo
-   Download the _Action artifact_ created by the build pipeline
-   Create a new branch (_releases/vX.Y.Z_), probably failing the release if the branch already exists
-   Copy the _Action artifact_ into the new branch
-   Commit the new branch
-   Create a release tag (_vX.Y.Z_)
-   Create or update the major version tag (_vX_)
-   Create or update the `latest` tag (if we use it and if no higher-versioned release already exists)
-   Create a tag that corresponds to the SHA that build this release (_vX.Y.X-sources-gh_)
-   Push all new tags

#### ADO extension release pipeline

On each iteration, the **ADO extension release** pipeline will do the following:

-   Download the _ADO artifact_ created by the build pipeline
-   Publish the ADO artifact to the marketplace
-   Create a tag that corresponds to the SHA that build this release (_vX.Y.X-sources-ado_)
-   Push the new tag

#### Pipeline questions:

-   What should trigger the **build pipeline**? Every commit?
-   What should trigger the release pipelines? Manually triggered?
-   Do we need Canary/Insider/Production for release validation, or are we OK with just Production?

### Models for consuming the action

#### Pin to the latest version a major version

The yaml file excerpt would look something like this:

```
  steps:
    name: Check Accessibility
    uses: actions/microsoft/accessibility-insights-action@v1
```

#### Pin to a specific release

The yaml file excerpt would look something like this:

```
  steps:
    name: Check Accessibility
    uses: actions/microsoft/accessibility-insights-action@v1.0.3
```

#### Use the latest version

If we need this functionality (for the validation pipeilne, perhaps), we can make the release pipeline responsible for maintaining a `latest` tag that always references the release with the _highest version_. If we do this, then the yaml file excerpt would look something like this:

```
  steps:
    name: Check Accessibility
    uses: actions/microsoft/accessibility-insights-action@latest
```
