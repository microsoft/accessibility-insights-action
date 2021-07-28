<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

## Release Strategy

This repo will be the release point for our GitHub action. We will use a release strategy that enables supports for multiple versions, while providing sufficient flexibility to also support releases other than actions. To this end, we will adopt the following branch structure for releases of major versions 1 to N of the GitHub action:

```
/main
/release
  /action
    /v1
    .
    .
    .
    /vN
```

Releases of other components (such as the Azure DevOps extension) will be siblings of the `/release/action` branch.

The contents of each versioned branch will get completely refreshed with each new release, so syncing the version branch will always return the latest release of _that version_. We will also create a new tag (_e.g._, `v1.0.3`) with each new release. All branches under the `/release` branch will be locked down by branch policy that restricts all changes to the build pipeline. One potential exception to this practice might be a repo administrator creating the new branch (_e.g._, `/release/v2`) when a new major release is being prepared.

Users wishing to always use _latest release_ of the `v1` action would include the following in their yml file:

```
  steps:
    name: Check Accessibility
    uses: actions/microsoft/accessibility-insights-action/release/action/v1
```

Users wishing to use a _specific release_ (_e.g._, `v1.0.3`) of the `v1` action would include the following in their yml file:

```
  steps:
    name: Check Accessibility
    uses: actions/microsoft/accessibility-insights-action/release/action/v1@v1.0.3
```
