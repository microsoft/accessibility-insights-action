// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import * as adoTask from 'azure-pipelines-task-lib/task';

export function getSystemAccessToken(): string {
    const authentication = adoTask.getEndpointAuthorization('SYSTEMVSSCONNECTION', false);

    if (authentication?.scheme === 'OAuth') {
        adoTask.setSecret(authentication.parameters['AccessToken']);
        return authentication.parameters['AccessToken'];
    } else {
        adoTask.warning('Not able to find the credential');
        return '';
    }
}

export function getTokenFromServiceConnection(serviceConnectionName: string): string {
    let serviceConnectionAuth: adoTask.EndpointAuthorization | undefined;
    let npmAuthIdent: string;
    try {
        serviceConnectionAuth = adoTask.getEndpointAuthorization(serviceConnectionName, false);
    } catch (exception) {
        throw new Error('Could not find the service connection');
    }

    if (serviceConnectionAuth?.scheme === 'Token') {
        const token = serviceConnectionAuth.parameters['apiToken'];

        // to mask the token in pipeline logs
        adoTask.setSecret(token);
        const base64Token = Buffer.from(token).toString('base64');
        adoTask.setSecret(base64Token);
        npmAuthIdent = `username:${base64Token}`;
    } else if (serviceConnectionAuth?.scheme === 'UsernamePassword') {
        const username = serviceConnectionAuth.parameters['username'];
        const password = serviceConnectionAuth.parameters['password'];
        adoTask.setSecret(password);
        npmAuthIdent = `${username}:${password}`;
    } else {
        throw new Error('Service connection auth scheme not supported');
    }

    adoTask.setSecret(npmAuthIdent);
    return npmAuthIdent;
}

export function isLocalNPMRegistry(npmRegistryUrl: string): boolean {
    const orgFromUrl = getProjectIdFromNpmRegistryUrl(npmRegistryUrl);
    const pipelineOrg = adoTask.getVariable('System.CollectionUri');

    if (orgFromUrl === null) {
        return false;
    }
    if (pipelineOrg?.toLowerCase().includes(orgFromUrl?.toLowerCase())) {
        return true;
    } else {
        return false;
    }
}

function getProjectIdFromNpmRegistryUrl(npmRegistryUrl: string): string | null {
    const baseUrl = 'https://pkgs.dev.azure.com';
    const packagingPath = '/_packaging/';

    if (!npmRegistryUrl.startsWith(baseUrl)) {
        return null;
    }

    const removedBaseUrl = npmRegistryUrl.substring(baseUrl.length);

    const packageStartIndex = removedBaseUrl.indexOf(packagingPath);

    if (packageStartIndex === -1) {
        return null;
    }

    const removedPackaginPath = removedBaseUrl.substring(0, packageStartIndex);

    const adoDetailParts = removedPackaginPath.split('/');

    return adoDetailParts[0];
}
