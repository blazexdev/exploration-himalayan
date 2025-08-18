import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AuthPage = ({ title, onLogin, onSignup, onLoginWithOtp, onGoogleSignIn, isLogin, setPage, initialState }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const [signupStep, setSignupStep] = useState(1);
    const [loginMethod, setLoginMethod] = useState('password');
    const [loginStep, setLoginStep] = useState(1);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [authFlow, setAuthFlow] = useState(initialState || (isLogin ? 'login' : 'signup'));
    const [resetStep, setResetStep] = useState(1);

    useEffect(() => {
        const handleGoogleResponse = async (response) => {
            setIsLoading(true);
            await onGoogleSignIn(response.credential);
            setIsLoading(false);
        };

        if (window.google) {
            window.google.accounts.id.initialize({
                // --- FIX: Using the environment variable ---
                client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID, 
                callback: handleGoogleResponse,
            });
            window.google.accounts.id.renderButton(
                document.getElementById("googleSignInButton"),
                { theme: "outline", size: "large", width: "100%" }
            );
        }
    }, [onGoogleSignIn]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const startCooldown = () => setResendCooldown(60);

    const handleResendOtp = async () => {
        if (resendCooldown > 0) return;
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const res = authFlow === 'forgotPassword' 
                ? await api.forgotPassword(email)
                : (isLogin ? await api.requestLoginOtp(email) : await api.requestSignupOtp(email));
            
            if (res.data.success) {
                setMessage(res.data.message);
                startCooldown();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignupRequest = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setIsLoading(true);
        try {
            const res = await api.requestSignupOtp(email);
            if (res.data.success) {
                setMessage(res.data.message);
                setSignupStep(2);
                startCooldown();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpVerification = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        const response = await onSignup({ name, email, password, otp }); 
        if (!response.success) {
            setError(response.message);
        }
        setIsLoading(false);
    };

    const handleLoginRequest = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        const response = await onLogin(email, password);
        if (!response.success) {
            setError(response.message);
        }
        setIsLoading(false);
    };

    const handleLoginOtpRequest = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const res = await api.requestLoginOtp(email);
            if (res.data.success) {
                setMessage(res.data.message);
                setLoginStep(2);
                startCooldown();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoginOtpVerification = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        const response = await onLoginWithOtp({ email, otp });
        if (!response.success) {
            setError(response.message);
        }
        setIsLoading(false);
    };

    const handleForgotPasswordRequest = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);
        try {
            const res = await api.forgotPassword(email);
            if (res.data.success) {
                setMessage(res.data.message);
                setResetStep(2);
                startCooldown();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (password !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }
        setIsLoading(true);
        try {
            const res = await api.resetPassword({ email, otp, newPassword: password });
            if (res.data.success) {
                setMessage(res.data.message);
                setAuthFlow('login');
                setLoginMethod('password');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const ResendButton = () => (
        <div className="text-center text-sm">
            {resendCooldown > 0 ? (
                <p className="text-gray-500">Resend OTP in {resendCooldown}s</p>
            ) : (
                <button type="button" onClick={handleResendOtp} disabled={isLoading} className="text-teal-500 hover:underline disabled:opacity-50">
                    {isLoading ? 'Sending...' : 'Resend OTP'}
                </button>
            )}
        </div>
    );

    const renderContent = () => {
        if (authFlow === 'forgotPassword') {
            return (
                <>
                    {resetStep === 1 && (
                        <form onSubmit={handleForgotPasswordRequest} className="space-y-6">
                            <p className="text-center text-gray-600 dark:text-gray-400">Enter your email to receive a password reset code.</p>
                            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                            <button type="submit" disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">{isLoading ? 'Sending...' : 'Send Reset OTP'}</button>
                            <button type="button" onClick={() => setAuthFlow('login')} className="w-full text-center text-sm text-gray-500 hover:underline">Back to Login</button>
                        </form>
                    )}
                    {resetStep === 2 && (
                        <form onSubmit={handleResetPassword} className="space-y-6">
                            <p className="text-center text-gray-600 dark:text-gray-400">An OTP has been sent to {email}.</p>
                            <input type="text" placeholder="Enter 6-Digit OTP" value={otp} onChange={e => setOtp(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-center tracking-[1em]" maxLength="6" required />
                            <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                            <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                            <ResendButton />
                            <button type="submit" disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">{isLoading ? 'Resetting...' : 'Reset Password'}</button>
                            <button type="button" onClick={() => setResetStep(1)} className="w-full text-center text-sm text-gray-500 hover:underline">Back to email</button>
                        </form>
                    )}
                </>
            );
        }
        if (isLogin) {
            return (
                <>
                    {loginMethod === 'password' && (
                        <form onSubmit={handleLoginRequest} className="space-y-6">
                            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                            <button type="submit" disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">{isLoading ? 'Logging in...' : 'Login'}</button>
                            <div className="flex justify-between text-sm">
                                <button type="button" onClick={() => setLoginMethod('otp')} className="text-gray-500 hover:underline">Login with OTP</button>
                                <button type="button" onClick={() => setAuthFlow('forgotPassword')} className="text-gray-500 hover:underline">Forgot password?</button>
                            </div>
                        </form>
                    )}
                    {loginMethod === 'otp' && loginStep === 1 && (
                        <form onSubmit={handleLoginOtpRequest} className="space-y-6">
                            <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                            <button type="submit" disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">{isLoading ? 'Sending OTP...' : 'Send OTP'}</button>
                            <button type="button" onClick={() => setLoginMethod('password')} className="w-full text-center text-sm text-gray-500 hover:underline">Login with Password</button>
                        </form>
                    )}
                    {loginMethod === 'otp' && loginStep === 2 && (
                        <form onSubmit={handleLoginOtpVerification} className="space-y-6">
                            <p className="text-center text-gray-600 dark:text-gray-400">An OTP has been sent to {email}.</p>
                            <input type="text" placeholder="Enter 6-Digit OTP" value={otp} onChange={e => setOtp(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-center tracking-[1em]" maxLength="6" required />
                            <ResendButton />
                            <button type="submit" disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">{isLoading ? 'Verifying...' : 'Verify & Login'}</button>
                            <button type="button" onClick={() => setLoginStep(1)} className="w-full text-center text-sm text-gray-500 hover:underline">Back to email</button>
                        </form>
                    )}
                </>
            );
        }
        // Signup Flow
        return (
            <>
                {signupStep === 1 && (
                    <form onSubmit={handleSignupRequest} className="space-y-6">
                        <input type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700" required />
                        <button type="submit" disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">{isLoading ? 'Sending OTP...' : 'Get OTP'}</button>
                    </form>
                )}
                {signupStep === 2 && (
                    <form onSubmit={handleOtpVerification} className="space-y-6">
                        <p className="text-center text-gray-600 dark:text-gray-400">An OTP has been sent to {email}.</p>
                        <input type="text" placeholder="Enter 6-Digit OTP" value={otp} onChange={e => setOtp(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 text-center tracking-[1em]" maxLength="6" required />
                        <ResendButton />
                        <button type="submit" disabled={isLoading} className="w-full bg-teal-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-600 disabled:opacity-50">{isLoading ? 'Verifying...' : 'Verify & Sign Up'}</button>
                        <button type="button" onClick={() => setSignupStep(1)} className="w-full text-center text-sm text-gray-500 hover:underline">Back to details</button>
                    </form>
                )}
            </>
        );
    };

    return (
        <div className="container mx-auto px-6 py-16 flex justify-center items-center">
            <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <h1 className="text-3xl font-bold text-center mb-6">{title}</h1>
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                {message && <p className="text-green-500 text-sm text-center mb-4">{message}</p>}
                
                {renderContent()}

                <div className="relative flex py-5 items-center">
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 dark:text-gray-500">OR</span>
                    <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div id="googleSignInButton" className="flex justify-center"></div>

                <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <a href="#" onClick={(e) => { e.preventDefault(); setPage({ name: isLogin ? 'signup' : 'login' }); }} className="text-teal-500 hover:underline">
                        {isLogin ? "Sign Up" : "Login"}
                    </a>
                </p>
            </div>
        </div>
    );
};

export default AuthPage;