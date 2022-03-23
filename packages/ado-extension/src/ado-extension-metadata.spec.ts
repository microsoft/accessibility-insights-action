// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import 'reflect-metadata';

import type * as fs from 'fs';
import * as path from 'path';
import { readAdoExtensionMetadata } from './ado-extension-metadata';

/* eslint-disable security/detect-non-literal-fs-filename */
/* eslint-disable @typescript-eslint/no-unused-vars */

describe(readAdoExtensionMetadata, () => {
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

    it('reads from the expected file', () => {
        const mockFs = {
            readFileSync: jest.fn((_path, _options) => metadataFileContentsWithTelemetry),
        } as unknown as typeof fs;

        readAdoExtensionMetadata(mockFs);
        expect(mockFs.readFileSync).toHaveBeenCalledWith(path.join(__dirname, 'ado-extension-metadata.json'), { encoding: 'utf8' });
    });

    it('successfully parses a metadata file with telemetry info', () => {
        const mockFs = {
            readFileSync: () => metadataFileContentsWithTelemetry,
        } as unknown as typeof fs;

        const output = readAdoExtensionMetadata(mockFs);
        expect(output).toStrictEqual({
            publisherId: 'accessibility-insights',
            extensionId: 'extension-id',
            extensionName: 'Extension Name',
            extensionVersion: '1.2.03',
            environment: 'test',
            appInsightsConnectionString: 'EXAMPLE HERE',
        });
    });

    it('successfully parses a metadata file without telemetry info', () => {
        const mockFs = {
            readFileSync: () => metadataFileContentsWithoutTelemetry,
        } as unknown as typeof fs;

        const output = readAdoExtensionMetadata(mockFs);
        expect(output).toStrictEqual({
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
        const mockFs = {
            readFileSync: () => {
                throw readFileError;
            },
        } as unknown as typeof fs;

        expect(() => readAdoExtensionMetadata(mockFs)).toThrowError(readFileError);
    });

    it('throws an error if ado-extension-metadata.json is malformatted', () => {
        const mockFs = {
            readFileSync: () => '{ "extensionName": "Oops it had some stray "quotes"" }',
        } as unknown as typeof fs;

        expect(() => readAdoExtensionMetadata(mockFs)).toThrowErrorMatchingInlineSnapshot();
    });
});
