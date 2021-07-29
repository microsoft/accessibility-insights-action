<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

## Release Strategy

### Release Branch

This repo will be the release point for our GitHub action. We'll create a single top-level `/release` branch, parallel to the `/main` branch, and it will be used by all consumers.

```
/main
/release
```

### Pipeline manipulation of `release` branch

For each release, the pipeline will do the following:

-   Clone the `/release` branch at its latest commit
-   Delete all files from the `/release` branch
-   Copy the newly built distributable files to the `/release` branch
-   Commit the changes to the `/release` branch
-   Create a tag that corresponds to the commit. Expected format is `v1.0.3`
-   Create or update the major version tag (name matches the major version of the just-created tag, so `v1` in this case) to reference the same commit. We will only update this tag if the new release is a higher version than the major version tag, so if the major version tag pointed to `v1.0.4`, we wouldn't "rewind" it back to `v1.0.3`

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

#### Use the most recent commit to the release branch

Note that this is generally not recommended, both because it will float and because the returned version is unpredictable. It will always return the _most recent commit_ to the `/release` branch, which is not guaranteed to be the latest _version_ in some maintenance scenarios. That said, it is a supported scenario:

The yaml file excerpt would look something like this:

```
  steps:
    name: Check Accessibility
    uses: actions/microsoft/accessibility-insights-action/release
```

#### Use the latest version

If we need this functionality (for the validation pipeilne, perhaps), we can make the release pipeline responsible for maintaining a `latest` tag that always references the release with the _highest version_. If we do this, then the yaml file excerpt would look something like this:

```
  steps:
    name: Check Accessibility
    uses: actions/microsoft/accessibility-insights-action@latest
```
