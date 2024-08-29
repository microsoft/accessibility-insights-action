// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as adoTask from 'azure-pipelines-task-lib/task';
import * as NpmRegistryUtil from './npm-registry-util';
import { Mock } from 'typemoq';

describe('NpmRegistryUtil', () => {
    const authenticationMock = Mock.ofType<adoTask.EndpointAuthorization>();

    describe('Improper Authentications', () => {
        it('should not get system access token authentication when scheme is not OAuth', () => {
            const auth = jest.spyOn(adoTask, 'getEndpointAuthorization');
            auth.mockReturnValue(authenticationMock.object);
            const accessToken = NpmRegistryUtil.getSystemAccessToken();
            expect(accessToken).toBeFalsy();
        });

        it('should not get npmAuthIdent from service connection when service connection does not exist', () => {
            const auth = jest.spyOn(adoTask, 'getEndpointAuthorization');
            auth.mockReturnValue(undefined);
            expect(() => NpmRegistryUtil.getTokenFromServiceConnection('serviceConnectionName')).toThrowError(
                'Could not find the service connection',
            );
        });

        it('should not get npmAuthIdent from service connection when service connection scheme is other than Token or UsernamePassword', () => {
            const auth = jest.spyOn(adoTask, 'getEndpointAuthorization');
            auth.mockReturnValue(authenticationMock.object);
            expect(() => NpmRegistryUtil.getTokenFromServiceConnection('serviceConnectionName')).toThrowError(
                'Service connection auth scheme not supported',
            );
        });
    });

    describe('Proper Authentications', () => {
        it('should get system access token when scheme is OAuth', () => {
            authenticationMock.setup((x) => x.scheme).returns(() => 'OAuth');
            authenticationMock
                .setup((x) => x.parameters)
                .returns(() => {
                    return { AccessToken: 'token' };
                });
            const auth = jest.spyOn(adoTask, 'getEndpointAuthorization');
            auth.mockReturnValue(authenticationMock.object);
            const accessToken = NpmRegistryUtil.getSystemAccessToken();
            expect(accessToken).toEqual('token');
        });

        it('should get npmAuthIdent from service connection when service connection scheme is Token', () => {
            authenticationMock.setup((x) => x.scheme).returns(() => 'Token');
            authenticationMock
                .setup((x) => x.parameters)
                .returns(() => {
                    return { apitoken: 'token' };
                });
            const auth = jest.spyOn(adoTask, 'getEndpointAuthorization');
            auth.mockReturnValue(authenticationMock.object);
            expect(NpmRegistryUtil.getTokenFromServiceConnection('serviceConnectionName')).toBeTruthy();
        });

        it('should get npmAuthIdent from service connection when service connection scheme is UsernamePassword', () => {
            authenticationMock.setup((x) => x.scheme).returns(() => 'UsernamePassword');
            authenticationMock
                .setup((x) => x.parameters)
                .returns(() => {
                    return { username: 'username', password: 'password' };
                });
            const auth = jest.spyOn(adoTask, 'getEndpointAuthorization');
            auth.mockReturnValue(authenticationMock.object);
            expect(NpmRegistryUtil.getTokenFromServiceConnection('serviceConnectionName')).toBeTruthy();
        });
    });

    it('should not match org name if url has different org or not in correct format', () => {
        let url = 'https://registry.yarnpkg.com';
        const org = jest.spyOn(adoTask, 'getVariable');
        org.mockReturnValue('AccessibilityInsights');
        expect(NpmRegistryUtil.isLocalNPMRegistry(url)).toBeFalsy();
        url = 'https://pkgs.dev.azure.com/mseng/_packaging/React/npm/registry/';
        expect(NpmRegistryUtil.isLocalNPMRegistry(url)).toBeFalsy();
        url = 'https://mseng.visualstudio.com/_packaging/React/npm/registry/';
        expect(NpmRegistryUtil.isLocalNPMRegistry(url)).toBeFalsy();
    });

    it('should match org name if url has same org', () => {
        let url = 'https://pkgs.dev.azure.com/AccessibilityInsights/_packaging/React/npm/registry/';
        const org = jest.spyOn(adoTask, 'getVariable');
        org.mockReturnValue('AccessibilityInsights');
        expect(NpmRegistryUtil.isLocalNPMRegistry(url)).toBeTruthy();
        url = 'https://AccessibilityInsights.visualstudio.com/_packaging/React/npm/registry/';
        expect(NpmRegistryUtil.isLocalNPMRegistry(url)).toBeTruthy();
    });
});
