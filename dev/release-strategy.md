<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

## Release Strategy

### Repo

-   We will store the both the sources and the releases in the `accessibility-insights-action` repo (unchanged from today). If we later decide to change this, we will move the source code to a new repo and keep the consumption experience unchanged.
-   All code contributions will merge into the main branch
-   All releases will be workflow-controlled and will be external to the main branch
-   The existing ./dist folder of the repo will first be removed, then added to `./.gitignore`. It will exist only for local building and testing

### Tags

#### Source tags

Each release will have a corresponding tag that identifies the commit used to generate that release. These tags _must_ have names that are distinct from the release tags, since they point to different commits. To make the tags as intuitive as possible we will use the following pattern

| Version | Type of release | Source tag release |
| ------- | --------------- | ------------------ |
| v1.0.2  | ADO Extension   | v1.0.2-sources-ado |

### Pipelines

We will have one build pipeline and one release pipeline. Here are the responsibilities of each workflow.

#### Build pipeline

This will be implemented as an ADO pipeline that will trigger on each commit to the `main` branch. Once triggered, the **build pipeline** will do the following:

-   Clone the repo (`main` branch) at the specified SHA
-   Build the ADO extension
-   Perform any required signing
-   Perform any possible self-validation
-   Publish the ADO extension as the _ADO artifact_

#### ADO extension release workflow

This will be implemented as an ADO pipeline that is manually triggered. Once triggered, the **ADO extension release workflow** will do the following:

-   Download the _ADO artifact_ from the **build pipeline**
-   Publish the _ADO artifact_ to the marketplace
-   Create a `vX.Y.Z-sources-ado` tag that corresponds to the specified source commit
-   Push the new tag
