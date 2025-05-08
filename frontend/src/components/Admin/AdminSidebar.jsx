import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import { 
  FaBoxOpen, 
  FaClipboardList, 
  FaSignOutAlt, 
  FaStore, 
  FaUser,
  FaMoneyBillWave,
  FaTags
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Clear client-side authentication data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      sessionStorage.removeItem('token'); // If using sessionStorage
      
      // Show success message
      toast.success('Logged out successfully');
      
      // Redirect to login page
      navigate('/login');
      
      // Refresh to ensure all state is cleared
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-800 text-white h-full flex flex-col">
      <div className="mb-6">
        <Link to="/admin" className="text-2xl font-medium flex items-center">
          <FaStore className="mr-2" />
          Ultimate Clothing Admin
        </Link>
      </div>
      
      <h2 className="text-xl font-medium mb-6 text-center border-b pb-2">
        Admin Dashboard
      </h2>

      <nav className="flex flex-col space-y-2 flex-grow">
        <NavLink
          to="/admin/users"
          className={({ isActive }) =>
            isActive
              ? "bg-blue-600 text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
              : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
          }
        >
          <FaUser />
          <span>Users</span>
        </NavLink>

        <NavLink
          to="/admin/products"
          className={({ isActive }) =>
            isActive
              ? "bg-blue-600 text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
              : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
          }
        >
          <FaBoxOpen />
          <span>Products</span>
        </NavLink>

        <NavLink
          to="/admin/orders"
          className={({ isActive }) =>
            isActive
              ? "bg-blue-600 text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
              : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
          }
        >
          <FaClipboardList />
          <span>Orders</span>
        </NavLink>

        <NavLink
          to="/admin/finance"
          className={({ isActive }) =>
            isActive
              ? "bg-blue-600 text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
              : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
          }
        >
          <FaMoneyBillWave />
          <span>Finance</span>
        </NavLink>

        <NavLink
          to="/admin/discounts"
          className={({ isActive }) =>
            isActive
              ? "bg-blue-600 text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
              : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
          }
        >
          <FaTags />
          <span>Discounts</span>
        </NavLink>

        {/* Link to Return/Refund Requests page */}
        <NavLink
          to="/admin/return-refund"
          className={({ isActive }) =>
            isActive
              ? "bg-blue-600 text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
              : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
          }
        >
          <FaClipboardList />
          <span>Return/Refund Requests</span>
        </NavLink>

        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive
              ? "bg-blue-600 text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
              : "text-gray-300 hover:bg-gray-700 hover:text-white py-3 px-4 rounded flex items-center space-x-2 transition-colors"
          }
        >
          <FaStore />
          <span>Visit Shop</span>
        </NavLink>
      </nav>

      <div className="mt-auto">
        <button 
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded flex items-center justify-center space-x-2 transition-colors"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
