// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import React from 'react';
import { NavLink } from 'react-router-dom';

// Linked1 component having no accessibility failures, used to hash navigate to home page and innerpage.
const Linked1 = () => {
    return (
        <div>
            <h1>Linked page with inner page</h1>
            <p>
                <NavLink to="/home">Back to home</NavLink>
            </p>
            <p>
                <NavLink to="/innerpage">To inner page</NavLink>
            </p>
        </div>
    );
};

export default Linked1;
