// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { TaskConfig, TaskInputKey } from './task-config';
import { InputValidator } from './input-validator';
import { Logger } from './logger/logger';

describe(InputValidator, () => {
    let taskConfigMock: IMock<TaskConfig>;
    let loggerMock: IMock<Logger>;
    let inputValidator: InputValidator;
    const defaultStaticSiteUrlRelativePath = '/';

    beforeEach(() => {
        taskConfigMock = Mock.ofType<TaskConfig>(undefined, MockBehavior.Strict);
        loggerMock = Mock.ofType<Logger>(undefined, MockBehavior.Strict);
    });

    describe('constructor', () => {
        it('initializes input validator', () => {
            inputValidator = buildInputValidatorWithMocks();
            verifyAllMocks();
        });
    });

    describe('validate', () => {
        it('input configuration fail if siteDir and url are set at the same time', () => {
            setUpHostingMode(undefined);
            setupGetStaticSiteDir('site-dir');
            setupGetStaticSiteUrlRelativePath(defaultStaticSiteUrlRelativePath);
            setupGetStaticSitePort(undefined);
            setupGetUrl('url');
            setupInputName('staticSiteDir', 'StaticSiteDir');
            setupInputName('url', 'Url');

            const errorMessage = `A configuration error has occurred, only one of the following inputs can be set at a time: url or staticSiteDir`;
            setupLoggerWithErrorMessage(errorMessage);

            const usageLink = 'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md';
            setupGetUsageDocsUrl(usageLink);
            setupLoggerWithInfoMessage(`usage documentation (${usageLink})`);

            inputValidator = buildInputValidatorWithMocks();
            expect(inputValidator.validate()).toBe(false);
        });

        it('input configuration fail if siteDir and url are not set', () => {
            setUpHostingMode(undefined);
            setupGetStaticSiteDir(undefined);
            setupGetStaticSiteUrlRelativePath(defaultStaticSiteUrlRelativePath);
            setupGetStaticSitePort(undefined);
            setupGetUrl(undefined);
            setupInputName('staticSiteDir', 'StaticSiteDir');
            setupInputName('url', 'Url');

            const errorMessage = `A configuration error has occurred, url or staticSiteDir must be set`;
            setupLoggerWithErrorMessage(errorMessage);

            const usageLink = 'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md';
            setupGetUsageDocsUrl(usageLink);
            setupLoggerWithInfoMessage(`usage documentation (${usageLink})`);

            inputValidator = buildInputValidatorWithMocks();
            expect(inputValidator.validate()).toBe(false);
        });

        it('input configuration fail if siteDir is not set in staticSite mode', () => {
            setUpHostingMode('staticSite');
            setupGetStaticSiteDir(undefined);
            setupGetStaticSiteUrlRelativePath(defaultStaticSiteUrlRelativePath);
            setupGetStaticSitePort(undefined);
            setupGetUrl(undefined);
            setupInputName('staticSiteDir', 'StaticSiteDir');
            setupInputName('hosting-mode', 'HostingMode');

            const errorMessage = `A configuration error has occurred, staticSiteDir must be set when hosting-mode is set to static`;
            setupLoggerWithErrorMessage(errorMessage);

            const usageLink = 'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md';
            setupGetUsageDocsUrl(usageLink);
            setupLoggerWithInfoMessage(`usage documentation (${usageLink})`);

            inputValidator = buildInputValidatorWithMocks();
            expect(inputValidator.validate()).toBe(false);
        });

        it('input configuration fail if url is set in staticSite mode', () => {
            setUpHostingMode('staticSite');
            setupGetStaticSiteDir('site-dir');
            setupGetStaticSiteUrlRelativePath(defaultStaticSiteUrlRelativePath);
            setupGetStaticSitePort(undefined);
            setupGetUrl('url');
            setupInputName('url', 'Url');
            setupInputName('hosting-mode', 'HostingMode');

            const errorMessage = `A configuration error has occurred, url must not be set when hosting-mode is set to static\nTo fix this error make sure url has not been set in the input section of your YAML file`;
            setupLoggerWithErrorMessage(errorMessage);

            const usageLink = 'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md';
            setupGetUsageDocsUrl(usageLink);
            setupLoggerWithInfoMessage(`usage documentation (${usageLink})`);

            inputValidator = buildInputValidatorWithMocks();
            expect(inputValidator.validate()).toBe(false);
        });

        it('input configuration fail if static inputs are set in dynamicSite mode', () => {
            setUpHostingMode('dynamicSite');
            setupGetStaticSiteDir('site-dir');
            setupGetStaticSiteUrlRelativePath(defaultStaticSiteUrlRelativePath);
            setupGetStaticSitePort(100);
            setupGetUrl('url');
            setupInputName('staticSiteDir', 'StaticSiteDir');
            setupInputName('staticSiteUrlRelativePath', 'StaticSiteUrlRelativePath');
            setupInputName('staticSitePort', 'StaticSitePort');
            setupInputName('hosting-mode', 'HostingMode');

            const errorMessage = `A configuration error has occurred, staticSiteDir, staticSitePort must not be set when hosting-mode is set to dynamic\nTo fix this error make sure staticSiteDir, staticSitePort has not been set in the input section of your YAML file`;
            setupLoggerWithErrorMessage(errorMessage);

            const usageLink = 'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md';
            setupGetUsageDocsUrl(usageLink);
            setupLoggerWithInfoMessage(`usage documentation (${usageLink})`);

            inputValidator = buildInputValidatorWithMocks();
            expect(inputValidator.validate()).toBe(false);
        });

        test('input configuration succeeds if staticSiteUrlRelativePath equal to defaultValue in dynamicSite mode', () => {
            setUpHostingMode('dynamicSite');
            setupInputName(defaultStaticSiteUrlRelativePath, 'StaticSiteUrlRelativePath');
            setupInputName('hosting-mode', 'HostingMode');
            setupGetStaticSiteDir(undefined);
            setupGetStaticSiteUrlRelativePath(defaultStaticSiteUrlRelativePath);
            setupGetStaticSitePort(undefined);
            setupGetUrl('url');

            inputValidator = buildInputValidatorWithMocks();
            expect(inputValidator.validate()).toBe(true);
        });

        it('input configuration succeeded if correct static configuration', () => {
            setUpHostingMode('staticSite');
            setupGetStaticSiteDir('site-dir');
            setupGetStaticSiteUrlRelativePath(defaultStaticSiteUrlRelativePath);
            setupGetStaticSitePort(undefined);
            setupGetUrl(undefined);

            const usageLink = 'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md';
            setupGetUsageDocsUrl(usageLink);

            inputValidator = buildInputValidatorWithMocks();
            expect(inputValidator.validate()).toBe(true);
        });

        it('input configuration succeeded if correct dynamic configuration', () => {
            setUpHostingMode('dynamicSite');
            setupGetStaticSiteDir(undefined);
            setupGetStaticSiteUrlRelativePath(defaultStaticSiteUrlRelativePath);
            setupGetStaticSitePort(undefined);
            setupGetUrl('url');
            setupInputName('hosting-mode', 'HostingMode');

            const usageLink = 'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md';
            setupGetUsageDocsUrl(usageLink);

            inputValidator = buildInputValidatorWithMocks();
            expect(inputValidator.validate()).toBe(true);
        });

        it('input configuration succeeded if correct configuration with no hosting mode', () => {
            setUpHostingMode(undefined);
            setupGetStaticSiteDir(undefined);
            setupGetStaticSiteUrlRelativePath(defaultStaticSiteUrlRelativePath);
            setupGetStaticSitePort(undefined);
            setupGetUrl('url');

            const usageLink = 'https://github.com/microsoft/accessibility-insights-action/blob/main/docs/ado-extension-usage.md';
            setupGetUsageDocsUrl(usageLink);

            inputValidator = buildInputValidatorWithMocks();
            expect(inputValidator.validate()).toBe(true);
        });
    });

    const buildInputValidatorWithMocks = () => new InputValidator(taskConfigMock.object, loggerMock.object);

    const verifyAllMocks = () => {
        taskConfigMock.verifyAll();
    };

    const setupGetUsageDocsUrl = (url: string) => {
        taskConfigMock
            .setup((o) => o.getUsageDocsUrl())
            .returns(() => url)
            .verifiable(Times.atLeastOnce());
    };

    const setupInputName = (name: string, taskInputKey: TaskInputKey) => {
        taskConfigMock
            .setup((o) => o.getInputName(taskInputKey))
            .returns(() => name)
            .verifiable(Times.atLeastOnce());
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

    const setupLoggerWithInfoMessage = (message: string) => {
        loggerMock.setup((o) => o.logInfo(message)).verifiable(Times.once());
    };
});
