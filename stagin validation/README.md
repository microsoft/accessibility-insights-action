# Overview
This repository is a sample consumer of the Azure DevOps extension prototype in [accessibility-insights-action](https://github.com/microsoft/accessibility-insights-action).

See the [OneNote](https://microsoft.sharepoint.com/teams/DD_VSCS/CandC/Keros/_layouts/15/Doc.aspx?sourcedoc={d7eb83b2-2900-4d61-8206-384f21d7a0a2}&action=edit&wd=target%28Test%20Plan.one%7C54E85D32-A3F3-4142-8F9D-B9C62E44E9BB%2FTEMPLATE%20x.xx%C2%A0ADO%20extension%20release%7C21666306-36d2-42e0-bcff-2572cef70d39%2F%29&wdorigin=703) and [this PR](https://github.com/microsoft/accessibility-insights-action/pull/787) for more detailed deployment instructions.

If everything worked correctly, the accessibility task version referenced in this repo's pipeline should match the version released by ado-task-prototype's pipeline.

This repository references the extension task in [azure-pipelines.yml](./azure-pipelines.yml).

## Pull requests
Any pull request to the `main` branch will trigger the `prototype-end-user` pipeline, which runs accessibility checks. This is because the `main` branch has a branch policy. See instructions for setting that up [here](https://docs.microsoft.com/en-us/azure/devops/pipelines/repos/azure-repos-git?view=azure-devops&amp%3Btabs=yaml&tabs=yaml#pr-triggers). In ADO, this is set up in the UI, not via YML.