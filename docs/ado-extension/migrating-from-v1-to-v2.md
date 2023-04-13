<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

# Migrating from version 1 to version 2

Version 2.x of the extension contains several breaking changes from version 1.x. To migrate, you will need to make a few adjustments based on whether your pipeline is defined using a YAML file or the "Classic" Pipelines web interface:

## Migrating a YAML Pipeline definition

1. The Accessibility Insights task no longer requires extra Azure DevOps permissions to work
    - If you previously specified a `repoServiceConnectionName` input, you should remove it. If this Service Connection was created solely for use with this pipeline, you should delete it in your Azure DevOps Project's "Service Connections" settings.
    - If you did not previously specify `repoServiceConnectionName`, it likely means that the default Azure DevOps Build Service account for your Azure DevOps project has been granted the `repo:write` permission for this repository. You should audit for this and remove that permission if it is not required by other tasks.
2. The task inputs related to specifying a "static" site to scan (`siteDir`, `localhostPort`, and `scanUrlRelativePath`) have changed to make it more clear that they are related (and mutually exclusive with `url`).
    - If you previously specified a `siteDir`, you should:
        - Rename your existing `siteDir` input to `staticSiteDir`
        - Rename your existing `localhostPort` input to `staticSitePort` (if specified)
        - Rename your existing `scanUrlRelativePath` input to `staticSiteUrlRelativePath` (if specified)
    - If you previously specified _both_ `url` and `siteDir`, you had a misconfiguration - these inputs were mutually exclusive, and the `url` input was being silently ignored. Remove the `url` input and follow the instructions above for `siteDir`.
    - If you previously specified just `url` and not `siteDir`, you should leave the original `url` input as-is
3. Publishing a pipeline artifact containing scan results is now built into the Accessibility Insights task, instead of being a separate step you must add yourself afterwards
    - If you previously used a separate `publish` step to upload the `_accessibility-reports` folder, you can delete that `publish` step
    - If your pipeline is running in OneBranch, or any other environment where individual tasks cannot publish artifacts directly, specify `uploadOutputArtifact: false` to skip the new automatic artifact uploading. You can specify `outputDir` to control where the output artifact contents get written to on the build agent
    - See [Report Artifacts](https://eng.ms/docs/cloud-ai-platform/devdiv/one-engineering-system-1es/1es-docs/accessibility-insights/accessibility-insights-for-azure-devops#view-scan-summary-and-artifact-report) for more details, including how to customize the artifact name
4. By default, the task now fails if it detects an accessibility failure (unless the failure is a known issue tracked by a [Baseline File](https://eng.ms/docs/cloud-ai-platform/devdiv/one-engineering-system-1es/1es-docs/accessibility-insights/accessibility-insights-for-azure-devops#use-a-baseline-file))
    - If you previously specified `failOnAccessibilityError: true`, you can remove it (this is now the default behavior)
    - If you would prefer to keep the old behavior, where accessibility issues are not treated as a task failure, you can add `failOnAccessibilityError: false` (but consider [using a Baseline File](https://eng.ms/docs/cloud-ai-platform/devdiv/one-engineering-system-1es/1es-docs/accessibility-insights/accessibility-insights-for-azure-devops#use-a-baseline-file) instead!)

## Migrating a "Classic" Pipeline definition

1. The Accessibility Insights task no longer requires extra Azure DevOps permissions to work
    - There is no longer an option for "Azure Repos Connection". If you previously specified a Service Connection using this option, and that Service Connection was created solely for use with this pipeline, you should delete it in your Azure DevOps Project's "Service Connections" settings.
    - If you did not previously specify an "Azure Repos Connection", it likely means that the default Azure DevOps Build Service account for your Azure DevOps project has been granted the `repo:write` permission for this repository. You should audit for this and remove that permission if it is not required by other tasks.
2. The options related to specifying which site to scan have moved underneath a new "Hosting Mode" option to make it more clear which ones can be used together.
    - If you previously specified a "Site Directory", select the "Static Site" Hosting Mode
        - The "Static Site Directory", "Static Site Port" and "Static Site URL Relative Path" task inputs now appear only when "Static Site" is selected
    - If you previously specified a "Website URL", select the "Dynamic Site" "Hosting Mode"
        - The "Dynamic Site URL" option now appears only when "Dynamic Site" is selected
    - If you previously specified _both_ as "Site Directory" and a "Website URL", you had a misconfiguration - these options were mutually exclusive, and the "Website URL" option was being silently ignored. Select "Static Site" Hosting Mode and ignore your old "Website URL" input
3. Publishing a pipeline artifact containing scan results is now built into the Accessibility Insights task, instead of being a separate step you must add yourself afterwards
    - If you previously used a separate "Publish" step to upload the `_accessibility-reports` folder, you can delete that "Publish" step
    - If your pipeline is running in OneBranch, or any other environment where individual tasks cannot publish artifacts directly, uncheck the "Upload Output Artifact" option to skip the new automatic artifact uploading. You can specify an "Output Directory" to control where the output artifact contents get written to on the build agent
    - See [Report Artifacts](https://eng.ms/docs/cloud-ai-platform/devdiv/one-engineering-system-1es/1es-docs/accessibility-insights/accessibility-insights-for-azure-devops#view-scan-summary-and-artifact-report) for more details, including how to customize the artifact name
4. The "Fail on Accessibility Error" option is now checked by default; when it is checked, the task will fail if it detects an accessibility failure (unless the failure is a known issue tracked by a [Baseline File](https://eng.ms/docs/cloud-ai-platform/devdiv/one-engineering-system-1es/1es-docs/accessibility-insights/accessibility-insights-for-azure-devops#use-a-baseline-file))
    - If you would prefer to keep the old behavior, where accessibility issues are not treated as a task failure, you can still uncheck this option (but consider [using a Baseline File](https://eng.ms/docs/cloud-ai-platform/devdiv/one-engineering-system-1es/1es-docs/accessibility-insights/accessibility-insights-for-azure-devops#use-a-baseline-file) instead!)
5. The "Chrome Path" option has moved under a new "Advanced Options" group.
