import { findByLabelText } from '@testing-library/react'
import React, {lazy} from 'react'
import styled from 'styled-components'
import {Link} from 'react-navi'
import './NavigationBar.css'
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";

//import {Link} from 'react-router-dom'
import {Menu} from 'semantic-ui-react'

const Health = lazy(() => import("../pages/Health"));      //lazy imports to save on load time
const About = lazy(() => import("../pages/About"));    //lazy imports to save on load time
const Home = lazy(() => import("../pages/Home"));      //lazy imports to save on load time
const Admin = lazy(() => import("../pages/Admin"));      //lazy imports to save on load time
const Involved = lazy(() => import("../pages/Involved"));      //lazy imports to save on load time

const NavigationWrapper = styled.nav`
    background-color: #f895a0;
    display: flex;
    margin: 24px auto 16px;
    justify-content:space-between;
    `
const NavigationBar1 = () => (
    <NavigationWrapper>
        <Link className = "navLink" href="/home">Home</Link>
        <Link className = "navLink" href="/about">About</Link>
        <Link className = "navLink" href="/health">Health Information</Link>
        <Link className = "navLink" href="/involved">Get Involved</Link>
        <Link className = "navLink" href="/admin">Admin</Link>

    </NavigationWrapper>
)

export default NavigationBar1;
