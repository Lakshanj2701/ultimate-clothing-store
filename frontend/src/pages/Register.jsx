import React, { useState } from 'react';
import register from "../assets/register.webp";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(""); // Clear any previous errors
        setIsLoading(true);

        try {
            // Send user registration data to backend API
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/register`, 
                { name, email, password }
            );

            // If registration is successful, show a success message and redirect
            if (response.status === 201) {
                toast.success("Registration successful! Redirecting to login...");//email validation
                setTimeout(() => navigate('/login'), 3000); // Redirect after 3 seconds
            }
        } catch (error) {
            if (error.response?.status === 400 && error.response?.data?.message === "User already exists") {
                toast.error("This email is already registered. Please use a different email.");// Email validation error
            } else {
                toast.error("Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex">
            {/* Toast Container */}
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />

            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
                <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm">
                    <div className="flex justify-center mb-6">
                        <h2 className="text-xl font-medium">Ultimate Clothing</h2>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Hey There!</h2>
                    <p className="text-center mb-6">Enter your details to register</p>
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter your name"
                            required
                        />
                    </div>
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
                        {isLoading ? 'Please wait...' : 'Sign Up'}
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