import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import login from "../assets/login.webp";
import axios from 'axios';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);
        console.log("hirrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
        try {
            console.log("hirrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr")
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/login`, 
                { email, password }
            );
            
            const { user, token } = response.data;
            
            // Store token and user data in localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            
            // Check if user is admin and redirect accordingly
            if (user.role === 'admin') {
                // Redirect to admin dashboard
                navigate('/admin');
            } else {
                // Redirect regular users to homepage
                navigate('/');
            }
            
        } catch (error) {
            setError(
                error.response?.data?.message || 
                "Login failed. Please check your credentials."
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex">
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
                <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm">
                    <div className="flex justify-center mb-6">
                        <h2 className="text-xl font-medium">Ultimate Clothing</h2>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Hey There!</h2>
                    <p className="text-center mb-6">Enter your Username and password to Login</p>
                    
                    {error && (
                        <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter your email address"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                    
                    <p className="mt-6 text-center text-sm">
                        Don't have an account?{" "}
                        <Link to="/register" className="text-blue-500">
                            Register
                        </Link>
                    </p>
                    <p className="mt-6 text-center text-sm">
                    Fogot Password?{" "}
                    <Link to="/PasswordReset" className="text-blue-500">
                        Recover
                    </Link>
                    </p>
                </form>
            </div>

            <div className="hidden md:block w-1/2 bg-gray-800">
                <div className="h-full flex flex-col justify-center items-center">
                    <img src={login} alt="Login to Account" className="h-[750px] w-full object-cover" />
                </div>
            </div>
        </div>
    );
};

export default Login;