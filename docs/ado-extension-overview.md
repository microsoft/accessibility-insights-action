<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# Accessibility Insights for Azure DevOps

_This extension is in beta and preview mode._

Accessibility Insights for Azure DevOps is an extension that enables you to integrate Accessibility Insights' automated checks, powered by [axe-core](https://github.com/dequelabs/axe-core), into your Azure pipeline.

## Features

-   Scan all the pages in your website using the crawler, or define a list of URLs to scan

-   Get a combined and deduplicated report of all issues found in the scan

-   Get a summary of results both in the task log and the Extensions tab of the Azure Pipelines UI

-   (Optional) block PRs if there are accessibility issues found

## Documentation & Feedback

For more details about the extension or to provide feedback, please [visit our GitHub repository](https://github.com/microsoft/accessibility-insights-action).

_Automated checks can detect some common accessibility problems such as missing or invalid properties. But most accessibility problems can only be discovered through manual testing. Evaluate your web accessibility compliance completing an assessment with [Accessibility Insights for Web](https://accessibilityinsights.io/docs/en/web/overview/)._
