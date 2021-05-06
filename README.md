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

The Accessibility Insights Action helps integrate automated accessibility tests in your GitHub workflow. It can be configured to scan a single page or also crawl and scan pages accessed from links on the given page. This can work for static files in your repository or remote URLs.
The Accessibility Insights Action uses the [axe-core](https://github.com/dequelabs/axe-core) rules engine to scan websites and web apps for common accessibility issues.

Automated checks can detect some common accessibility problems such as missing or invalid properties. But most accessibility problems can only be discovered through manual testing. The best way to evaluate web accessibility compliance is to complete an assessment using [Accessibility Insights for Web](https://accessibilityinsights.io/docs/en/web/overview/).

For more information, see [how to use the action](docs/usage.md).

## Contributing

This project welcomes contributions and suggestions. Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

See [CONTRIBUTING.md](./CONTRIBUTING.md) for more details.
