import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import login from "../assets/login.webp";

const PasswordReset = () => {
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const navigate = useNavigate();

    const handleLogout = () => {
        navigate("/login");
    };

    const handleSendOtp = (e) => {
        e.preventDefault();
        console.log("OTP sent to:", recoveryEmail);
        setOtpSent(true); // Show OTP input after sending OTP
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        console.log("OTP verified:", otp);
        setOtpVerified(true); // Show password reset inputs
    };

    const handleConfirmPassword = (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        console.log("Password reset successful!");
    };

    return (
        <div className="flex">
            <div className="w-full md:w-1/2 flex flex-col justify-center items-center p-8 md:p-12">
                <form onSubmit={!otpSent ? handleSendOtp : !otpVerified ? handleVerifyOtp : handleConfirmPassword} className="w-full max-w-md bg-white p-8 rounded-lg border shadow-sm">
                    <div className="flex justify-center mb-6">
                        <h2 className="text-xl font-medium">Ultimate Clothing</h2>
                    </div>
                    <h2 className="text-2xl font-bold text-center mb-6">Password Reset</h2>
                    
                    {!otpSent ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">Email</label>
                                <input type="email" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter your email address" required />
                            </div>
                            <button type="submit" className="w-full bg-black text-white p-2 rounded-lg font-semibold hover:bg-gray-800 transition">
                                Send OTP
                            </button>
                        </>
                    ) : !otpVerified ? (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">Enter OTP</label>
                                <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Enter OTP" required />
                            </div>
                            <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded-lg font-semibold hover:bg-blue-700 transition">
                                Reset My Password
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">Enter Your New Password</label>
                                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="New Password" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">Confirm Password</label>
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    placeholder="Confirm Password" required />
                            </div>
                            <button onClick={handleLogout} 
                            type="submit" className="w-full bg-green-600 text-white p-2 rounded-lg font-semibold hover:bg-green-700 transition">
                                <span>Confirm</span>
                            </button>
                        </>
                    )}
                </form>
            </div>
            <div className="hidden md:block w-1/2 bg-gray-800">
                <div className="h-full flex flex-col justify-center items-center">
                    <img src={login} alt="Register to Account" className="h-[750px] w-full object-cover" />
                </div>
            </div>
        </div>
    );
};

export default PasswordReset;