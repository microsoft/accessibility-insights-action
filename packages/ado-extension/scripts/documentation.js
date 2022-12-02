// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { writeFileSync } = require('fs');
const { inputs } = require('../task.json');

// Do not document the following inputs:
const exclude = ['hostingMode'];

const requiredInputs = [];
const optionalInputs = [];

// Sort inputs into "required" and "optional"
for (const input of inputs) {
    if (exclude.includes(input.name)) continue;
    if (input.required) requiredInputs.push(input);
    else optionalInputs.push(input);
}

// Build markdown:
// (The "DO NOT EDIT" notice is meant for the generated markdown file only)
const markdown = `<!--
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the MIT License.
-->

<!--
DO NOT EDIT THIS FILE DIRECTLY

If you would like to change an input, edit packages/ado-extension/task.json
If you would like to change the layout of this file, edit packages/ado-extension/scripts/documentation.js

To rebuild this file, run "yarn docs" or "yarn precheckin"
-->

# Accessibility Insights for Azure DevOps inputs

## Required inputs

${requiredInputs.reverse().map(documentInput).join('\nor\n')}

## Optional inputs

${optionalInputs.map(documentInput).join('\n')}`;

// Write documentation:
writeFileSync('../../docs/ado-extension-inputs.md', markdown);

//
// Documentation functions
//
function documentInput({ name, type, required, defaultValue, helpMarkDown, options }) {
    return `- \`${name}\` (${handleType(type, options)})${handleRequired(required)}.${handleDefault(defaultValue)} ${helpMarkDown}\n`;
}

function handleDefault(defaultValue) {
    return defaultValue ? ` Default: \`${defaultValue}\`.` : '';
}

function handleRequired(required) {
    return required ? ` **Required**` : '';
}

function handleType(type, options) {
    if (type !== 'pickList') return type;
    return `One of: ${Object.keys(options)
        .filter((f) => f)
        .map((o) => `"${o}"`)
        .join(', ')}`;
}
