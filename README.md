<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# ![Product Logo](./icons/brand-blue-48px.png) Accessibility Insights Azure DevOps (ADO) extension

[![codecov](https://codecov.io/gh/microsoft/accessibility-insights-action/branch/main/graph/badge.svg)](https://codecov.io/gh/microsoft/accessibility-insights-action)

## About

The Accessibility Insights Azure DevOps (ADO) extension helps integrate automated accessibility tests in your Azure pipeline. You can configure the ADO extension to scan a single page or crawl an entire site. This can work for static HTML files in your repository, a local web server, or remote URLs. It is currently only available for Microsoft internal teams.

The ADO extension uses the [axe-core](https://github.com/dequelabs/axe-core) rules engine to scan websites and web apps for common accessibility issues.

While automated checks can detect some common accessibility problems such as missing or invalid properties, most accessibility problems can only be discovered through manual testing. The best way to evaluate web accessibility compliance is to complete an assessment using [Accessibility Insights for Web](https://accessibilityinsights.io/docs/web/overview/).

For Microsoft internal teams, visit [how to use the Azure DevOps (ADO) extension](docs/ado-extension-usage.md).

## Contributing

To build and test, visit [developer docs](./dev/README.md).

Visit [CONTRIBUTING.md](./CONTRIBUTING.md) for more information about the contributor license agreement.
