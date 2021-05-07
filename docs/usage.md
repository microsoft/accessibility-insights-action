<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# How to use the action

To use this action in your workflow (which, again, we don't yet recommend at all for any production projects), we recommend referring to a version tag:

-   `microsoft/accessibility-insights-action@v1` is updated with each `v1.x.y` release to refer to the most recent API-compatible version.
-   `microsoft/accessibility-insights-action@v1.1.0` refers to the exact version `v1.1.0`; use this to pin to a specific version.

Avoid referring to `@main` directly; it may contain undocumented breaking changes.

## Adding the GitHub Action

Reference this action in your GitHub workflow with the snippets on this page.

-   See [action.yml](https://github.com/microsoft/accessibility-insights-action/blob/main/action.yml) for option descriptions.
-   See [GitHub's documentation](https://docs.github.com/en/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow) for a primer on GitHub actions.

### Basic template

Save this workflow file in your GitHub repo as `.github/workflows/accessibility-validation.yml`. This template saves results to `output-dir` (default: `_accessibility-reports`) and uploads an artifact to the check run.

When you push this file to your repository, you should see the action running on the [Actions tab](https://docs.github.com/en/actions/quickstart#viewing-your-workflow-results).

```yml
name: Accessibility Validation

on:
    push:
        branches:
            - main
    pull_request:
        branches:
            - '**'

jobs:
    build:
        runs-on: ubuntu-latest

        steps:
            - uses: actions/checkout@v2

            # Insert any jobs here required to build your website files

            - name: Scan for accessibility issues
              uses: microsoft/accessibility-insights-action@v1
              with:
                  repo-token: ${{ secrets.GITHUB_TOKEN }}
                  # Provide either site-dir or url
                  # site-dir: ${{ github.workspace }}/path-to-built-website
                  # url: your-website-url

            - name: Upload report artifact
              uses: actions/upload-artifact@v1.0.0
              with:
                  name: accessibility-reports
                  path: ${{ github.workspace }}/_accessibility-reports
```

### Scan local HTML files

Provide the location of your built HTML files using `site-dir` and (optionally) `scan-url-relative-path`. The action will serve the site for you using `express`.

```yml
- name: Scan for accessibility issues
  uses: microsoft/accessibility-insights-action@v1
  with:
      repo-token: ${{ secrets.GITHUB_TOKEN }}
      site-dir: ${{ github.workspace }}/website/public
      scan-url-relative-path: /index.html
```

### Scan a URL

Provide the website URL. The URL should already be hosted - something like `http://localhost:12345/` or `https://example.com`.

```yml
- name: Scan for A11y issues
  uses: microsoft/accessibility-insights-action@v1
  with:
      url: http://localhost:12345/
```

The `url` parameter takes priority over `site-dir`. If `url` is provided, static file options like `site-dir` and `scan-url-relative-path` are ignored.

### Modify crawling options

The action supports several crawling options defined in [action.yml](https://github.com/microsoft/accessibility-insights-action/blob/main/action.yml).

For instance, you can:

-   use `max-urls: 1` to turn off crawling
-   include a list of additional URLs to scan (the crawler won't find pages that are unlinked from the base page)

For `discovery-patterns`, `input-file`, and `input-urls`, note that these options expect resolved URLs. If you provide static HTML files via `site-dir`, you should also provide `localhost-port` so that you can anticipate the base URL of the file server (`http://localhost:localhost-port/`).

Examples:

```yml
- name: Scan for A11y issues (with url)
  uses: microsoft/accessibility-insights-action@v1
  with:
      url: http://localhost:12345/
      input-urls: http://localhost:12345/other-url http://localhost:12345/other-url2
```

```yml
- name: Scan for A11y issues (with site-dir)
  uses: microsoft/accessibility-insights-action@v1
  with:
      site-dir: ${{ github.workspace }}/website/public
      localhost-port: 12345
      input-urls: http://localhost:12345/unlinked-page.html
```

## Viewing results

-   In the GitHub [Actions tab](https://docs.github.com/en/actions/quickstart#viewing-your-workflow-results), select the workflow run you're interested in. The summary page contains an artifact. If you download and extract the contents of that folder, you'll find an `index.html` report with detailed results.
-   If the workflow was triggered by a pull request, the action should leave a comment on the pull request with results.

## Blocking pull requests

You can choose to block pull requests if the action finds accessibility issues.

1. Ensure the action is [triggered on each pull request](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#configuring-workflow-events).
2. [Create a branch protection rule](https://docs.github.com/en/github/administering-a-repository/managing-a-branch-protection-rule#creating-a-branch-protection-rule) that requires the accessibility check to pass for a pull request to be merged.

## Troubleshooting

-   If the action didn't trigger as you expected, go to the ["on" section](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#on) of your yml file. Make sure any listed branch names are correct for your repository.
-   If the action fails to complete, you can check the build logs for execution errors. Using the template above, these logs will be in the `Scan for A11y issues` step.
-   If you can't find an artifact, note that your workflow must include an `actions/upload-artifact` step to add the report folder to your check results. See the "Basic template" above.
