import React, {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';

// Import Pages: lazy imports to save on load time
const About = lazy(() => import('./pages/About'));
const Home = lazy(() => import('./pages/Home'));
const Health = lazy(() => import('./pages/Health'));
const Admin = lazy(() => import('./pages/Admin'));
const Involved = lazy(() => import('./pages/Involved'));

function Routes(): JSX.Element {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Switch>
          <Route path="/about" component={About} />
          <Route path="/health" component={Health} />
          <Route path="/involved" component={Involved} />
          <Route path="/admin" component={Admin} />
          <Route path="/" component={Home} />
        </Switch>
      </Suspense>
    </Router>
  );
}

export default Routes;
