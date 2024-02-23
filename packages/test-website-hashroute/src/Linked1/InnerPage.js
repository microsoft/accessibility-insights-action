// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import React from 'react';
import { NavLink } from 'react-router-dom';

// InnerPage component having intentional image-alt accessibility failures for the test app.
const InnerPage = () => {
    return (
        <div>
            <h1>Inner page with issues</h1>
            <img id="non-decorative" src="./img1.png" />
            <NavLink to="home">Back to home</NavLink>
        </div>
    );
};

export default InnerPage;
