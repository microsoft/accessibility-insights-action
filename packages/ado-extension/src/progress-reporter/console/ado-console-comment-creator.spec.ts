// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';
import * as adoTask from 'azure-pipelines-task-lib/task';
import * as nodeApi from 'azure-devops-node-api';
import { Mock, Times, IMock, MockBehavior } from 'typemoq';
import { ADOTaskConfig } from '../../task-config/ado-task-config';
import { Logger, ReportMarkdownConvertor } from '@accessibility-insights-action/shared';
import { AdoConsoleCommentCreator } from './ado-console-comment-creator';

describe(AdoConsoleCommentCreator, () => {
    let adoTaskMock: IMock<typeof adoTask>;
    let adoTaskConfigMock: IMock<ADOTaskConfig>;
    let loggerMock: IMock<Logger>;
    let nodeApiMock: IMock<typeof nodeApi>;
    let reportMarkdownConvertorMock: IMock<ReportMarkdownConvertor>;
    let webApiMock: IMock<nodeApi.WebApi>;
    let consoleCommentCreator: AdoConsoleCommentCreator;

    const handlerStub = {
        prepareRequest: () => {
            return;
        },
        canHandleAuthentication: () => false,
        handleAuthentication: () => Promise.reject(),
    };

    beforeEach(() => {
        adoTaskMock = Mock.ofType<typeof adoTask>(undefined, MockBehavior.Strict);
        adoTaskConfigMock = Mock.ofType<ADOTaskConfig>(undefined, MockBehavior.Strict);
        loggerMock = Mock.ofType<Logger>(undefined, MockBehavior.Strict);
        nodeApiMock = Mock.ofType<typeof nodeApi>(undefined, MockBehavior.Strict);
        webApiMock = Mock.ofType<nodeApi.WebApi>(undefined, MockBehavior.Strict);
        reportMarkdownConvertorMock = Mock.ofType<ReportMarkdownConvertor>(undefined, MockBehavior.Strict);
    });

    describe('constructor', () => {
        it('should not initialize if missing required variable', () => {
            setupInitializeWithTokenServiceConnection();
            setupInitializeMissingVariable();

            expect(() => buildConsoleCreatorWithMocks()).toThrow('Unable to find System.TeamFoundationCollectionUri');

            verifyAllMocks();
        });

        it('should not initialize if serviceConnection uses unsupported auth', () => {
            setupInitializeWithUnsupportedServiceConnection();

            expect(() => buildConsoleCreatorWithMocks()).toThrow('Unsupported auth scheme. Please use token or basic auth.');

            verifyAllMocks();
        });

        it('should initialize if isSupported returns true and serviceConnection uses basic auth', () => {
            setupInitializeWithBasicServiceConnection();
            setupInitializeSetConnection(webApiMock.object);

            consoleCommentCreator = buildConsoleCreatorWithMocks();

            verifyAllMocks();
        });

        it('should initialize if isSupported returns true and serviceConnection uses token auth', () => {
            setupInitializeWithTokenServiceConnection();
            setupInitializeSetConnection(webApiMock.object);

            consoleCommentCreator = buildConsoleCreatorWithMocks();

            verifyAllMocks();
        });

        it('should initialize if isSupported returns true and serviceConnectionName is not set', () => {
            setupInitializeWithoutServiceConnectionName();
            setupInitializeSetConnection(webApiMock.object);

            consoleCommentCreator = buildConsoleCreatorWithMocks();

            verifyAllMocks();
        });
    });

    describe('failRun', () => {
        it('does nothing interesting', async () => {
            const message = 'message';
            setupInitializeWithoutServiceConnectionName();
            setupInitializeSetConnection(webApiMock.object);
            consoleCommentCreator = buildConsoleCreatorWithMocks();

            await consoleCommentCreator.failRun(message);

            verifyAllMocks();
        });
    });

    const buildConsoleCreatorWithMocks = () =>
        new AdoConsoleCommentCreator(
            adoTaskConfigMock.object,
            reportMarkdownConvertorMock.object,
            loggerMock.object,
            adoTaskMock.object,
            nodeApiMock.object,
        );

    const verifyAllMocks = () => {
        adoTaskMock.verifyAll();
        adoTaskConfigMock.verifyAll();
        loggerMock.verifyAll();
        reportMarkdownConvertorMock.verifyAll();
        webApiMock.verifyAll();
    };

    const setupBaselineFileParameterDoesNotExist = () => {
        adoTaskConfigMock
            .setup((o) => o.getBaselineFile())
            .returns(() => undefined)
            .verifiable(Times.atLeastOnce());
    };

    const setupInitializeWithoutServiceConnectionName = () => {
        const apitoken = 'token';

        adoTaskConfigMock
            .setup((o) => o.getRepoServiceConnectionName())
            .returns(() => '')
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getEndpointAuthorizationParameter('SystemVssConnection', 'AccessToken', false))
            .returns(() => apitoken)
            .verifiable(Times.once());
        nodeApiMock
            .setup((o) => o.getPersonalAccessTokenHandler(apitoken))
            .returns(() => handlerStub)
            .verifiable(Times.once());
    };

    const setupInitializeWithTokenServiceConnection = () => {
        const apitoken = 'token';

        const serviceConnection = 'service-connection';
        const endpointAuthorizationStub: adoTask.EndpointAuthorization = {
            parameters: {
                apitoken,
            },
            scheme: '',
        };

        adoTaskConfigMock
            .setup((o) => o.getRepoServiceConnectionName())
            .returns(() => serviceConnection)
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getEndpointAuthorization(serviceConnection, false))
            .returns(() => endpointAuthorizationStub)
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getEndpointAuthorizationScheme(serviceConnection, true))
            .returns(() => 'Token')
            .verifiable(Times.once());
        nodeApiMock
            .setup((o) => o.getPersonalAccessTokenHandler(apitoken))
            .returns(() => handlerStub)
            .verifiable(Times.once());
    };

    const setupInitializeWithBasicServiceConnection = () => {
        const serviceConnection = 'service-connection',
            //[SuppressMessage("Microsoft.Security", "CS002:SecretInNextLine", Justification="Fake creds")]
            username = 'user',
            //[SuppressMessage("Microsoft.Security", "CS002:SecretInNextLine", Justification="Fake creds")]
            password = 'secret';
        const endpointAuthorizationStub: adoTask.EndpointAuthorization = {
            parameters: {
                username,
                password,
            },
            scheme: '',
        };

        adoTaskConfigMock
            .setup((o) => o.getRepoServiceConnectionName())
            .returns(() => serviceConnection)
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getEndpointAuthorization(serviceConnection, false))
            .returns(() => endpointAuthorizationStub)
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getEndpointAuthorizationScheme(serviceConnection, true))
            .returns(() => 'UsernamePassword')
            .verifiable(Times.once());

        nodeApiMock
            .setup((o) => o.getBasicHandler(username, password))
            .returns(() => handlerStub)
            .verifiable(Times.once());
    };

    const setupInitializeWithUnsupportedServiceConnection = () => {
        const serviceConnection = 'service-connection';
        const endpointAuthorizationStub: adoTask.EndpointAuthorization = {
            parameters: {},
            scheme: '',
        };

        adoTaskConfigMock
            .setup((o) => o.getRepoServiceConnectionName())
            .returns(() => serviceConnection)
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getEndpointAuthorization(serviceConnection, false))
            .returns(() => endpointAuthorizationStub)
            .verifiable(Times.once());
        adoTaskMock
            .setup((o) => o.getEndpointAuthorizationScheme(serviceConnection, true))
            .returns(() => undefined)
            .verifiable(Times.once());
    };

    const setupInitializeSetConnection = (connection: nodeApi.WebApi) => {
        const url = 'url';

        adoTaskMock
            .setup((o) => o.getVariable('System.TeamFoundationCollectionUri'))
            .returns(() => url)
            .verifiable(Times.atLeastOnce());
        nodeApiMock
            .setup((o) => new o.WebApi(url, handlerStub))
            .returns(() => connection)
            .verifiable(Times.once());
    };

    const setupInitializeMissingVariable = () => {
        adoTaskMock
            .setup((o) => o.getVariable('System.TeamFoundationCollectionUri'))
            .returns(() => undefined)
            .verifiable(Times.once());
    };
});
