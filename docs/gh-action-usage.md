<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# How to use the GitHub Action

To use this action in your workflow (which, again, we don't yet recommend at all for any production projects), we recommend referring to a version tag:

-   To migrate from version 2, see [Migrating from version 2 to version 3](#migrating-from-version-2-to-version-3)
-   `microsoft/accessibility-insights-action@v3` is updated with each `v3.x.y` release to refer to the most recent API-compatible version.
-   `microsoft/accessibility-insights-action@v3.0.0` refers to the exact version `v3.0.0`; use this to pin to a specific version.

Avoid referring to `@main` directly; it may contain undocumented breaking changes.

## Adding the GitHub Action

Reference this action in your GitHub workflow with the snippets on this page.

-   See [action.yml](https://github.com/microsoft/accessibility-insights-action/blob/v3/action.yml) for option descriptions. Make sure you view the correct source file for your version (e.g. v3 in the URL)
-   See [GitHub's documentation](https://docs.github.com/en/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow) for a primer on GitHub actions.

### Basic template

Save this workflow file in your GitHub repo as `.github/workflows/accessibility-validation.yml`. This template saves results to `output-dir` (default: `_accessibility-reports`) and uploads an artifact to the job summary.

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
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                  node-version: 16

            # Insert any jobs here required to build your website files

            - name: Scan for accessibility issues
              uses: microsoft/accessibility-insights-action@v3
              with:
                  # Provide either static-site-dir or url
                  # static-site-dir: ${{ github.workspace }}/path-to-built-website
                  # url: your-website-url

                  # Provide any additional inputs here
                  # fail-on-accessibility-error: false

            - name: Upload report artifact
              if: success() || failure()
              uses: actions/upload-artifact@v3
              with:
                  name: accessibility-reports
                  path: ${{ github.workspace }}/_accessibility-reports
```

### Scan a URL

Provide the website URL. The URL should already be hosted - something like `http://localhost:12345/` or `https://example.com`.

```yml
- name: Scan for accessibility issues
  uses: microsoft/accessibility-insights-action@v3
  with:
      url: http://localhost:12345/
```

The `url` parameter takes priority over `static-site-dir`. If `url` is provided, static file options like `static-site-dir` and `static-site-url-relative-path` are ignored.

### Scan local HTML files

Provide the location of your built HTML files using `static-site-dir` and (optionally) `static-site-url-relative-path`. The action will serve the site for you using `express`.

```yml
- name: Scan for accessibility issues
  uses: microsoft/accessibility-insights-action@v3
  with:
      static-site-dir: ${{ github.workspace }}/website/root
      static-site-url-relative-path: /
```

The file server will host files inside `static-site-dir`. The action begins crawling from `http://localhost:port/static-site-url-relative-path/`.

If you prefer to start crawling from a child directory, note that:

-   the local file server can only host descendants of `static-site-dir`
-   By default, the crawler only visits links prefixed with `http://localhost:port/static-site-url-relative-path/`. If you want to crawl links outside `static-site-url-relative-path`, provide something like `discovery-patterns: http://localhost:port/[.*]`

### Modify crawling options

The action supports several crawling options defined in [action.yml](https://github.com/microsoft/accessibility-insights-action/blob/v3/action.yml).

For instance, you can:

-   use `max-urls: 1` to turn off crawling
-   include a list of additional URLs to scan (the crawler won't find pages that are unlinked from the base page)

For `discovery-patterns`, `input-file`, and `input-urls`, note that these options expect resolved URLs. If you provide static HTML files via `static-site-dir`, you should also provide `static-site-port` so that you can anticipate the base URL of the file server (`http://localhost:static-site-port/`).

Examples:

```yml
- name: Scan for accessibility issues (with url)
  uses: microsoft/accessibility-insights-action@v3
  with:
      url: http://localhost:12345/
      input-urls: http://localhost:12345/other-url http://localhost:12345/other-url2
```

```yml
- name: Scan for accessibility issues (with static-site-dir)
  uses: microsoft/accessibility-insights-action@v3
  with:
      static-site-dir: ${{ github.workspace }}/website/root
      static-site-port: 12345
      input-urls: http://localhost:12345/unlinked-page.html
```

## Viewing results

-   In the GitHub [Actions tab](https://docs.github.com/en/actions/quickstart#viewing-your-workflow-results), select the workflow run you're interested in. The summary page contains an artifact. If you download and extract the contents of that folder, you'll find an `index.html` report with detailed results.
-   There are two places in which you can view a summary of the accessibility issues found:
    -   The summary page for the workflow run.
    -   The job's task log.

## Blocking pull requests

You can choose to block pull requests if the action finds accessibility issues.

1. Ensure the action is [triggered on each pull request](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#configuring-workflow-events).
2. [Create a branch protection rule](https://docs.github.com/en/github/administering-a-repository/managing-a-branch-protection-rule#creating-a-branch-protection-rule) that requires the accessibility check to pass for a pull request to be merged.
3. Ensure that the `fail-on-accessibility-error` input variable is not set to `false`.

## Migrating from version 2 to version 3

Version 3.x of the action contains several breaking changes from version 2.x. To migrate, you will need to make a few adjustments:

1. The Accessibility Insights action no longer requires extra GitHub permissions to work
    - If you previously specified a `repo-token` input, you should remove it.
2. The action inputs related to specifying a "static" site to scan (`site-dir`, `localhost-port`, and `scan-url-relative-path`) have changed to make it more clear that they are related (and mutually exclusive with `url`).
    - If you previously specified a `site-dir`, you should:
        - Rename your existing `site-dir` input to `static-site-dir`
        - Rename your existing `localhost-port` input to `static-site-port` (if specified)
        - Rename your existing `scan-url-relative-path` input to `static-site-url-relative-path` (if specified)
    - If you previously specified _both_ `url` and `site-dir`, you had a misconfiguration - these inputs were mutually exclusive, and the `url` input was being silently ignored. Remove the `url` input and follow the instructions above for `site-dir`.
    - If you previously specified just `url` and not `site-dir`, you should leave the original `url` input as-is
    - There is now an optional "Hosting Mode" input to make it more clear which options can be used together.
        - When `hosting-mode` is set to `staticSite`, `static-site-dir` must be set, and `url` must not be set.
        - When `hosting-mode` is set to `dynamicSite`, `url` must be set, and `static-site-dir`, `static-site-port`, and `static-site-url-relative-path` must not be set.
3. By default, the action now fails if it detects an accessibility failure
    - If you would prefer to not have accessibility issues treated as a failure, you can add `fail-on-accessibility-error: false`

## Troubleshooting

-   If the action didn't trigger as you expected, go to the ["on" section](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions#on) of your yml file. Make sure any listed branch names are correct for your repository.
-   If the action fails to complete, you can check the build logs for execution errors. Using the template above, these logs will be in the `Scan for accessibility issues` step.
-   If you can't find an artifact, note that your workflow must include an `actions/upload-artifact` step to add the report folder to your check results. See the "Basic template" above.
-   If the scan takes longer than 90 seconds, you can override the default timeout by providing a value for `scan-timeout` in milliseconds.
-   The default viewport that the action uses has a width of 1920px and a height of 1080px.
