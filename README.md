<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# ![Product Logo](./icons/brand-blue-48px.png) Accessibility Insights Action

[![Actions Status](https://github.com/microsoft/accessibility-insights-action/workflows/Build/badge.svg)](https://github.com/microsoft/accessibility-insights-action/actions)
[![codecov](https://codecov.io/gh/microsoft/accessibility-insights-action/branch/main/graph/badge.svg)](https://codecov.io/gh/microsoft/accessibility-insights-action)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=microsoft/accessibility-insights-action)](https://dependabot.com)

_This action is still in early development & we don't recommend its usage in public production projects yet._

## About

The Accessibility Insights Action helps integrate automated accessibility tests in your GitHub workflow and Azure pipeline. It can be configured to scan a single page or also crawl and scan pages accessed from links on the given page. This can work for static files in your repository or remote URLs.
The Accessibility Insights Action uses the [axe-core](https://github.com/dequelabs/axe-core) rules engine to scan websites and web apps for common accessibility issues.

Automated checks can detect some common accessibility problems such as missing or invalid properties. But most accessibility problems can only be discovered through manual testing. The best way to evaluate web accessibility compliance is to complete an assessment using [Accessibility Insights for Web](https://accessibilityinsights.io/docs/en/web/overview/).

For more information, see [How to use the GitHub Action](docs/gh-action-usage.md) and [How to use the Azure DevOps extension](docs/ado-extension-usage.md).

## Contributing

To build and test, see [developer docs](./dev/README.md).

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more info about the contributor license agreement.
