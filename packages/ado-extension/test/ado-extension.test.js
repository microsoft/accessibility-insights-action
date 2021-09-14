"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const assert = __importStar(require("assert"));
const ttm = __importStar(require("azure-pipelines-task-lib/mock-test"));
describe('Sample task tests', function () {
    it('should succeed with simple inputs', function (done) {
        const compiledSourcePath = path.join(__dirname, 'run.js');
        const testSubject = new ttm.MockTestRunner(compiledSourcePath);
        testSubject.run();
        console.log(testSubject.stdout);
        assert.strictEqual(testSubject.succeeded, true, 'should have succeeded');
        assert.strictEqual(testSubject.warningIssues.length, 0, 'should have no warnings');
        assert.strictEqual(testSubject.errorIssues.length, 0, 'should have no errors');
        assert.strictEqual(testSubject.stdOutContained('installing runtime dependencies'), true, 'should install run time dependencies');
        assert.strictEqual(testSubject.stdOutContained('Found 4 accessibility issues on page http://localhost:'), true, 'should find accessibility issues');
        done();
    });
});
//# sourceMappingURL=ado-extension.test.js.map