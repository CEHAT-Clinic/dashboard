import { findByLabelText } from '@testing-library/react'
import React from 'react'
import {Link} from 'react-navi'
import styled from 'styled-components'
import './NavigationBar.css'

const NavigationWrapper = styled.nav`
    display: flex;
    width: 70%;
    margin: 24px auto 16px;
    justify-content:space-between;
    `


const NavigationBar = () => (
    <NavigationWrapper>
        <Link className = "navLink" href="/">Page 1</Link>
        <Link className = "navLink" href="/">Page 2</Link>
        <Link className = "navLink" href="/">Page 3</Link>

    </NavigationWrapper>
)
export default NavigationBar;
