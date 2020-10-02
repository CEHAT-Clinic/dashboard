import { findByLabelText } from '@testing-library/react'
import React, {useState, useEffect} from 'react'
import './NavigationBar.css'
import Routes from "./Routes"




function NavigationBar() {
    const [isNavVisible, setIsNavVisible] = useState(true);
    const [isSmallScreen, setIsSmallScreen] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia("(max-width: 700px)");
        mediaQuery.addEventListener("change",handleMediaQueryChange);

        return () => {
            mediaQuery.removeEventListener("change",handleMediaQueryChange);
        };
    }, []);

    const handleMediaQueryChange = (mediaQuery: { matches: any; }) => {
        if (mediaQuery.matches){
            setIsSmallScreen(true);
        } else{
            setIsSmallScreen(false)
        }
    }

    const toggleNav = () => {
        setIsNavVisible(!isNavVisible);
    };

    return(
    <div>
        <header className = "Navigation_Header">
            <img src ={require ("./logo192.png")} className= "Logo" alt= "logo" />
            {(!isSmallScreen || isNavVisible) && (
            <nav className = "Nav">
                <a href ="home">Home</a>
                <a href="/about">About</a>
                <a href="/health">Health Information</a>
                <a href="/involved">Get Involved</a>
                <a href="/admin">Admin</a>
            </nav>
            )}
            <button onClick={toggleNav} className="Burger">
                *
            </button>
        </header>
        <Routes/>
    </div>
    )
}

export default NavigationBar;
