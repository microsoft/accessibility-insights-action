// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { injectable, inject } from 'inversify';
import { iocTypes } from './ioc/ioc-types';
import { Logger } from './logger/logger';
import { TaskConfig } from './task-config';
import { sectionSeparator, link } from './console-output/console-log-formatter';
import { TelemetryErrorCollector } from './telemetry/telemetry-error-collector';
import { TelemetryEvent } from './telemetry/telemetry-event';
import { TelemetryClient } from './telemetry/telemetry-client';

@injectable()
export class InputValidator {
    private telemetryErrorCollector: TelemetryErrorCollector;

    constructor(
        @inject(iocTypes.TaskConfig) private readonly taskConfig: TaskConfig,
        @inject(Logger) private readonly logger: Logger,
        @inject(iocTypes.TelemetryClient) private readonly telemetryClient: TelemetryClient,
    ) {
        this.telemetryErrorCollector = new TelemetryErrorCollector('InputValidator');
    }
    public validate(): boolean {
        let isValid = true;
        const hostingMode = this.taskConfig.getHostingMode();
        if (hostingMode === undefined) {
            isValid &&= this.failIfSiteDirAndUrlAreNotConfigured();
            isValid &&= this.failIfSiteDirAndUrlAreConfigured();
        } else {
            isValid &&= this.failIfSiteDirIsNotConfiguredInStaticMode();
            isValid &&= this.failIfStaticInputsAreConfiguredInDynamicMode();
            isValid &&= this.failIUrlIsNotConfiguredInDynamicMode();
            isValid &&= this.failIfDynamicInputsAreConfiguredInStaticMode();
        }
        if (!isValid) {
            if (this.telemetryErrorCollector.errorList.length > 0) {
                this.telemetryClient.trackEvent({
                    name: 'ErrorFound',
                    properties: this.telemetryErrorCollector.returnErrorList(),
                } as TelemetryEvent);
            }
            const usageLink = link(this.taskConfig.getUsageDocsUrl(), 'usage documentation');
            this.logger.logInfo(usageLink);
        }
        return isValid;
    }

    private failIfSiteDirAndUrlAreNotConfigured(): boolean {
        const url = this.taskConfig.getUrl();
        const siteDir = this.taskConfig.getStaticSiteDir();
        if (url === undefined && siteDir === undefined) {
            const siteDirName = this.taskConfig.getInputName('StaticSiteDir');
            const urlName = this.taskConfig.getInputName('Url');
            const errorLines = [`A configuration error has occurred, ${urlName} or ${siteDirName} must be set`];
            this.telemetryErrorCollector.collectError(errorLines.join(sectionSeparator()));
            return this.writeConfigurationError(errorLines);
        }
        return true;
    }

    private failIfSiteDirAndUrlAreConfigured(): boolean {
        const url = this.taskConfig.getUrl();
        const siteDir = this.taskConfig.getStaticSiteDir();
        if (url !== undefined && siteDir !== undefined) {
            const siteDirName = this.taskConfig.getInputName('StaticSiteDir');
            const urlName = this.taskConfig.getInputName('Url');

            const errorLines = [
                `A configuration error has occurred, only one of the following inputs can be set at a time: ${urlName} or ${siteDirName}`,
            ];
            this.telemetryErrorCollector.collectError(errorLines.join(sectionSeparator()));
            return this.writeConfigurationError(errorLines);
        }
        return true;
    }

    private failIfSiteDirIsNotConfiguredInStaticMode(): boolean {
        const siteDir = this.taskConfig.getStaticSiteDir();
        const hostingMode = this.taskConfig.getHostingMode();
        if (hostingMode === 'staticSite' && siteDir === undefined) {
            const siteDirName = this.taskConfig.getInputName('StaticSiteDir');
            const hostingModeName = this.taskConfig.getInputName('HostingMode');

            const errorLines = [`A configuration error has occurred, ${siteDirName} must be set when ${hostingModeName} is set to static`];
            this.telemetryErrorCollector.collectError(errorLines.join(sectionSeparator()));
            return this.writeConfigurationError(errorLines);
        }
        return true;
    }

    private failIfDynamicInputsAreConfiguredInStaticMode(): boolean {
        const hostingMode = this.taskConfig.getHostingMode();
        if (hostingMode === 'staticSite') {
            const url = this.taskConfig.getUrl();
            if (url !== undefined) {
                const urlName = this.taskConfig.getInputName('Url');
                const hostingModeName = this.taskConfig.getInputName('HostingMode');
                const errorLines = [
                    `A configuration error has occurred, ${urlName} must not be set when ${hostingModeName} is set to static`,
                    `To fix this error make sure ${urlName} has not been set in the input section of your YAML file`,
                ];
                this.telemetryErrorCollector.collectError(errorLines.join(sectionSeparator()));
                return this.writeConfigurationError(errorLines);
            }
        }
        return true;
    }
    private failIUrlIsNotConfiguredInDynamicMode(): boolean {
        const url = this.taskConfig.getUrl();
        const hostingMode = this.taskConfig.getHostingMode();
        if (hostingMode === 'dynamicSite' && url === undefined) {
            const urlName = this.taskConfig.getInputName('Url');
            const hostingModeName = this.taskConfig.getInputName('HostingMode');
            const errorLines = [
                `A configuration error has occurred, ${urlName} must be set when ${hostingModeName} is set to dynamic`,
                `To fix this error make sure to add ${urlName} to the input section in the corresponding YAML file`,
            ];
            this.telemetryErrorCollector.collectError(errorLines.join(sectionSeparator()));
            return this.writeConfigurationError(errorLines);
        }
        return true;
    }

    private failIfStaticInputsAreConfiguredInDynamicMode(): boolean {
        const hostingMode = this.taskConfig.getHostingMode();
        if (hostingMode === 'dynamicSite') {
            const siteDir = this.taskConfig.getStaticSiteDir();
            const urlRelativePath = this.taskConfig.getStaticSiteUrlRelativePath();
            const urlRelativePathDefault = '/';
            const sitePort = this.taskConfig.getStaticSitePort();
            const hostingModeName = this.taskConfig.getInputName('HostingMode');
            if (
                siteDir !== undefined ||
                (urlRelativePath !== undefined && urlRelativePath !== urlRelativePathDefault) ||
                sitePort !== undefined
            ) {
                const failedInputs = [];
                if (siteDir !== undefined) {
                    failedInputs.push(this.taskConfig.getInputName('StaticSiteDir'));
                }
                if (urlRelativePath !== undefined && urlRelativePath !== urlRelativePathDefault) {
                    failedInputs.push(this.taskConfig.getInputName('StaticSiteUrlRelativePath'));
                }
                if (sitePort !== undefined) {
                    failedInputs.push(this.taskConfig.getInputName('StaticSitePort'));
                }
                const failedInputNames = failedInputs.join(', ');

                const errorLines = [
                    `A configuration error has occurred, ${failedInputNames} must not be set when ${hostingModeName} is set to dynamic`,
                    `To fix this error make sure ${failedInputNames} has not been set in the input section of your YAML file`,
                ];
                this.telemetryErrorCollector.collectError(errorLines.join(sectionSeparator()));
                return this.writeConfigurationError(errorLines);
            }
        }
        return true;
    }

    private writeConfigurationError(errorLines: string[]): boolean {
        this.logger.logError(errorLines.join(sectionSeparator()));
        return false;
    }
}
