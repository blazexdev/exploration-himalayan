import React, { useState } from 'react';
import NotificationBell from './NotificationBell';

const icons = {
  sun: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  moon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  menu: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  close: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
};

const COMPANY_NAME = "Exploration Himalayan";
const LOGO_URL = "https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png";

const Header = ({ setPage, onContactClick, currentUser, onLogout, theme, toggleTheme, notifications, onNotificationUpdate }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLinkClick = (pageName) => {
        setPage({ name: pageName });
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-30">
            {/* --- THIS IS THE FIX: Added `relative` to make it the positioning context --- */}
            <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center relative">
                <div className="flex items-center cursor-pointer" onClick={() => handleLinkClick('home')}>
                    <img src={LOGO_URL} alt={`${COMPANY_NAME} Logo`} className="h-12 sm:h-14 mr-2 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    <span className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white hidden sm:block">{COMPANY_NAME}</span>
                </div>

                <div className="hidden md:flex space-x-6 items-center">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Home</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('treks'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Treks</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('upcoming'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Upcoming</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('shop'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Shop</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); onContactClick(); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Contact</a>
                    {currentUser ? (
                        <>
                            {currentUser.isAdmin && (
                                <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('admin'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Admin</a>
                            )}
                            <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('dashboard'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Dashboard</a>
                            <button onClick={onLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300">Logout</button>
                            <NotificationBell notifications={notifications} onNotificationUpdate={onNotificationUpdate} setPage={setPage} />
                        </>
                    ) : (
                        <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('signup'); }} className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition duration-300">Sign Up</a>
                    )}
                    <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 p-2 rounded-full">
                        {theme === 'dark' ? icons.sun : icons.moon}
                    </button>
                </div>

                <div className="md:hidden flex items-center">
                     {currentUser && <NotificationBell notifications={notifications} onNotificationUpdate={onNotificationUpdate} setPage={setPage} />}
                    <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 p-2 rounded-full mr-2">
                        {theme === 'dark' ? icons.sun : icons.moon}
                    </button>
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-800 dark:text-white">
                        {isMobileMenuOpen ? icons.close : icons.menu}
                    </button>
                </div>
            </nav>

            {isMobileMenuOpen && (
                <div className="md:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg absolute top-full left-0 w-full shadow-lg">
                    <div className="flex flex-col items-center space-y-4 py-6">
                        <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }} className="text-gray-800 dark:text-white text-lg">Home</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('treks'); }} className="text-gray-800 dark:text-white text-lg">Treks</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('upcoming'); }} className="text-gray-800 dark:text-white text-lg">Upcoming</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('shop'); }} className="text-gray-800 dark:text-white text-lg">Shop</a>
                        <a href="#" onClick={(e) => { e.preventDefault(); onContactClick(); setIsMobileMenuOpen(false); }} className="text-gray-800 dark:text-white text-lg">Contact</a>
                        <div className="w-full border-t border-gray-200 dark:border-gray-700 my-2"></div>
                        {currentUser ? (
                            <>
                                {currentUser.isAdmin && (
                                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('admin'); }} className="text-gray-800 dark:text-white text-lg">Admin</a>
                                )}
                                <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('dashboard'); }} className="text-gray-800 dark:text-white text-lg">Dashboard</a>
                                <button onClick={() => { onLogout(); setIsMobileMenuOpen(false); }} className="w-3/4 bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300">Logout</button>
                            </>
                        ) : (
                            <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('signup'); }} className="w-3/4 text-center bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition duration-300">Sign Up</a>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
