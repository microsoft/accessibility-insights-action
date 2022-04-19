import { TaskConfig } from './task-config';
import { inject, injectable } from 'inversify';
import { iocTypes } from './ioc/ioc-types';
import { Logger } from './logger/logger';
import { sectionSeparator, link } from './console-output/console-log-formatter';

@injectable()
export class InputValidator {
    private scannerSide : string;
    private configurationSucceeded = true;
    constructor(@inject(iocTypes.TaskConfig) private readonly taskConfig: TaskConfig, @inject(Logger) private readonly logger: Logger, scannerSide : string) {
        this.scannerSide = scannerSide;
    }
    
    public async validate(): Promise<boolean> {
        await this.failIfSiteDirAndUrlAreNotConfigured();
        await this.failIfSiteDirAndUrlAreConfigured();
        return Promise.resolve(this.configurationSucceeded);
    }

    private async failIfSiteDirAndUrlAreNotConfigured(): Promise<boolean> {
        const url = this.taskConfig.getUrl();
        const siteDir = this.taskConfig.getStaticSiteDir();
        if(url === undefined && siteDir === undefined){
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
        if(url !== undefined && siteDir !== undefined){
            const siteDirName = this.getSiteDirName();
            const errorCase = `A configuration error has ocurred only one of the following inputs can be set at a time: url or ${siteDirName}`;
            const errorMessage = this.writeConfigurationError(errorCase);
            this.logger.logError(errorMessage);
            await this.failConfiguration();
            return true;
        }
        return false;
    }

    

    private getInfoLink(): string {
        let docsLink : string;
        if(this.scannerSide === 'ado-extension'){
            docsLink = "https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md";
            return link(docsLink, 'ADO Extension usage');
        }
        else{
            docsLink = "https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md";
            return link(docsLink, 'GH Action Extension usage');
        }
    }

    private getSiteDirName(): string {
        if(this.scannerSide === 'ado-extension'){
            return 'staticSiteDir';
        }
        else {
            return 'site-dir';
        }
    }

    private getUrlRelativePathName(): string {
        if(this.scannerSide === 'ado-extension'){
            return 'staticSiteUrlRelativePath';
        }
        else {
            return "scan-url-relative-path";
        }
    }

    private getSitePortName(): string{
        if(this.scannerSide === 'ado-extension'){
            return 'staticSitePort';
        }
        else {
            return "staticSitePort";
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

    private writeConfigurationError(errorCase : string): string {
        const configurationInfo = this.getInfoLink();
        const errorMessage = [errorCase, configurationInfo];
        return errorMessage.join(sectionSeparator());
    }
}
