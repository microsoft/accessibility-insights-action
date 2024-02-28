// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { HashRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './Home';
import Linked1 from './Linked1/Linked1';
import InnerPage from './Linked1/InnerPage';
import Linked2 from './Linked2/Linked2';

// Hash routing used in the test app is declared here.
function App() {
    return (
        <Router base="/" hashType="noslash">
            <Switch>
                <Route path="/home" component={Home} />
                <Route path="/linked1" component={Linked1} />
                <Route path="/linked2" component={Linked2} />
                <Route path="/innerpage" component={InnerPage} />
                <Route path="/" component={Home} />
            </Switch>
        </Router>
    );
}

export default App;
