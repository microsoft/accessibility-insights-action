// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import React from 'react';
import { NavLink } from 'react-router-dom';
import image from './img1.png';

// Home page of test app having multiple intentional accessibility failures for testing.
const Home = () => {
    return (
        <div>
            <h1>Links</h1>
            <ul>
                <li>
                    <NavLink to="/linked1">Link 1</NavLink>
                </li>
                <li>
                    <NavLink to="/linked2">Link 2</NavLink>
                </li>
            </ul>

            <h1>Input radio - Native Widgets</h1>
            <div>
                <h2>Radio</h2>
                <form>
                    <input id="input-radio-1" type="radio" name="color" value="red" checked /> Red
                    <br />
                    <input type="radio" name="color" value="green" /> Green
                    <br />
                    <input type="radio" name="color" value="blue" /> Blue
                </form>
            </div>

            <h1>Images</h1>
            <img id="decorative" role="presentation" alt="Some alt text" src={image} />
            <img id="decorative-alt-empty" height="4px" alt="" src={image} />
            <img id="non-decorative" src={image} />
        </div>
    );
};

export default Home;
