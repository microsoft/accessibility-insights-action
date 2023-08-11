// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

// This is a modified version of azure-pipelines-task-lib/mock-test.
// It removes the steps to install Node, which caused the pipeline to timeout.
// Reference: https://github.com/microsoft/azure-pipelines-task-lib/blob/1bed8869fad272061494e965b30f0d10550e49de/node/mock-test.ts

import { spawnSync } from 'child_process';
import * as cmdm from 'azure-pipelines-task-lib/taskcommand';

const COMMAND_TAG = '[command]';
const COMMAND_LENGTH = COMMAND_TAG.length;

export class MockTestRunner {
    constructor(testPath: string, inputs?: { [key: string]: string }) {
        this._testPath = testPath;
        if (inputs !== undefined) {
            this._inputs = inputs;
        }
    }

    private _inputs: { [key: string]: string } | undefined;
    private _testPath = '';
    public stdout = '';
    public stderr = '';
    public cmdlines: { [cmdline: string]: boolean } = {};
    public invokedToolCount = 0;
    public succeeded = false;
    public errorIssues: string[] = [];
    public warningIssues: string[] = [];

    get failed(): boolean {
        return !this.succeeded;
    }

    public ran(cmdline: string): boolean {
        // eslint-disable-next-line no-prototype-builtins
        return this.cmdlines.hasOwnProperty(cmdline.trim());
    }

    public createdErrorIssue(message: string): boolean {
        return this.errorIssues.indexOf(message.trim()) >= 0;
    }

    public createdWarningIssue(message: string): boolean {
        return this.warningIssues.indexOf(message.trim()) >= 0;
    }

    public stdOutContained(message: string): boolean {
        return this.stdout.indexOf(message) > 0;
    }

    public stdErrContained(message: string): boolean {
        return this.stderr.indexOf(message) > 0;
    }

    public stdOutContainedRegex(regex: RegExp): boolean {
        const lines: string[] = this.splitToLines(this.stdout.toString());

        for (const line of lines) {
            if (regex.test(line)) {
                return true;
            }
        }

        return false;
    }

    splitToLines(text: string): string[] {
        return text.replace(/\r\n/g, '\n').split('\n');
    }

    public run(): void {
        this.cmdlines = {};
        this.invokedToolCount = 0;
        this.succeeded = true;

        this.errorIssues = [];
        this.warningIssues = [];

        const args = [this._testPath];
        if (this._inputs !== undefined) {
            args.push(JSON.stringify(this._inputs));
        }

        const spawn = spawnSync('node', args);

        if (spawn.error) {
            console.error('Running test failed');
            console.error(spawn.error.message);
            return;
        }

        this.stdout = spawn.stdout.toString();
        this.stderr = spawn.stderr.toString();

        const lines: string[] = this.stdout.replace(/\r\n/g, '\n').split('\n');

        for (const line of lines) {
            const ci = line.indexOf('##vso[');
            let cmd: cmdm.TaskCommand | undefined;
            const cmi = line.indexOf(COMMAND_TAG);
            if (ci >= 0) {
                cmd = cmdm.commandFromString(line.substring(ci));
                if (cmd.command === 'task.complete' && cmd.properties['result'] === 'Failed') {
                    this.succeeded = false;
                }

                if (cmd.command === 'task.issue' && cmd.properties['type'] === 'error') {
                    this.errorIssues.push(cmd.message.trim());
                }

                if (cmd.command === 'task.issue' && cmd.properties['type'] === 'warning') {
                    this.warningIssues.push(cmd.message.trim());
                }
            } else if (cmi == 0 && line.length > COMMAND_LENGTH) {
                const cmdline: string = line.substring(COMMAND_LENGTH).trim();
                this.cmdlines[cmdline] = true;
                this.invokedToolCount++;
            }
        }
    }
}
