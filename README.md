<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# ![Product Logo](./icons/brand-blue-48px.png) Accessibility Insights Action

[![Actions Status](https://github.com/microsoft/accessibility-insights-action/workflows/Build/badge.svg)](https://github.com/microsoft/accessibility-insights-action/actions)
[![codecov](https://codecov.io/gh/microsoft/accessibility-insights-action/branch/main/graph/badge.svg)](https://codecov.io/gh/microsoft/accessibility-insights-action)

## About

The Accessibility Insights Action and Extension help integrate automated accessibility tests in your GitHub workflow and Azure pipeline. You can configure it to scan a single page or crawl and scan pages accessed from links on the given page. This can work for static HTML files in your repository, a local web server, or remote URLs.

The Accessibility Insights Action and Extension use the [axe-core](https://github.com/dequelabs/axe-core) rules engine to scan websites and web apps for common accessibility issues.

Automated checks can detect some common accessibility problems such as missing or invalid properties. But most accessibility problems can only be discovered through manual testing. The best way to evaluate web accessibility compliance is to complete an assessment using [Accessibility Insights for Web](https://accessibilityinsights.io/docs/en/web/overview/).

-   For Microsoft internal teams, visit [how to use the Azure DevOps Extension](docs/ado-extension-usage.md).
-   For more information, visit [how to use the GitHub Action](docs/gh-action-usage.md).

## Contributing

To build and test, visit [developer docs](./dev/README.md).

Visit [CONTRIBUTING.md](./CONTRIBUTING.md) for more information about the contributor license agreement.
