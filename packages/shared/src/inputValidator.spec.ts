// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { TaskConfig } from './task-config';
import { InputValidator } from './inputValidator';
import { Logger } from '@accessibility-insights-action/shared';

describe(InputValidator, () => {
    let taskConfigMock: IMock<TaskConfig>;
    let loggerMock: IMock<Logger>;
    let inputValidator: InputValidator;

    beforeEach(() => {
        taskConfigMock = Mock.ofType<TaskConfig>(undefined, MockBehavior.Strict);
        loggerMock = Mock.ofType<Logger>(undefined, MockBehavior.Strict);
    });

    describe('constructor', () => {
        it('initializes in ado scanner', () => {
            inputValidator = buildInputValidatorWithMocks('ado-extension');
            verifyAllMocks();
        });

        it('initializes in gh scanner', () => {
            inputValidator = buildInputValidatorWithMocks('gh-action');
            verifyAllMocks();
        });
    });

    describe('validate gh-action', () => {
        it('input configuration fail if siteDir and url are set at the same time', async () => {
            setUpHostingMode(undefined);
            setupGetStaticSiteDir('site-dir');
            setupGetStaticSiteUrlRelativePath(undefined);
            setupGetStaticSitePort(undefined);
            setupGetUrl('url');

            const errorMessage = `A configuration error has ocurred only one of the following inputs can be set at a time: url or site-dir\nGH Action Extension usage (https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md)`;
            setupLoggerWithErrorMessage(errorMessage);

            inputValidator = buildInputValidatorWithMocks('gh-action');
            await expect(inputValidator.validate()).resolves.toBe(false);
        });

        it('input configuration fail if siteDir and url are not set', async () => {
            setUpHostingMode(undefined);
            setupGetStaticSiteDir(undefined);
            setupGetStaticSiteUrlRelativePath(undefined);
            setupGetStaticSitePort(undefined);
            setupGetUrl(undefined);

            const errorMessage = `A configuration error has occurred url or site-dir must be set\nGH Action Extension usage (https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md)`;
            setupLoggerWithErrorMessage(errorMessage);

            inputValidator = buildInputValidatorWithMocks('gh-action');
            await expect(inputValidator.validate()).resolves.toBe(false);
        });

        it('input configuration fail if siteDir is not set in staticSite mode', async () => {
            setUpHostingMode('staticSite');
            setupGetStaticSiteDir(undefined);
            setupGetStaticSiteUrlRelativePath(undefined);
            setupGetStaticSitePort(undefined);
            setupGetUrl(undefined);

            const errorMessage = `A configuration error has ocurred site-dir must be set when static mode is selected\nTo fix this error make sure to add site-dir to the input section in the corresponding YAML file\nGH Action Extension usage (https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md)`;
            setupLoggerWithErrorMessage(errorMessage);

            inputValidator = buildInputValidatorWithMocks('gh-action');
            await expect(inputValidator.validate()).resolves.toBe(false);
        });

        it('input configuration fail if url is set in staticSite mode', async () => {
            setUpHostingMode('staticSite');
            setupGetStaticSiteDir('site-dir');
            setupGetStaticSiteUrlRelativePath(undefined);
            setupGetStaticSitePort(undefined);
            setupGetUrl('url');

            const errorMessage = `A configuration error has ocurred url must not be set when static mode is selected\nTo fix this error make sure url has not been set in the input section of your YAML file\nGH Action Extension usage (https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md)`;
            setupLoggerWithErrorMessage(errorMessage);

            inputValidator = buildInputValidatorWithMocks('gh-action');
            await expect(inputValidator.validate()).resolves.toBe(false);
        });

        it('input configuration fail if static inputs are set in dynamicSite mode', async () => {
            setUpHostingMode('dynamicSite');
            setupGetStaticSiteDir('site-dir');
            setupGetStaticSiteUrlRelativePath('ure-relative-path');
            setupGetStaticSitePort(100);
            setupGetUrl('url');

            const errorMessage = `A configuration error has ocurred site-dir, scan-url-relative-path, staticSitePort must not be set when dynamic mode is selectedA configuration error has ocurred site-dir, scan-url-relative-path, staticSitePort must not be set when dynamic mode is selectedTo fix this error make sure site-dir, scan-url-relative-path, staticSitePort has not been set in the input section of your YAML file\nGH Action Extension usage (https://github.com/microsoft/accessibility-insights-action/blob/main/docs/gh-action-usage.md)`;
            setupLoggerWithErrorMessage(errorMessage);

            inputValidator = buildInputValidatorWithMocks('gh-action');
            await expect(inputValidator.validate()).resolves.toBe(false);
        });
    });

    describe('validate ado-extension', () => {
        it('input configuration fail if siteDir and url are set at the same time', async () => {
            setUpHostingMode(undefined);
            setupGetStaticSiteDir('site-dir');
            setupGetStaticSiteUrlRelativePath(undefined);
            setupGetStaticSitePort(undefined);
            setupGetUrl('url');

            const errorMessage = `A configuration error has ocurred only one of the following inputs can be set at a time: url or staticSiteDir\nADO Extension usage (https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md)`;
            setupLoggerWithErrorMessage(errorMessage);

            inputValidator = buildInputValidatorWithMocks('ado-extension');
            await expect(inputValidator.validate()).resolves.toBe(false);
        });

        it('input configuration fail if siteDir and url are not set', async () => {
            setUpHostingMode(undefined);
            setupGetStaticSiteDir(undefined);
            setupGetStaticSiteUrlRelativePath(undefined);
            setupGetStaticSitePort(undefined);
            setupGetUrl(undefined);

            const errorMessage = `A configuration error has occurred url or staticSiteDir must be set\nADO Extension usage (https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md)`;
            setupLoggerWithErrorMessage(errorMessage);

            inputValidator = buildInputValidatorWithMocks('ado-extension');
            await expect(inputValidator.validate()).resolves.toBe(false);
        });

        it('input configuration fail if siteDir is not set in staticSite mode', async () => {
            setUpHostingMode('staticSite');
            setupGetStaticSiteDir(undefined);
            setupGetStaticSiteUrlRelativePath(undefined);
            setupGetStaticSitePort(undefined);
            setupGetUrl(undefined);

            const errorMessage = `A configuration error has ocurred staticSiteDir must be set when static mode is selected\nTo fix this error make sure to add staticSiteDir to the input section in the corresponding YAML file\nADO Extension usage (https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md)`;
            setupLoggerWithErrorMessage(errorMessage);

            inputValidator = buildInputValidatorWithMocks('ado-extension');
            await expect(inputValidator.validate()).resolves.toBe(false);
        });

        it('input configuration fail if url is set in staticSite mode', async () => {
            setUpHostingMode('staticSite');
            setupGetStaticSiteDir('site-dir');
            setupGetStaticSiteUrlRelativePath(undefined);
            setupGetStaticSitePort(undefined);
            setupGetUrl('url');

            const errorMessage = `A configuration error has ocurred url must not be set when static mode is selected\nTo fix this error make sure url has not been set in the input section of your YAML file\nADO Extension usage (https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md)`;
            setupLoggerWithErrorMessage(errorMessage);

            inputValidator = buildInputValidatorWithMocks('ado-extension');
            await expect(inputValidator.validate()).resolves.toBe(false);
        });

        it('input configuration fail if static inputs are set in dynamicSite mode', async () => {
            setUpHostingMode('dynamicSite');
            setupGetStaticSiteDir('site-dir');
            setupGetStaticSiteUrlRelativePath('ure-relative-path');
            setupGetStaticSitePort(100);
            setupGetUrl('url');

            const errorMessage = `A configuration error has ocurred staticSiteDir, staticSiteUrlRelativePath, staticSitePort must not be set when dynamic mode is selectedA configuration error has ocurred staticSiteDir, staticSiteUrlRelativePath, staticSitePort must not be set when dynamic mode is selectedTo fix this error make sure staticSiteDir, staticSiteUrlRelativePath, staticSitePort has not been set in the input section of your YAML file\nADO Extension usage (https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md)`;
            setupLoggerWithErrorMessage(errorMessage);

            inputValidator = buildInputValidatorWithMocks('ado-extension');
            await expect(inputValidator.validate()).resolves.toBe(false);
        });
    });

    const buildInputValidatorWithMocks = (scanner: string) => new InputValidator(taskConfigMock.object, loggerMock.object, scanner);

    const verifyAllMocks = () => {
        taskConfigMock.verifyAll();
    };

    const setUpHostingMode = (value: string) => {
        taskConfigMock
            .setup((o) => o.getHostingMode())
            .returns(() => value)
            .verifiable(Times.atLeastOnce());
    };

    const setupGetStaticSiteDir = (value: string) => {
        taskConfigMock
            .setup((o) => o.getStaticSiteDir())
            .returns(() => value)
            .verifiable(Times.atLeastOnce());
    };

    const setupGetStaticSiteUrlRelativePath = (value: string) => {
        taskConfigMock
            .setup((o) => o.getStaticSiteUrlRelativePath())
            .returns(() => value)
            .verifiable(Times.atLeastOnce());
    };

    const setupGetStaticSitePort = (value: number) => {
        taskConfigMock
            .setup((o) => o.getStaticSitePort())
            .returns(() => value)
            .verifiable(Times.atLeastOnce());
    };

    const setupGetUrl = (value: string) => {
        taskConfigMock
            .setup((o) => o.getUrl())
            .returns(() => value)
            .verifiable(Times.atLeastOnce());
    };

    const setupLoggerWithErrorMessage = (message: string) => {
        loggerMock.setup((o) => o.logError(message)).verifiable(Times.once());
    };
});
