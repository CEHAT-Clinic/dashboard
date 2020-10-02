import React, {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Switch, Route,Link} from "react-router-dom";
import './App.css';
import  NavigationBar from './components/NavigationBar';

const About = lazy(() => import("./pages/About"));    //lazy imports to save on load time
const Home = lazy(() => import("./pages/Home"));      //lazy imports to save on load time
const Health = lazy(() => import("./pages/Health"));      //lazy imports to save on load time
const Admin = lazy(() => import("./pages/Admin"));      //lazy imports to save on load time
const Involved = lazy(() => import("./pages/Involved"));      //lazy imports to save on load time

// function App() {
//   return (
//     <div className="App">
//       <header>Hello World</header>
//     </div>
//   );
// }

const App: React.FC = () => (
  <div className = "ui container">
  <NavigationBar/>
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
        </ul>
      </nav>
      <Switch>
        <Route path="/about"><About /></Route>
        <Route path="/"><Home /></Route>
        <Route path="/health"><Health /></Route>
        <Route path="/involved"><Involved /></Route>
        <Route path="/admin"><Admin /></Route>
      </Switch>
    </Suspense>
  </Router>
  </div>
);

export default App;


