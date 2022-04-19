import { TaskConfig } from './task-config';
import { inject, injectable } from 'inversify';
import { iocTypes } from './ioc/ioc-types';
import { Logger } from './logger/logger';
import { sectionSeparator } from './console-output/console-log-formatter';

@injectable()
export class InputValidator {
    private scannerSide : string;
    private configurationSucceded = true;
    constructor(@inject(iocTypes.TaskConfig) private readonly taskConfig: TaskConfig, @inject(Logger) private readonly logger: Logger, scannerSide : string) {
        this.scannerSide = scannerSide;
    }
    
    public async validate(): Promise<boolean> {
        const hostingMode = this.taskConfig.getHostingMode();
        /*if(hostingMode !== undefined){
            
        }
        else{

        }*/
        return Promise.resolve(this.configurationSucceded);
    }

    private getInfoLink(): string {
        if(this.scannerSide === 'ado-extension'){
            return "https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md";
        }
        else{
            return "https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md";
        }
    }

    private getsiteDirName(): string {
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
    public async failRun(): Promise<void> {
        this.configurationSucceded = false;
    }

    public async validateDynamicInputs(): Promise<boolean> {
        await this.failRun();
        return false;
    }

    public async validateStaticInputs(): Promise<boolean> {
        await this.failRun();
        return false;
    }

    private writeConfigurationError(errorCase : string): string {
        //let errorMessage = errorCase.concat(sectionSeparator());
        return '';
    }

    private async failIfSiteDirAndUrlAreNotConfigured(): Promise<boolean> {
        const url = this.taskConfig.getUrl();
        const siteDir = this.taskConfig.getStaticSiteDir();
        if(url === undefined && siteDir === undefined){
            const siteDirName = this.getsiteDirName();
            const link = this.getInfoLink();
            //let error = `A configuration error has occurred url or ${siteDirName} must be set`;
            
        }
        await this.failRun();
        return false;
    }

    public async validateNoHostingModeInputs(): Promise<boolean> {
        const url = this.taskConfig.getUrl();
        const staticSiteDir = this.taskConfig.getStaticSiteDir();
        if(url === undefined && staticSiteDir === undefined){
            await this.failRun();
            return false;
        }
        else if(url !== undefined && staticSiteDir !== undefined){
            await this.failRun();
            return false;
        }
    }

}
