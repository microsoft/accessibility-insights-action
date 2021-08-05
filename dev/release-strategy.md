<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

## Release Strategy

### Repo

-   We will store the both the sources and the releases in the `accessibility-insights-action` repo (unchanged from today). If we later decide to change this, we will move the source code to a new repo and keep the consumption experience unchanged.
-   All code contributions will merge into the main branch
-   All releases will be workflow-controlled and will be external to the main branch
-   We will create a new commit for each release of the GitHub Action.
-   The existing ./dist folder of the repo will first be removed, then added to `./.gitignore`. It will exist only for local building and testing

### Release organization

Each release will be associated with a commit containing _just the files needed for release_ (_i.e._, without the original source files). The structure of each commit will be:

```
NOTICE.html
README.md
action.yml
/dist
    index.js
    index.js.map
    package.json
    yarn.lock
```

To minimize potential confusion, each commit will be _unassociated_ with any specific branch. We currently believe that the ADO extension will release via the ADO marketplace and will _not_ require a corresponding release commit.

### Tags

#### Release tags

Each release of the GitHub Action will have a tag that points to a specific commit within the repo. In addition, each major release version will have a tag that points to the highest version of that major version.

```
v1.0.1   <== v1.0.1
v1.0.2   <== v1.0.2
v1.0.3   <== v1.0.3, v1
v2.0.0   <== v2.0.0, v2
```

#### Source tags

Each release will have a corresponding tag that identifies the commit used to generate that release. These tags _must_ have names that are distinct from the release tags, since they point to different commits. To make the tags as intuitive as possible, and to support releases of different packages (_e.g._, the GitHub Action vs the ADO extension), we will use the following pattern

| Version | Type of release | Source tag release |
| ------- | --------------- | ------------------ |
| v1.0.2  | GitHub Action   | v1.0.2-sources-gh  |
| v1.0.2  | ADO Extension   | v1.0.2-sources-ado |

It is expected that there will be some cases where the `-gh` suffixed tag and the `-ado` suffixed tag will point to the same commit.

### Pipelines

We will have one build pipeline and two release pipelines (one for the GitHub action, one for the ADO extension). Here are the responsibilities of each workflow.

#### Build pipeline

This will be implemented as an ADO pipeline that will trigger on each commit to the `main` branch. Once triggered, the **build pipeline** will do the following:

-   Clone the repo (`main` branch) at the specified SHA
-   Build the GitHub action and ADO extension
-   Perform any required signing
-   Perform any possible self-validation
-   Publish the GitHub action as the _Action artifact_
-   Publish the ADO extension as the _ADO artifact_

#### Action release pipeline

This will be implemented as manually triggered ADO pipeline. Once triggered, the **action release pipeline** will do the following: Assume that our release version is `vX.Y.Z`

-   Download the _Action artifact_ from the **build pipeline**
-   Commit the _Action artifact_ to the repo (external to any branch)
-   Create a release tag (_vX.Y.Z_) pointing the new commmit
-   Create or update the major version tag (_vX_)
-   Create a `vX.Y.Z-sources-gh` tag that corresponds to the specified source commit
-   Push all of the created/updated tags

#### ADO extension release workflow

This will be implemented as an ADO pipeline that is manually triggered. Once triggered, the **ADO extension release workflow** will do the following:

-   Download the _ADO artifact_ from the **build pipeline**
-   Publish the _ADO artifact_ to the marketplace
-   Create a `vX.Y.Z-sources-ado` tag that corresponds to the specified source commit
-   Push the new tag

#### Open questions:

-   Do we need Canary/Insider/Production for release validation, or are we OK with just Production?

### Models for consuming the GitHub action

#### Pin to the highest version a major version

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
