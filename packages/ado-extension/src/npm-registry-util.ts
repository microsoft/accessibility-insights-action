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
    if (!serviceConnectionAuth) {
        throw new Error('Could not find the service connection');
    }

    const serviceConnectionAuthScheme = serviceConnectionAuth?.scheme;

    if (serviceConnectionAuthScheme === 'Token') {
        const token = serviceConnectionAuth.parameters['apitoken'];
        // to mask the token in pipeline logs
        adoTask.setSecret(token);
        const usernameToken = `username:${token}`;
        adoTask.setSecret(usernameToken);
        const base64Token = Buffer.from(usernameToken).toString('base64');
        // to mask the token in pipeline logs
        adoTask.setSecret(base64Token);
        npmAuthIdent = base64Token;
    } else if (serviceConnectionAuthScheme === 'UsernamePassword') {
        const username = serviceConnectionAuth.parameters['username'];
        const password = serviceConnectionAuth.parameters['password'];
        // to mask the token in pipeline logs
        adoTask.setSecret(password);
        npmAuthIdent = `${username}:${password}`;
    } else {
        throw new Error('Service connection auth scheme not supported');
    }
    // to mask the token in pipeline logs
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
    const baseUrl = 'https://pkgs.dev.azure.com/';
    const packagingPath = '/_packaging/';
    let formatedRegistryURL = npmRegistryUrl.toLowerCase();

    const packageStartIndex = formatedRegistryURL.indexOf(packagingPath);

    if (packageStartIndex === -1) {
        return null;
    }

    formatedRegistryURL = formatedRegistryURL.substring(0, packageStartIndex);

    if (formatedRegistryURL.startsWith(baseUrl)) {
        formatedRegistryURL = formatedRegistryURL.substring(baseUrl.length);
        const adoDetailParts = formatedRegistryURL.split('/');
        return adoDetailParts[0];
    } else if (formatedRegistryURL.includes('visualstudio.com')) {
        formatedRegistryURL = formatedRegistryURL.replace('https://', '');
        const adoDetailParts = formatedRegistryURL.split('.');
        return adoDetailParts[0];
    } else {
        return null;
    }
}
