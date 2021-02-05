import React, {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Switch, Route} from 'react-router-dom';
import Loading from './components/Util/Loading';

// Import Pages: lazy imports to save on load time
const About = lazy(() => import('./pages/About'));
const Home = lazy(() => import('./pages/Home'));
const Health = lazy(() => import('./pages/Health'));
const Admin = lazy(() => import('./pages/Admin'));
const Involved = lazy(() => import('./pages/Involved'));
const ManageAccount = lazy(
  () => import('./components/Admin/UserPage/ManageAccount')
);
const ManageUsers = lazy(
  () => import('./components/Admin/UserPage/ManageUsers')
);
const ManageSensors = lazy(
  () => import('./components/Admin/UserPage/ManageSensors')
);

function Routes(): JSX.Element {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Switch>
          <Route path="/about" component={About} />
          <Route path="/health" component={Health} />
          <Route path="/involved" component={Involved} />
          <Route exact path="/admin" component={Admin} />
          <Route path="/admin/account" component={ManageAccount} />
          <Route path="/admin/users" component={ManageUsers} />
          <Route path="/admin/sensors" component={ManageSensors} />
          <Route exact path="/" component={Home} />
        </Switch>
      </Suspense>
    </Router>
  );
}

export default Routes;
