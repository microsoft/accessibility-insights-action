<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# How to use the Azure DevOps extension

These instructions are for version 2 of the extension.

-   To migrate from version 1, see [Migrating from version 1 to version 2](ado-extension/migrating-from-v1-to-v2.md)
-   For version 1 docs, see [the version of this document as of the v1.1.1 release](https://github.com/microsoft/accessibility-insights-action/blob/v1.1.1-sources-ado/docs/ado-extension-usage.md)

## Prerequisites

### Tools

-   [Yarn](https://yarnpkg.com/getting-started/install) >= 1.22.10
    -   The Accessibility Insights for Azure DevOps extension uses Yarn to install dependencies. If your build agent does not come with Yarn pre-installed, you must add a step to install it yourself.
    ```yml
    - script: npm install yarn@1.22.10 -g
      displayName: install yarn as a global dependency
    ```
-   You must have at least one of the following scenarios in order to use the extension:
    -   The ability to serve your website at a localhost URL in an Azure DevOps pipeline.
        -   If your site needs to be run using a specific server (e.g., an Express server with specific routes configured), you should include any relevant steps to set up a localhost instance of your app prior to running the Accessibility Insights task. You can then point the Accessibility Insights task to the localhost URL that is serving your site using the `url` input.
    -   A preproduction site available to point the task to such as a canary, staging, or dev site.
    -   A static HTML file at the root of your site that can be pointed to.
        -   If your site's build/bundling process produces an HTML file that you can open directly, you can point the extension directly at the built HTML file using the `staticSiteDir` input.

## Adding the extension

Install [Accessibility Insights for Azure DevOps - Production](https://marketplace.visualstudio.com/items?itemName=accessibility-insights.prod).

-   See [Install extensions from Azure DevOps documentation](https://docs.microsoft.com/en-us/azure/devops/marketplace/install-extension?view=azure-devops&tabs=browser) for steps on how to install an extension to your organization.

Reference this extension in your Azure pipelines by adding the relevant YAML file using the snippets on this document as guidance.

-   See [task.json](https://github.com/microsoft/accessibility-insights-action/blob/main/packages/ado-extension/task.json) for option descriptions.

Note: we also support adding the task via the classic pipeline interface in Azure DevOps.

### Basic template

Save this workflow file in your Azure DevOps repo as `azure-pipelines.yml` or in your GitHub repo as `/pipelines/accessibility-validation.yml`.

When you push this file to your repository, you should see the task running in the build.

```yml
trigger:
    - main

pool:
    vmImage: ubuntu-latest

steps:
    # Insert any jobs here required to build your website files

    - task: accessibility-insights.prod.task.accessibility-insights@3
      displayName: Scan for accessibility issues
      inputs:
          # Provide either staticSiteDir or url
          # staticSiteDir: '$(System.DefaultWorkingDirectory)/path-to-built-website/'
          # url: 'your-website-url'
```

### Scan a URL

Provide the website URL. The URL should already be hosted - something like `http://localhost:12345/` or `https://example.com`.

```yml
- task: accessibility-insights.prod.task.accessibility-insights@3
  displayName: Scan for accessibility issues
  inputs:
      url: 'http://localhost:12345/'
```

The `url` parameter takes priority over `staticSiteDir`. If `url` is provided, static file options like `staticSiteDir` and `staticSiteUrlRelativePath` are ignored.

### Scan local HTML files

Provide the location of your built HTML files using `staticSiteDir` and (optionally) `staticSiteUrlRelativePath`. The action will serve the site for you using `express`.

```yml
- task: accessibility-insights.prod.task.accessibility-insights@3
  displayName: Scan for accessibility issues
  inputs:
      staticSiteDir: '$(System.DefaultWorkingDirectory)/website/root/'
      staticSiteUrlRelativePath: '/'
```

The file server will host files inside `staticSiteDir`. The action begins crawling from `http://localhost:port/staticSiteUrlRelativePath/`.

If you prefer to start crawling from a child directory, note that:

-   the local file server can only host descendants of `staticSiteDir`
-   By default, the crawler only visits links prefixed with `http://localhost:port/staticSiteUrlRelativePath/`. If you want to crawl links outside `staticSiteUrlRelativePath`, provide something like `discoveryPatterns: 'http://localhost:port/[.*]'`

### Modify crawling options

The action supports several crawling options defined in [task.json](https://github.com/microsoft/accessibility-insights-action/blob/main/packages/ado-extension/task.json).

For instance, you can:

-   use `maxUrls: 1` to exclusively set the extension to only scan the first Url that has been inputted
-   set `maxUrls` to the number of URLs in `inputUrls` to scan a fixed list of URLs for your site

For `discoveryPatterns`, `inputFile`, and `inputUrls`, note that these options expect resolved URLs. If you provide static HTML files via `staticSiteDir`, you should also provide `staticSitePort` so that you can anticipate the base URL of the file server (`http://localhost:staticSitePort/`).

Examples:

```yml
- task: accessibility-insights.prod.task.accessibility-insights@3
  displayName: Scan for accessibility issues (with url)
  inputs:
      url: 'http://localhost:12345/'
      inputUrls: 'http://localhost:12345/other-url http://localhost:12345/other-url2'
```

```yml
- task: accessibility-insights.prod.task.accessibility-insights@3
  displayName: Scan for accessibility issues (with staticSiteDir)
  inputs:
      staticSiteDir: '$(System.DefaultWorkingDirectory)/website/root/'
      staticSitePort: '12345'
      inputUrls: 'http://localhost:12345/unlinked-page.html'
```

## Using a baseline file

Baseline files are intended to make it easy to detect accessibility changes introduced by a PR. A baseline file exists in the repo and represents the last known accessibility scan results. During each PR, the scanner runs on the PR output and compares the results to the baseline file. Any difference represents changes that are caused by the PR in question. The PR author then chooses between changing the code (if the change was unintended) or updating the baseline file (if the change was intended). The workflow is as follows:

1. The accessibility scanner runs on each PR iteration.
2. If the scanner results match the baseline file, the scanner task succeeds. There is no need to modify the baseline file for these PR's.
3. If the scanner results do not match the baseline file, the scanner task fails and creates an updated baseline file. If the author chooses to update the baseline file, they download the updated baseline file from the build artifacts, incorporate it into the PR, and push a new commit. This triggers a new PR iteration where the baseline file should now be current.

For a commit that initially specifies a baseline file, the scanner will fail in step 2. Download the updated baseline file, incorporate it into the PR, and push the result.

### Baseline files

Each baseline file is a text-based file hosted in your repo. It tracks known accessibility violations. If your pipeline runs PR's in multiple environments (different browsers and/or operating systems), you should use a separate baseline file for each environment. This allows for a clear signal of how each environment is impacted by any specific change. Even though the baseline file is textual, merging of this file is strongly discouraged. In the case where the baseline file has been modified by competing commits, the safest option is to merge changes from **main** and simply accept the current **main** version of the baseline file, then push that change to the PR. This will trigger a new scan and ensure that any accessibility scan results that are reported are limited to those related to the current PR.

The baseline file is specified as a parameter to the scanning task, as shown in the YAML below.

### Publishing baseline files

When the `basleineFile` input is set and the scanning tool fails, it creates a new baseline file--reflecting the current accessibility scanner results--on the disk of the build machine. This file has the same filename as the `baselineFile` input specified. By default, this new baseline file is automatically uploaded as an artifact named `accessibility-reports`, allowing the PR author to easily access the updated baseline file.

### Example YAML

Here is an example of a YAML file that is configured to take advantage of a baseline, assuming just one environment:

```yml
- task: accessibility-insights.prod.task.accessibility-insights@3
  displayName: Scan for accessibility issues
  inputs:
      url: 'http://localhost:12345/'
      baselineFile: '$(Build.SourcesDirectory)/baselines/my-web-site.baseline'
```

## Report Artifacts

By default, an HTML report containing detailed results is automatically uploaded as a pipeline artifact named `accessibility-reports`. You can customize this artifact name by setting the `outputArtifactName` parameter in your YAML file. A link to the artifact will appear in both the task log and in the Extensions tab of the pipeline run.

To view the report, navigate to Artifacts from the build. Under `accessibility-reports`, or the artifact name manually specified, you'll find the downloadable report labeled `index.html`.

If you would prefer not to upload an artifact, or if you are in a Pipelines environment where individual tasks are not allowed to upload artifacts (for example, OneBranch), you can opt out of this automatic artifact upload by setting the `uploadOutputArtifact` parameter to `false`. You can set the `outputDir` parameter to control where the output gets written to on the build agent.

## Summary results

-   Summary results are output in both the task log and in the Extensions tab of the pipeline run. To view the task log, click into the job and then click on the `accessibilityinsights` task.

## Blocking pull requests

You can choose to block pull requests if the extension finds accessibility issues.

1. Ensure the extension is [triggered on each pull request](https://docs.microsoft.com/en-us/azure/devops/pipelines/customize-pipeline?view=azure-devops#customize-ci-triggers).
2. Ensure that you have set the `failOnAccessibilityError` input variable to `true`.

## Running multiple times in a single pipeline

If you want to run multiple Accessibility Insights steps in a single pipeline, you will need to ensure that each step uses a unique `outputArtifactName`.

Each step also needs a unique output directory on the build agent. The task will generate unique output directories for you by default, but if you override `outputDir`, you will need to ensure that it is also unique among all steps.

### Example Pipelines

Here are some example pipelines with various configuration scenarios:

| Description                                                 | Link                                                                                                                                                                                                                                                          | Expected Outcome |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| Basic URL with no accessibility issues found                | [![Build Status](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_apis/build/status/54?branchName=main)](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_build/latest?definitionId=54&branchName=main) | Pass             |
| Basic URL with accessibility issues found                   | [![Build Status](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_apis/build/status/55?branchName=main)](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_build/latest?definitionId=55&branchName=main) | Fail             |
| Static site being served by the Accessibility Insights task | [![Build Status](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_apis/build/status/53?branchName=main)](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_build/latest?definitionId=53&branchName=main) | Fail             |
| Localhost site being served in pipeline                     | [![Build Status](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_apis/build/status/52?branchName=main)](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_build/latest?definitionId=52&branchName=main) | Fail             |
| Using a baseline file                                       | [![Build Status](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_apis/build/status/51?branchName=main)](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_build/latest?definitionId=51&branchName=main) | Pass             |
| Using inputUrls input to specify list of URLs               | [![Build Status](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_apis/build/status/50?branchName=main)](https://dev.azure.com/accessibility-insights/accessibility-insights-action/_build/latest?definitionId=50&branchName=main) | Fail             |

## Troubleshooting

-   If the action didn't trigger as you expected, check the `trigger` or `pr` sections of your yml file. Make sure any listed branch names are correct for your repository.
-   If the action fails to complete, you can check the build logs for execution errors. Using the template above, these logs will be in the `Scan for accessibility issues` step.
-   If the scan takes longer than 90 seconds, you can override the default timeout by providing a value for `scanTimeout` in milliseconds.
