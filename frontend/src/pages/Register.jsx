import React, { useState } from 'react';
import register from "../assets/register.webp";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import { useCart } from '../components/Cart/CartContext';
import api from '../services/api';

const Register = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] =useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const { mergeCarts } = useCart();
    const navigate = useNavigate();

const handleSubmit = async(e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
        const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/users/register`, 
            { name, email, password }
        );
        
        if(response.status === 201 || response.status === 200){
            const { user, token } = response.data;
            
                // Store token and user data (auto-login after registration)
                if (token && user) {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    
                    // Set authorization header for API calls
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    
                    // Dispatch custom event to notify AuthContext of state change
                    window.dispatchEvent(new Event('authStateChange'));
                    
                    // Merge guest cart with user cart after registration
                const guestId = localStorage.getItem('guestId');
                if (guestId) {
                    await mergeCarts(guestId);
                }
                
                toast.success(`Welcome, ${user.name}! Account created successfully.`);
                
                // Check if user intended to checkout
                const checkoutIntent = localStorage.getItem('checkoutIntent');
                localStorage.removeItem('checkoutIntent');
                
                // Redirect to checkout if that was the intent, otherwise to home
                if (checkoutIntent === 'true') {
                    navigate('/checkout');
                } else {
                    navigate('/');
                }
            } else {
                // If no token, redirect to login (preserve checkout intent)
                toast.success('Registration successful! Please login.');
                navigate('/login');
            }
        }
    } catch (error) {
        setError(
            error.response?.data?.message || 
            "Registration failed. Please try again."
        );
        toast.error(error.response?.data?.message || "Registration failed. User may already exist.");
    } finally {
        setIsLoading(false);
    }
}


  return (
    <div className="flex">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
            <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm">
                <div className="flex justify-center mb-6">
                    <h2 className="text-xl font-medium">Ultimate Clothing</h2>
                </div>
                <h2 className="text-2xl font-bold text-center mb-6">Hey There!</h2>
                <p className="text-center mb-6">Enter your Details and Register
                </p>
                
                {error && (
                    <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                        {error}
                    </div>
                )}
                
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Name</label>
                    <input type="name" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter your Name"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter your email address"
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter your password"
                    />
                </div>
                <button type="submit" className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition">
                   {isLoading ? 'Wait...' : 'Sign Up'}
                </button>
                <p className="mt-6 text-center text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-blue-500">
                        Login
                    </Link>
                </p>
            </form>
        </div>

        <div className="hidden md:block w-1/2 bg-gray-800">
            <div className="h-full flex flex-col justify-center items-center">
                <img src={register} alt="Register to Account" className="h-[750px] w-full object-cover" />
            </div>
        </div>
    </div>
  );
};

export default Register;