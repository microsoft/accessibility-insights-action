<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

## Release Strategy

### Repos

-   We will store the sources in the `accessibility-insights-action` repo (unchanged from today)
-   We will store the action releases in a _separate_ repo. Name is TBD, but maybe `accessibility-insights-action-dist`. For purposes of this doc, we'll call the two repos "the sources repo" and "the distribution repo"
-   For a given release (_e.g._, `v1.0.3`), we will use the same tag name in both repos to make it easy to correlate the two.
-   All changes to the distribution repo will be controlled by the pipeline
-   Each release in the distribution repo will be in a branch that matches its tag. That branch will contain just the files needed to release the action (`action.yml`, the code packed into `index.js`, etc.)
-   Consuming actions will reference the distribution repo.

### Branches in the distribution repo

The distribution repo will contain 1 branch per released version. The name of the branch will be the same as the name of the release, as shown here:

```
/v1.0.1
/v1.0.2
/v1.0.3
/v2.0.0
```

### Tags in the distribution repo

The distribution repo will have a tag that points to each specific release within the repo. In addition, each major release version will have a tag that points to the latest release of that major version. We could optionally also have a `latest` tag, which would point to the highest released version, as shown here:

```
/v1.0.1   <== v1.0.1
/v1.0.2   <== v1.0.2
/v1.0.3   <== v1.0.3, v1
/v2.0.0   <== v2.0.0, v2, latest
```

### Pipelines

Logically we will have a build pipeline and 2 release pipelines (one for the GitHub action, one for the ADO extension). These may or may not be completely separate pipelines at first. Here are the responsibilities of each pipeline

#### Build pipeline

On each iteration, the build pipeline will do the following:

-   Clone the source repo
-   Build the `/dist` folder and the _signed_ ADO extension (if signing is required)
-   Perform any possible self-validation
-   Publish the contents of the `/dist` folder as an artifact
-   Publish the ADO extension as an artifact

#### Action release pipeline

On each iteration, the action release pipeline will do the following:

-   Clone the distribution repo
-   Download the action artifact created by the release pipeline
-   Create a new branch of the appropriate name (probably fail if the branch already exists)
-   Copy the action artifact into the new branch
-   Commit the new branch
-   Create a release tag
-   Create or update the major version tag
-   Create or update the `latest` tag (if we use it)

#### ADO extension release pipeline

On each iteration, the ADO extension release pipeline will do the following:

-   Download the action artifact created by the release pipeline
-   Publish the ADO artifact

#### Pipeline questions:

-   What should trigger the build pipeline? Every commit?
-   What should trigger the release pipelines? Manually triggered?
-   How do we tag the sources repo when the Action release pipeline runs?
-   Are there scenarios where we would publish _just_ the action or _just_ the ADO extension?

### Models for consuming the action

#### Pin to the latest version a major version

The yaml file excerpt would look something like this:

```
  steps:
    name: Check Accessibility
    uses: actions/microsoft/accessibility-insights-action-dist@v1
```

#### Pin to a specific release

The yaml file excerpt would look something like this:

```
  steps:
    name: Check Accessibility
    uses: actions/microsoft/accessibility-insights-action-dist@v1.0.3
```

#### Use the latest version

If we need this functionality (for the validation pipeilne, perhaps), we can make the release pipeline responsible for maintaining a `latest` tag that always references the release with the _highest version_. If we do this, then the yaml file excerpt would look something like this:

```
  steps:
    name: Check Accessibility
    uses: actions/microsoft/accessibility-insights-action@latest
```
