// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import 'reflect-metadata';

import type * as fs from 'fs';
import * as path from 'path';
import { AdoExtensionMetadataProvider } from './ado-extension-metadata';

/* eslint-disable security/detect-non-literal-fs-filename */

describe(AdoExtensionMetadataProvider, () => {
    const metadataFileContentsWithTelemetry = `{
        "publisherId": "accessibility-insights", 
        "extensionId": "extension-id", 
        "extensionName": "Extension Name", 
        "extensionVersion": "1.2.03", 
        "environment": "test", 
        "appInsightsConnectionString": "EXAMPLE HERE" 
    }`;

    const metadataFileContentsWithoutTelemetry = `{
        "publisherId": "accessibility-insights", 
        "extensionId": "extension-id", 
        "extensionName": "Extension Name", 
        "extensionVersion": "1.2.03", 
        "environment": "test", 
        "appInsightsConnectionString": "" 
    }`;

    let mockFs: { readFileSync?: () => string };
    let testSubject: AdoExtensionMetadataProvider;

    beforeEach(() => {
        mockFs = {};
        testSubject = new AdoExtensionMetadataProvider(mockFs as unknown as typeof fs);
    });

    it('reads from the expected file', () => {
        mockFs.readFileSync = jest.fn(() => metadataFileContentsWithTelemetry);

        testSubject.readMetadata();

        expect(mockFs.readFileSync).toHaveBeenCalledWith(path.join(__dirname, 'ado-extension-metadata.json'), { encoding: 'utf8' });
    });

    it('successfully parses a metadata file with telemetry info', () => {
        mockFs.readFileSync = () => metadataFileContentsWithTelemetry;

        expect(testSubject.readMetadata()).toStrictEqual({
            publisherId: 'accessibility-insights',
            extensionId: 'extension-id',
            extensionName: 'Extension Name',
            extensionVersion: '1.2.03',
            environment: 'test',
            appInsightsConnectionString: 'EXAMPLE HERE',
        });
    });

    it('successfully parses a metadata file without telemetry info', () => {
        mockFs.readFileSync = () => metadataFileContentsWithoutTelemetry;

        expect(testSubject.readMetadata()).toStrictEqual({
            publisherId: 'accessibility-insights',
            extensionId: 'extension-id',
            extensionName: 'Extension Name',
            extensionVersion: '1.2.03',
            environment: 'test',
            appInsightsConnectionString: null,
        });
    });

    it('throws an error if ado-extension-metadata.json does not exist', () => {
        const readFileError = new Error('readFileSync error');
        mockFs.readFileSync = () => {
            throw readFileError;
        };

        expect(() => testSubject.readMetadata()).toThrowError(readFileError);
    });

    it('throws an error if ado-extension-metadata.json is malformatted', () => {
        mockFs.readFileSync = () => '{ "extensionName": "Oops it had some stray "quotes"" }';

        expect(() => testSubject.readMetadata()).toThrowErrorMatchingInlineSnapshot();
    });
});
