import { TaskConfig } from './task-config';
import { inject, injectable } from 'inversify';
import { iocTypes } from './ioc/ioc-types';
import { Logger } from './logger/logger';
import { sectionSeparator, link } from './console-output/console-log-formatter';

@injectable()
export class InputValidator {
    private scannerSide: string;
    private configurationSucceeded = true;
    constructor(
        @inject(iocTypes.TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(Logger) private readonly logger: Logger,
        scannerSide: string,
    ) {
        this.scannerSide = scannerSide;
    }

    public async validate(): Promise<boolean> {
        await this.failIfSiteDirAndUrlAreNotConfigured();
        await this.failIfSiteDirAndUrlAreConfigured();
        await this.failIfSiteDirIsNotConfiguredInStaticMode();
        await this.failIfStaticInputsAreConfiguredInDynamicMode();
        await this.failIUrlIsNotConfiguredInDynamicMode();
        await this.failIfDynamicInputsAreConfiguredInStaticMode();
        return Promise.resolve(this.configurationSucceeded);
    }

    private async failIfSiteDirAndUrlAreNotConfigured(): Promise<boolean> {
        const url = this.taskConfig.getUrl();
        const siteDir = this.taskConfig.getStaticSiteDir();
        if (url === undefined && siteDir === undefined) {
            const siteDirName = this.getSiteDirName();
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
            const siteDirName = this.getSiteDirName();
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
            const siteDirName = this.getSiteDirName();
            let errorCase = `A configuration error has ocurred ${siteDirName} must be set when static mode is selected`;
            const errorExtraInfo = `To fix this error make sure to add ${siteDirName} to the input section in the corresponding YAML file`;
            errorCase = errorCase.concat(errorCase, sectionSeparator());
            errorCase = errorCase.concat(errorCase, errorExtraInfo);
            const errorMessage = this.writeConfigurationError(errorCase);
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
                let errorCase = `A configuration error has ocurred url must not be set when static mode is selected`;
                const errorExtraInfo = `To fix this error make sure url has not been set in the input section of your YAML file`;
                errorCase = errorCase.concat(errorCase, sectionSeparator());
                errorCase = errorCase.concat(errorCase, errorExtraInfo);
                const errorMessage = this.writeConfigurationError(errorCase);
                this.logger.logError(errorMessage);
                await this.failConfiguration();
                return true;
            }
        }
        return false;
    }
    s;
    private async failIUrlIsNotConfiguredInDynamicMode(): Promise<boolean> {
        const url = this.taskConfig.getUrl();
        const hostingMode = this.taskConfig.getHostingMode();
        if (hostingMode === 'dynamicSite' && url === undefined) {
            let errorCase = `A configuration error has ocurred url must be set when dynamic mode is selected`;
            const errorExtraInfo = `To fix this error make sure to add url to the input section in the corresponding YAML file`;
            errorCase = errorCase.concat(errorCase, sectionSeparator());
            errorCase = errorCase.concat(errorCase, errorExtraInfo);
            const errorMessage = this.writeConfigurationError(errorCase);
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
                const failedInputs = [''];
                if (siteDir !== undefined) {
                    failedInputs.push(this.getSiteDirName());
                }
                if (urlRelativePath !== undefined) {
                    failedInputs.push(this.getUrlRelativePathName());
                }
                if (sitePort !== undefined) {
                    failedInputs.push(this.getSitePortName());
                }
                const failedInputNames = failedInputs.join(', ');
                let errorCase = `A configuration error has ocurred ${failedInputNames} must not be set when dynamic mode is selected`;
                const errorExtraInfo = `To fix this error make sure ${failedInputNames} has not been set in the input section of your YAML file`;
                errorCase = errorCase.concat(errorCase, errorExtraInfo);
                const errorMessage = this.writeConfigurationError(errorCase);
                this.logger.logError(errorMessage);
                await this.failConfiguration();
                return true;
            }
        }
        await this.failConfiguration();
        return true;
    }

    private getInfoLink(): string {
        let docsLink: string;
        if (this.scannerSide === 'ado-extension') {
            docsLink = 'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md';
            return link(docsLink, 'ADO Extension usage');
        } else {
            docsLink = 'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md';
            return link(docsLink, 'GH Action Extension usage');
        }
    }

    private getSiteDirName(): string {
        if (this.scannerSide === 'ado-extension') {
            return 'staticSiteDir';
        } else {
            return 'site-dir';
        }
    }

    private getUrlRelativePathName(): string {
        if (this.scannerSide === 'ado-extension') {
            return 'staticSiteUrlRelativePath';
        } else {
            return 'scan-url-relative-path';
        }
    }

    private getSitePortName(): string {
        if (this.scannerSide === 'ado-extension') {
            return 'staticSitePort';
        } else {
            return 'staticSitePort';
        }
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    public async failConfiguration(): Promise<void> {
        this.configurationSucceeded = false;
    }

    public async validateDynamicInputs(): Promise<boolean> {
        await this.failConfiguration();
        return false;
    }

    public async validateStaticInputs(): Promise<boolean> {
        await this.failConfiguration();
        return false;
    }

    private writeConfigurationError(errorCase: string): string {
        const configurationInfo = this.getInfoLink();
        const errorMessage = [errorCase, configurationInfo];
        return errorMessage.join(sectionSeparator());
    }
}
