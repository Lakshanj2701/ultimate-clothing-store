// components/Layout/Navbar.js
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineUser, HiOutlineShoppingBag, HiBars3BottomRight } from "react-icons/hi2";
import { FiLogOut, FiLogIn } from "react-icons/fi";
import SearchBar from './SearchBar';
import CartDrawer from '../Layout/CartDrawer';
import React, { useState } from 'react'; 
import { IoMdClose } from 'react-icons/io';
import { toast } from 'sonner';
import { useCart } from '../Cart/CartContext';

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navDrawerOpen, setNavDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const { cart } = useCart();

  const toggleNavDrawer = () => {
    setNavDrawerOpen(!navDrawerOpen); 
  };

  const toggleCartDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/');
    window.location.reload();
  };

  return (
    <>
      <nav className="container mx-auto flex items-center justify-between py-4 px-6">
        {/* Left - Logo */}
        <div>
          <Link to="/" className="text-2xl font-medium">
            Ultimate clothing
          </Link>
        </div>

        {/* Center - Navigation Links */}
        <div className="hidden md:flex space-x-6">
          <Link to="/collections/men" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
            Men
          </Link>
          <Link to="/collections/women" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
            Women
          </Link>
          <Link to="/collections/custom" className="text-gray-700 hover:text-black text-sm font-medium uppercase">
            Custom
          </Link>
        </div>

        {/* Right Icons */}  
        <div className="flex items-center space-x-4">
          {/* Admin Link (only for logged in admins) */}
          {user?.role === 'admin' && (
            <Link to="/admin" className="block bg-black px-2 rounded text-sm text-white">
              Admin        
            </Link>
          )}
          
          {/* Profile Link (only for logged in users) */}
          {user ? (
            <Link to="/profile" className="hover:text-black">
              <HiOutlineUser className="h-6 w-6 text-gray-700"/>
            </Link>
          ) : null}

          {/* Cart Button */}
          <button onClick={toggleCartDrawer} className="relative hover:text-black">
            <HiOutlineShoppingBag className="h-6 w-6 text-gray-700"/>
            {cart?.products?.length > 0 && (
              <span className="absolute -top-1 bg-[#ea2e0e] text-white text-xs rounded-full px-2 py-0.5">
                {cart.products.reduce((total, item) => total + item.quantity, 0)}
              </span>
            )}
          </button>

          {/* Auth Buttons (Desktop) */}
          <div className="hidden md:flex items-center space-x-2">
            {user ? (
              // Logout Button for logged in users
              <button 
                onClick={handleLogout} 
                className="flex items-center space-x-1 text-gray-700 hover:text-black"
              >
                <FiLogOut className="h-6 w-6"/>
                <span className="text-sm">Logout</span>
              </button>
            ) : (
              // Login/Signup Buttons for guests
              <>
                <Link to="/login" className="flex items-center space-x-1 text-gray-700 hover:text-black">
                  <FiLogIn className="h-6 w-6"/>
                  <span className="text-sm">Login</span>
                </Link>
                <Link to="/register" className="bg-black text-white px-3 py-1 rounded text-sm hover:bg-gray-800">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Search Bar */}
          <div className="overflow-hidden">
            <SearchBar/>
          </div>
          
          {/* Mobile Menu Button */}
          <button onClick={toggleNavDrawer} className="md:hidden">
            <HiBars3BottomRight className="h-6 w-6 text-gray-700"/>
          </button>     
        </div>
      </nav>

      <CartDrawer drawerOpen={drawerOpen} toggleCartDrawer={toggleCartDrawer}/>   

      {/* Mobile Navigation */} 
      <div className={`fixed top-0 left-0 w-3/4 sm:w-1/2 md:w-1/3 h-full
          bg-white shadow-lg transform transition-transform duration-300
            z-50 ${navDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex justify-end p-4">
          <button onClick={toggleNavDrawer}>
            <IoMdClose className="h-6 w-6 text-gray-600"/>
          </button>
        </div>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Menu</h2>
          <nav className="space-y-4">
            <Link to="/collections/men" onClick={toggleNavDrawer} className="block text-gray-600 hover:text-black">
              Men
            </Link>
            <Link to="/collections/women" onClick={toggleNavDrawer} className="block text-gray-600 hover:text-black">
              Women
            </Link>
            <Link to="/collections/top-wear" onClick={toggleNavDrawer} className="block text-gray-600 hover:text-black">
              Top Wear
            </Link>
            <Link to="/collections/bottom-wear" onClick={toggleNavDrawer} className="block text-gray-600 hover:text-black">
              Bottom Wear
            </Link>
            <Link to="/collections/custom" onClick={toggleNavDrawer} className="block text-gray-600 hover:text-black">
              Custom
            </Link>
            
            {/* Mobile Auth Buttons */}
            {user ? (
              <button 
                onClick={() => {
                  handleLogout();
                  toggleNavDrawer();
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-black w-full"
              >
                <FiLogOut className="h-5 w-5"/>
                <span>Logout</span>
              </button>
            ) : (
              <>
                <Link 
                  to="/login" 
                  onClick={toggleNavDrawer}
                  className="flex items-center space-x-2 text-gray-600 hover:text-black w-full"
                >
                  <FiLogIn className="h-5 w-5"/>
                  <span>Login</span>
                </Link>
                <Link 
                  to="/register" 
                  onClick={toggleNavDrawer}
                  className="block text-center bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Navbar;