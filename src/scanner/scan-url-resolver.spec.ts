// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import 'reflect-metadata';

import { Mock, MockBehavior } from 'typemoq';
import { TaskConfig } from '../task-config';
import { ScanUrlResolver } from './scan-url-resolver';

describe(ScanUrlResolver, () => {
    const taskConfigMock = Mock.ofType<TaskConfig>(null, MockBehavior.Strict);
    const scanUrlResolver = new ScanUrlResolver(taskConfigMock.object, (a, b) => `${a}---${b}`);

    it('provides resolved URL from baseUrl and task config scanUrlRelativePath', () => {
        taskConfigMock.setup((m) => m.getScanUrlRelativePath()).returns((_) => 'relative-path');
        const args = scanUrlResolver.resolveLocallyHostedUrls('base-url');
        expect(args).toStrictEqual({
            url: 'base-url---relative-path',
        });
    });
});
