<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# How to use the Azure DevOps extension

## Adding the extension

Install [Accessibility Insights for Azure DevOps - Production](https://marketplace.visualstudio.com/items?itemName=accessibility-insights.prod).

-   See [Install extensions from Azure DevOps documentation](https://docs.microsoft.com/en-us/azure/devops/marketplace/install-extension?view=azure-devops&tabs=browser) for steps on how to install an extension to your organization.

Reference this action in your Azure pipelines with the snippets on this page.

-   See [action.yml](https://github.com/microsoft/accessibility-insights-action/blob/v2/action.yml) for option descriptions. Make sure you view the correct source file for your version (e.g. v2 in the URL)

### Basic template

Save this workflow file in your Azure DevOps repo as `azure-pipelines.yml` or in your GitHub repo as `/pipelines/accessibility-validation.yml`. This template saves results to `output-dir` (default: `_accessibility-reports`) and uploads an artifact to the build in Azure DevOps.

When you push this file to your repository, you should see the action running in the build.

```yml
trigger:
    - main

pool:
    vmImage: ubuntu-latest

steps:
    # Insert any jobs here required to build your website files

    - task: accessibility-insights.prod.task.accessibility-insights@0
      inputs:
          # Provide either site-dir or url
          # site-dir: ${{ github.workspace }}/path-to-built-website
          # url: your-website-url

    - task: PublishBuildArtifacts@1
      inputs:
          pathToPublish: '$(System.DefaultWorkingDirectory)_accessibility-reports'
          artifactName: 'accessibility-reports'
```

### Scan a URL

Provide the website URL. The URL should already be hosted - something like `http://localhost:12345/` or `https://example.com`.

```yml
- task: accessibility-insights.prod.task.accessibility-insights@0
  inputs:
      url: 'http://localhost:12345/'
```

The `url` parameter takes priority over `site-dir`. If `url` is provided, static file options like `site-dir` and `scan-url-relative-path` are ignored.

### Scan local HTML files

Provide the location of your built HTML files using `site-dir` and (optionally) `scan-url-relative-path`. The action will serve the site for you using `express`.

```yml
- task: accessibility-insights.prod.task.accessibility-insights@0
  inputs:
      site-dir: '$(System.DefaultWorkingDirectory)/website/root'
      scan-url-relative-path: '/' # use // if windows agent
```

The file server will host files inside `site-dir`. The action begins crawling from `http://localhost:port/scan-url-relative-path/`.

Generally `/` on Ubuntu and `//` on Windows are good defaults for `scan-url-relative-path`. If you prefer to start crawling from a child directory, note that:

-   the local file server can only host descendants of `site-dir`
-   By default, the crawler only visits links prefixed with `http://localhost:port/scan-url-relative-path/`. If you want to crawl links outside `scan-url-relative-path`, provide something like `discovery-patterns: http://localhost:port/[.*]`

### Modify crawling options

The action supports several crawling options defined in [action.yml](https://github.com/microsoft/accessibility-insights-action/blob/v2/action.yml).

For instance, you can:

-   use `max-urls: 1` to turn off crawling
-   include a list of additional URLs to scan (the crawler won't find pages that are unlinked from the base page)

For `discovery-patterns`, `input-file`, and `input-urls`, note that these options expect resolved URLs. If you provide static HTML files via `site-dir`, you should also provide `localhost-port` so that you can anticipate the base URL of the file server (`http://localhost:localhost-port/`).

Examples:

```yml
- task: accessibility-insights.prod.task.accessibility-insights@0
  inputs:
      url: 'http://localhost:12345/'
      input-urls: 'http://localhost:12345/other-url http://localhost:12345/other-url2'
```

```yml
- task: accessibility-insights.prod.task.accessibility-insights@0
  inputs:
      site-dir: '$(System.DefaultWorkingDirectory)/website/root'
      localhost-port: '12345'
      input-urls: 'http://localhost:12345/unlinked-page.html'
```

## Viewing results

-   An HTML report containing detailed results is saved to disk. To view it, you need to have added the step to upload artifacts to your yml file (see [Basic template](#basic-template)). Navigate to Artifacts from the build. Under `_accessibility-reports`, you'll find the downloadable report labeled `index.html`.

-   If the workflow was triggered by a pull request, the action should leave a comment on the Azure DevOps pull request with results. The extension does not leave comments on repos in GitHub.

## Blocking pull requests

You can choose to block pull requests if the action finds accessibility issues.

1. Ensure the action is [triggered on each pull request](https://docs.microsoft.com/en-us/azure/devops/pipelines/customize-pipeline?view=azure-devops#customize-ci-triggers).
2. Ensure that you have set the `failOnAccessibilityError` input variable to `true`.

## Troubleshooting

-   If the action didn't trigger as you expected, check the `trigger` or `pr` sections of your yml file. Make sure any listed branch names are correct for your repository.
-   If the action fails to complete, you can check the build logs for execution errors.
<!-- Using the template above, these logs will be in the `Scan for accessibility issues` step. -->
-   If you can't find an artifact, note that your workflow must include a `PublishBuildArtifacts` step to add the report folder to your check results. See the "Basic template" above.
-   If you're running on a `windows-2019` agent we recommend `//` instead of `/` for `scan-url-relative-path`.
-   If the scan takes longer than 90 seconds, you can override the default timeout by providing a value for `scan-timeout`
