import React, {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Switch, Route,Link, NavLink} from "react-router-dom";


// Import Pages
const About = lazy(() => import("../pages/About"));         //lazy imports to save on load time
const Home = lazy(() => import("../pages/Home"));           //lazy imports to save on load time
const Health = lazy(() => import("../pages/Health"));       //lazy imports to save on load time
const Admin = lazy(() => import("../pages/Admin"));         //lazy imports to save on load time
const Involved = lazy(() => import("../pages/Involved"));   //lazy imports to save on load time


const Routes = () => {
    return(
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
            <Switch>
                <Route path="/about" component={About} />
                <Route path="/health" component = {Health}/> 
                <Route path="/involved" component = {Involved}/>
                <Route path="/admin" component={Admin} />
                <Route path={["/home","/"]} component = {Home}/>
            </Switch>
            </Suspense>
        </Router>
    )

}


export default Routes