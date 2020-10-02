import { findByLabelText } from '@testing-library/react'
import React, {lazy} from 'react'
import styled from 'styled-components'
import {Link} from 'react-navi'
import './NavigationBar.css'
import {BrowserRouter as Router, Switch, Route} from "react-router-dom";

//import {Link} from 'react-router-dom'
import {Menu} from 'semantic-ui-react'

const About = lazy(() => import("./../pages/About"));    //lazy imports to save on load time
const Home = lazy(() => import("./../pages/Home"));      //lazy imports to save on load time

const NavigationWrapper = styled.nav`
    background-color: #f895a0;
    display: flex;
    margin: 24px auto 16px;
    justify-content:space-between;
    `
const NavigationBar = () => (
    <NavigationWrapper>
        <Link className = "navLink" href="/home">Home</Link>
        <Link className = "navLink" href="/about">About</Link>
        <Link className = "navLink" href="/health">Health Information</Link>
        <Link className = "navLink" href="/involved">Get Involved</Link>
        <Link className = "navLink" href="/admin">Admin</Link>

    </NavigationWrapper>
)




// var myMenu = ['Home',"About"];
// function NavigationBar(){
//     return(

//     // <NavigationWrapper>
//     //     <Link className = "navLink" href="/home">Home</Link>
//     //     <Link className = "navLink" href="/about">About</Link>
//     //     <Link className = "navLink" href="/about">Health Information</Link>
//     // </NavigationWrapper>

//     <div>
//     <button className='hamburger'>m</button>
//     <ul className='menu'>
//         {myMenu.map(item => {
//         return <Menu.Item key={item} text={item}/>
//         })}
//     </ul>
//     </div>  
//     )
// }  


export default NavigationBar;
