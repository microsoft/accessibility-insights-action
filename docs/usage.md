# How to use the action

_This action is still in early development & we don't recommend its usage in public production projects yet._

## Adding the GitHub Action

Reference this action in your GitHub workflow with the snippets on this page.

-   See [action.yml](https://github.com/microsoft/accessibility-insights-action/blob/main/action.yml) for option descriptions.
-   See [GitHub's documentation](https://docs.github.com/en/actions/learn-github-actions/introduction-to-github-actions#create-an-example-workflow) for a primer on GitHub actions.

### Basic template

Save this workflow file in your GitHub repo as `.github/workflows/accessibility-validation.yml`. The action saves results to `output-dir` (default: `_accessibility-reports`). After the scan action, upload the report folder as an artifact.

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

            - name: Scan for A11y issues
              uses: microsoft/accessibility-insights-action@v1
              with:
                  repo-token: ${{ secrets.GITHUB_TOKEN }}
                  # Provide either site-dir or url - see other snippets
                  # site-dir: ${{ github.workspace }}/path-to-built-website
                  # url: your-website-url

            - name: Upload report artifact
              uses: actions/upload-artifact@v1.0.0
              with:
                  name: accessibility-reports
                  path: ${{ github.workspace }}/_accessibility-reports
```

### Scan local HTML files

Provide the location of your built HTML files using `site-dir` and (optionally) `site-url-relative-path`. The action will serve the site for you using `express`.

```yml
- name: Scan for A11y issues
  uses: microsoft/accessibility-insights-action@v1
  with:
      repo-token: ${{ secrets.GITHUB_TOKEN }}
      site-dir: ${{ github.workspace }}/website/public
      site-url-relative-path: /index.html
```

### Scan a URL

Provide the website URL. The URL should already be hosted - something like `http://localhost:12345/` or `https://example.com`.

```yml
- name: Scan for A11y issues
  uses: microsoft/accessibility-insights-action@v1
  with:
      url: http://localhost:12345/
```

The `url` parameter takes priority over `site-dir`. If `url` is provided, `site-dir` and `site-url-relative-path` are ignored.

### Modify crawling options

The action supports several crawling options defined in [action.yml](https://github.com/microsoft/accessibility-insights-action/blob/main/action.yml).

For `discovery-patterns`, `input-file`, and `input-urls`, note that:

-   if `url` is provided, these values must be absolute
-   if `url` isn't provided (local HTML files), these values must be relative

Examples:

```yml
- name: Scan for A11y issues
  uses: microsoft/accessibility-insights-action@v1
  with:
      url: http://localhost:12345/
      input-urls: http://localhost:12345/other-url http://localhost:12345/other-url2
```

```yml
- name: Scan for A11y issues
  uses: microsoft/accessibility-insights-action@v1
  with:
      site-dir: ${{ github.workspace }}/website/public
      input-urls: ${{ github.workspace }}/website/public/dir/index.html ${{ github.workspace }}/website/public/dir2/index.html
```

When `site-dir` is used, the action resolves the paths in `discovery-patterns`, `input-file`, and `input-urls` for you against our `localhost` server.

## Blocking pull requests

You can choose to block pull requests if the action finds accessibility issues.

1. Ensure the action is [triggered on each pull request](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#configuring-workflow-events).
2. [Create a branch protection rule](https://docs.github.com/en/github/administering-a-repository/managing-a-branch-protection-rule#creating-a-branch-protection-rule) that requires the accessibility check to pass for a pull request to be merged.

## Troubleshooting

If the action fails to execute, you can check the build logs for execution errors. Using the template above, these logs will be in the `Scan for A11y issues` step.
