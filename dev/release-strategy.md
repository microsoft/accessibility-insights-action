<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

## Release Strategy

### Repo

-   We will store the both the sources and the releases in the `accessibility-insights-action` repo (unchanged from today). If we later decide to change this, we will move the source code to a new repo and keep the consumption experience unchanged.
-   All code contributions will merge into the main branch
-   All releases will be workflow-controlled
-   We will create a new branch for each release of the GitHub Action. That branch will contain just the files needed to release the action (`action.yml`, the code packed into `index.js`, etc.)
-   The existing ./dist folder of the repo will first be removed, then added to `./.gitignore`. It will exist only for local building and testing

### Release branches

The repo will contain 1 branch per released version of the GitHub action. We are explicitly assuming that the ADO extension will release via the ADO marketplace and will not require a corresponding release branch. The name of the branch will be the same as the name of the release for the GitHub Action, as shown here:

```
v1.0.1
v1.0.2
v1.0.3
v2.0.0
```

### Tags

#### Release tags

Each release of the GitHub Action will have a tag that points to each specific release branch within the repo. In addition, each major release version will have a tag that points to the latest release of that major version. We could optionally also have a `latest` tag, which would point to the highest released version, as shown here:

```
v1.0.1   <== v1.0.1
v1.0.2   <== v1.0.2
v1.0.3   <== v1.0.3, v1
v2.0.0   <== v2.0.0, v2, latest
```

#### Source tags

Each release will have a tag that points to the corresponding sources in the main branch. These tags _must_ have names that are distinct from the release tags, since they point to different branches. To make the tags as intuitive as possible, and to support releases of different packages (_e.g._, the GitHub Action vs the ADO extension), we will use the following pattern

| Version | Type of release | Source tag release |
| ------- | --------------- | ------------------ |
| v1.0.2  | GitHub Action   | v1.0.2-sources-gh  |
| v1.0.2  | ADO Extension   | v1.0.2-sources-ado |

It is expected that there will be some cases where the `-gh` suffixed tag and the `-ado` suffixed tag will point to the same commit.

### Workflows

Logically we will have one build workflow and two release workflows (one for the GitHub action, one for the ADO extension). Here are the responsibilities of each workflow.

#### Build workflow

This will be implemented as a GitHub action that triggers on each commit. When triggered, the **build workflow** will do the following:

-   Clone the repo (`main` branch) at the lastest SHA
-   Build the `/dist` folder and ADO extension
-   Perform any possible self-validation

#### Action release workflow

This will be implemented as a GitHub action that is manually triggered. When triggered, the **action release workflow** will do the following: Assume that our release version is `vX.Y.Z`

-   Clone the repo (`main` branch) at a specific SHA
-   Build the `/dist` folder as the _Action artifact_
-   Create a new parentless branch (_releases/gh/vX.Y.Z_), failing if the branch already exists.
-   Copy the _Action artifact_ into the new branch
-   Commit the new branch
-   Create a release tag (_vX.Y.Z_)
-   Create or update the major version tag (_vX_)
-   Create or update the `latest` tag (if we use it and if no higher-versioned release already exists)
-   Create a tag that corresponds to the SHA that build this release (_vX.Y.X-sources-gh_)
-   Push all new tags

#### ADO extension release workflow

This will be implemented as an ADO pipeline that is manually triggered. When triggered, the **ADO extension release workflow** will do the following:

-   Clone the repo (`main` branch) at a specific SHA
-   Build and sign the _ADO artifact_ from the sources in `main`
-   Publish the _ADO artifact_ to the marketplace
-   Create a tag that corresponds to the SHA that build this release (_vX.Y.X-sources-ado_)
-   Push the new tag

#### Open questions:

-   Is it possible to generate the Action's ThirdPartyNotices file through a GitHub action, or is that only available through an ADO pipeline?
-   Should we sign bits during the build workflow, or should we accept the risk of discovering signing issues only in the release workflows?
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

If we need this functionality (for the validation pipeilne, perhaps), we can make the ADO release workflow responsible for maintaining a `latest` tag that always references the release with the _highest version_. If we do this, then the yaml file excerpt would look something like this:

```
  steps:
    name: Check Accessibility
    uses: actions/microsoft/accessibility-insights-action@latest
```
