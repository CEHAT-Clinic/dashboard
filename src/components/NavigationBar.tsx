import { findByLabelText } from '@testing-library/react'
import React, {lazy} from 'react'
import styled from 'styled-components'
import {Link} from 'react-navi'
import './NavigationBar.css'
import Routes from "./Routes"


const NavigationWrapper = styled.nav`
    background-color: #f895a0;
    display: flex;
    margin: 24px auto 16px;
    justify-content:space-between;
    `
const NavigationBar = () => (
    <div>
        <NavigationWrapper>
            <Link className = "navLink" href="/home">Home</Link>
            <Link className = "navLink" href="/about">About</Link>
            <Link className = "navLink" href="/health">Health Information</Link>
            <Link className = "navLink" href="/involved">Get Involved</Link>
            <Link className = "navLink" href="/admin">Admin</Link>
        </NavigationWrapper>
        <Routes/>
    </div>
)

export default NavigationBar;
