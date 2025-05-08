import React, { useState } from 'react';
import { useParams, useNavigate, Link } from "react-router-dom"; // Added Link import
import axios from 'axios';
import { toast } from 'sonner';
import resetPasswordImg from "../../assets/login.webp";

const ResetPassword = () => {
    const { token } = useParams();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            toast.error("Passwords don't match");
            return;
        }
        
        setIsLoading(true);
        setMessage("");
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND_URL}/api/users/reset-password/${token}`, 
                { password }
            );
            
            toast.success(response.data.message);
            setMessage("Password reset successfully. You can now login with your new password.");
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            console.error('Error:', error);
            toast.error(error.response?.data?.message || "Failed to reset password");
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
                    <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
                    <p className="text-center mb-6">Enter your new password</p>
                    
                    {message && (
                        <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
                            {message}
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">New Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Enter new password"
                            required
                            minLength="6"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            placeholder="Confirm new password"
                            required
                            minLength="6"
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
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
                    <img src={resetPasswordImg} alt="Reset Password" className="h-[750px] w-full object-cover" />
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;