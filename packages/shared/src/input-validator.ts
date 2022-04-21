// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { injectable, inject } from 'inversify';
import { iocTypes } from './ioc/ioc-types';
import { Logger } from './logger/logger';
import { TaskConfig } from './task-config';
import { sectionSeparator, link } from './console-output/console-log-formatter';
@injectable()
export class InputValidator {
    private configurationSucceeded = true;
    constructor(@inject(iocTypes.TaskConfig) private readonly taskConfig: TaskConfig, @inject(Logger) private readonly logger: Logger) {}
    public async validate(): Promise<boolean> {
        const hostingMode = this.taskConfig.getHostingMode();
        if (hostingMode === undefined) {
            await this.failIfSiteDirAndUrlAreNotConfigured();
            await this.failIfSiteDirAndUrlAreConfigured();
        } else {
            await this.failIfSiteDirIsNotConfiguredInStaticMode();
            await this.failIfStaticInputsAreConfiguredInDynamicMode();
            await this.failIUrlIsNotConfiguredInDynamicMode();
            await this.failIfDynamicInputsAreConfiguredInStaticMode();
        }
        return Promise.resolve(this.configurationSucceeded);
    }

    private async failIfSiteDirAndUrlAreNotConfigured(): Promise<boolean> {
        const url = this.taskConfig.getUrl();
        const siteDir = this.taskConfig.getStaticSiteDir();
        if (url === undefined && siteDir === undefined) {
            const siteDirName = this.taskConfig.getInputName('StaticSiteDir');
            const errorCase = `A configuration error has occurred url or ${siteDirName} must be set`;
            const errorMessage = this.writeConfigurationError(errorCase);
            this.logger.logError(errorMessage);
            await this.failConfiguration();
            return true;
        }
        return false;
    }

    private async failIfSiteDirAndUrlAreConfigured(): Promise<boolean> {
        const url = this.taskConfig.getUrl();
        const siteDir = this.taskConfig.getStaticSiteDir();
        if (url !== undefined && siteDir !== undefined) {
            const siteDirName = this.taskConfig.getInputName('StaticSiteDir');
            const errorCase = `A configuration error has ocurred only one of the following inputs can be set at a time: url or ${siteDirName}`;
            const errorMessage = this.writeConfigurationError(errorCase);
            this.logger.logError(errorMessage);
            await this.failConfiguration();
            return true;
        }
        return false;
    }

    private async failIfSiteDirIsNotConfiguredInStaticMode(): Promise<boolean> {
        const siteDir = this.taskConfig.getStaticSiteDir();
        const hostingMode = this.taskConfig.getHostingMode();
        if (hostingMode === 'staticSite' && siteDir === undefined) {
            const siteDirName = this.taskConfig.getInputName('StaticSiteDir');
            const errorCase = `A configuration error has ocurred ${siteDirName} must be set when static mode is selected`;
            const errorInfo = `To fix this error make sure to add ${siteDirName} to the input section in the corresponding YAML file`;
            const errorMessage = this.writeConfigurationError(errorCase, errorInfo);
            this.logger.logError(errorMessage);
            await this.failConfiguration();
            return true;
        }
        return false;
    }

    private async failIfDynamicInputsAreConfiguredInStaticMode(): Promise<boolean> {
        const hostingMode = this.taskConfig.getHostingMode();
        if (hostingMode === 'staticSite') {
            const url = this.taskConfig.getUrl();
            if (url !== undefined) {
                const errorCase = `A configuration error has ocurred url must not be set when static mode is selected`;
                const errorInfo = `To fix this error make sure url has not been set in the input section of your YAML file`;
                const errorMessage = this.writeConfigurationError(errorCase, errorInfo);
                this.logger.logError(errorMessage);
                await this.failConfiguration();
                return true;
            }
        }
        return false;
    }
    private async failIUrlIsNotConfiguredInDynamicMode(): Promise<boolean> {
        const url = this.taskConfig.getUrl();
        const hostingMode = this.taskConfig.getHostingMode();
        if (hostingMode === 'dynamicSite' && url === undefined) {
            const errorCase = `A configuration error has ocurred url must be set when dynamic mode is selected`;
            const errorInfo = `To fix this error make sure to add url to the input section in the corresponding YAML file`;
            const errorMessage = this.writeConfigurationError(errorCase, errorInfo);
            this.logger.logError(errorMessage);
            await this.failConfiguration();
            return true;
        }
        return false;
    }

    private async failIfStaticInputsAreConfiguredInDynamicMode(): Promise<boolean> {
        const hostingMode = this.taskConfig.getHostingMode();
        if (hostingMode === 'dynamicSite') {
            const siteDir = this.taskConfig.getStaticSiteDir();
            const urlRelativePath = this.taskConfig.getStaticSiteUrlRelativePath();
            const sitePort = this.taskConfig.getStaticSitePort();
            if (siteDir !== undefined || urlRelativePath !== undefined || sitePort !== undefined) {
                const failedInputs = [];
                if (siteDir !== undefined) {
                    failedInputs.push(this.taskConfig.getInputName('StaticSiteDir'));
                }
                if (urlRelativePath !== undefined) {
                    failedInputs.push(this.taskConfig.getInputName('StaticSiteUrlRelativePath'));
                }
                if (sitePort !== undefined) {
                    failedInputs.push(this.taskConfig.getInputName('StaticSitePort'));
                }
                const failedInputNames = failedInputs.join(', ');
                const errorCase = `A configuration error has ocurred ${failedInputNames} must not be set when dynamic mode is selected`;
                const errorInfo = `To fix this error make sure ${failedInputNames} has not been set in the input section of your YAML file`;
                const errorMessage = this.writeConfigurationError(errorCase, errorInfo);
                this.logger.logError(errorMessage);
                await this.failConfiguration();
                return true;
            }
        }
        await this.failConfiguration();
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async failConfiguration(): Promise<void> {
        this.configurationSucceeded = false;
    }

    private writeConfigurationError(errorCase: string, errorInfo?: string): string {
        const description = [
            errorCase,
            errorInfo,
            'For more information visit:',
            link('https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md', 'GH Action documentation'),
            link(
                'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md',
                'ADO Extension documentation',
            ),
        ];
        return description.join(sectionSeparator());
    }
}
