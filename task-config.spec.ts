// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
// tslint:disable:no-import-side-effect no-any
import 'reflect-metadata';

import * as actionCore from '@actions/core';
import { IMock, Mock, Times } from 'typemoq';

import { TaskConfig } from './task-config';

// tslint:disable: no-object-literal-type-assertion no-unsafe-any

describe(TaskConfig, () => {
    let processStub: typeof process;
    let actionCoreMock: IMock<typeof actionCore>;
    let taskConfig: TaskConfig;
    const workspace = 'some-workspace';

    beforeEach(() => {
        processStub = {
            env : {
                GITHUB_WORKSPACE: workspace,
            }
        } as any;
        actionCoreMock = Mock.ofType<typeof actionCore>();

        taskConfig = new TaskConfig(processStub, actionCoreMock.object);

    });

    it('getReportOutDir', () => {
        const dir = taskConfig.getReportOutDir();
        expect(dir).toBe(`${workspace}\\_accessibility-reports`);
    });

    it('getSiteDir', () => {
        const siteDir = 'site';
        actionCoreMock
            .setup(am => am.getInput('site-dir'))
            .returns(() => siteDir)
            .verifiable(Times.once());

        const dir = taskConfig.getSiteDir();

        expect(dir).toBe(siteDir);
        actionCoreMock.verifyAll();
    });

    it('getScanUrlRelativePath', () => {
        const path = 'path';
        actionCoreMock
            .setup(am => am.getInput('scan-url-relative-path'))
            .returns(() => path)
            .verifiable(Times.once());

        const res = taskConfig.getScanUrlRelativePath();

        expect(res).toBe(path);
        actionCoreMock.verifyAll();
    });

    it('getToken', () => {
        const token = 'repo-token';
        actionCoreMock
            .setup(am => am.getInput('repo-token'))
            .returns(() => token)
            .verifiable(Times.once());

        const res = taskConfig.getToken();

        expect(res).toBe(token);
        actionCoreMock.verifyAll();
    });

});
