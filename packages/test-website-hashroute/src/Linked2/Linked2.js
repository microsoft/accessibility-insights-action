// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import React from 'react';
import { NavLink } from 'react-router-dom';

// Linked2 component having no accessibility failures, used to hash navigate to home page.
const Linked2 = () => {
    return (
        <div>
            <h1>Linked page without inner page</h1>
            <p>
                <NavLink to="/home">Back to home</NavLink>
            </p>
        </div>
    );
};

export default Linked2;
