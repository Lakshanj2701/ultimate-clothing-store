import React from 'react'
import Topbar from '../Layout/Topbar';
import Navbar from './navbar';

const Header = () => {
  return (
    <header>
        {/* Topbar */}
        <Topbar/>
        {/* navbar */}
        <Navbar/>
        {/* Card Drawer */}

    </header>
  );
};

export default Header;