import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'sonner';
import forgotPasswordImg from "../../assets/login.webp";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/forgot-password`, 
                { email }
            );
            
            toast.success(response.data.message);
            setMessage("Password reset link sent to your email. Please check your inbox.");
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || "Failed to send reset link");
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
                    <h2 className="text-2xl font-bold text-center mb-6">Forgot Password?</h2>
                    <p className="text-center mb-6">Enter your email to reset your password</p>
                    
                    {message && (
                        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                            {message}
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
                    
                    <button 
                        type="submit" 
                        className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                    
                    <p className="mt-6 text-center text-sm">
                        Remember your password?{" "}
                        <Link to="/login" className="text-blue-500">
                            Login
                        </Link>
                    </p>
                </form>
            </div>

            <div className="hidden md:block w-1/2 bg-gray-800">
                <div className="h-full flex flex-col justify-center items-center">
                    <img src={forgotPasswordImg} alt="Forgot Password" className="h-[750px] w-full object-cover" />
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;