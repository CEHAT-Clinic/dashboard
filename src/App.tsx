import React, {lazy, Suspense} from 'react';
import {BrowserRouter as Router, Switch, Route,Link, NavLink} from "react-router-dom";
import './App.css';
import  NavigationBar from './components/NavigationBar';


const App: React.FC = () => (
  <div className = "ui container">
  <NavigationBar/>
  
  </div>
);

export default App;


