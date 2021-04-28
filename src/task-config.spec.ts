// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import * as actionCore from '@actions/core';
import * as process from 'process';
import { IMock, Mock, Times } from 'typemoq';

import { TaskConfig } from './task-config';

describe(TaskConfig, () => {
    let processStub: typeof process;
    let actionCoreMock: IMock<typeof actionCore>;
    let taskConfig: TaskConfig;
    const runId = 789;
    const workspace = 'some-workspace';

    beforeEach(() => {
        processStub = {
            env: {
                GITHUB_WORKSPACE: workspace,
                GITHUB_RUN_ID: `${runId}`,
            },
        } as any;
        actionCoreMock = Mock.ofType<typeof actionCore>();

        taskConfig = new TaskConfig(processStub, actionCoreMock.object);
    });

    it('getReportOutDir', () => {
        const outputDir = 'output-dir';
        actionCoreMock
            .setup((am) => am.getInput('output-dir'))
            .returns(() => outputDir)
            .verifiable(Times.once());
        const dir = taskConfig.getReportOutDir();
        expect(dir).toBe(outputDir);
    });

    it('getSiteDir', () => {
        const siteDir = 'site';
        actionCoreMock
            .setup((am) => am.getInput('site-dir'))
            .returns(() => siteDir)
            .verifiable(Times.once());

        const dir = taskConfig.getSiteDir();

        expect(dir).toBe(siteDir);
        actionCoreMock.verifyAll();
    });

    it('getScanUrlRelativePath', () => {
        const relativePath = 'path';
        actionCoreMock
            .setup((am) => am.getInput('scan-url-relative-path'))
            .returns(() => relativePath)
            .verifiable(Times.once());

        const res = taskConfig.getScanUrlRelativePath();

        expect(res).toBe(relativePath);
        actionCoreMock.verifyAll();
    });

    it('getToken', () => {
        const token = 'repo-token';
        actionCoreMock
            .setup((am) => am.getInput('repo-token'))
            .returns(() => token)
            .verifiable(Times.once());

        const res = taskConfig.getToken();

        expect(res).toBe(token);
        actionCoreMock.verifyAll();
    });

    it('getChromePath', () => {
        const chromePath = 'chrome-path';
        actionCoreMock
            .setup((am) => am.getInput('chrome-path'))
            .returns(() => chromePath)
            .verifiable(Times.once());

        const res = taskConfig.getChromePath();

        expect(res).toBe(chromePath);
        actionCoreMock.verifyAll();
    });

    it('getChromePath returns empty', () => {
        const chromePath = 'some path';
        process.env.CHROME_BIN = chromePath;

        actionCoreMock
            .setup((am) => am.getInput('chrome-path'))
            .returns(() => '')
            .verifiable(Times.once());

        const res = taskConfig.getChromePath();

        expect(res).toBe(chromePath);
        actionCoreMock.verifyAll();
    });

    it('getUrl', () => {
        const remoteUrl = 'remote-url';
        actionCoreMock
            .setup((am) => am.getInput('url'))
            .returns(() => remoteUrl)
            .verifiable(Times.once());

        const res = taskConfig.getUrl();

        expect(res).toBe(remoteUrl);
        actionCoreMock.verifyAll();
    });

    it('getRunId', () => {
        const res = taskConfig.getRunId();

        expect(res).toBe(runId);
        actionCoreMock.verifyAll();
    });
});
