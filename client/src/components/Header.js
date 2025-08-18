import React, { useState } from 'react';

const icons = {
  home: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>,
  contact: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>,
  treks: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>,
  upcoming: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>,
  user: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>,
  dashboard: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9"></rect><rect x="14" y="3" width="7" height="5"></rect><rect x="14" y="12" width="7" height="9"></rect><rect x="3" y="16" width="7" height="5"></rect></svg>,
  logout: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>,
  admin: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  sun: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>,
  moon: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>,
  menu: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  close: <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
};

const COMPANY_NAME = "Exploration Himalayan";
const LOGO_URL = "https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png";

const Header = ({ setPage, currentUser, onLogout, theme, toggleTheme }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLinkClick = (pageName) => {
        setPage({ name: pageName });
        setIsMobileMenuOpen(false);
    };

    return (
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-30">
            <nav className="container mx-auto px-4 sm:px-6 py-3 flex justify-between items-center">
                <div className="flex items-center cursor-pointer" onClick={() => handleLinkClick('home')}>
                    <img src={LOGO_URL} alt={`${COMPANY_NAME} Logo`} className="h-12 sm:h-14 mr-2 filter drop-shadow-[0_0_8px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                    <span className="text-lg sm:text-xl font-bold text-gray-800 dark:text-white hidden sm:block">{COMPANY_NAME}</span>
                </div>

                <div className="hidden md:flex space-x-6 items-center">
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('home'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Home</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('treks'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Treks</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('upcoming'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Upcoming</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('shop'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Shop</a>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('contact'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Contact</a>
                    {currentUser ? (
                        <>
                            {currentUser.isAdmin && (
                                <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('admin'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Admin</a>
                            )}
                            <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('dashboard'); }} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 transition duration-300">Dashboard</a>
                            <button onClick={onLogout} className="bg-red-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-600 transition duration-300">Logout</button>
                        </>
                    ) : (
                        <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('signup'); }} className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition duration-300">Sign Up</a>
                    )}
                    <button onClick={toggleTheme} className="text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 p-2 rounded-full">
                        {theme === 'dark' ? icons.sun : icons.moon}
                    </button>
                </div>

                <div className="md:hidden flex items-center">
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
                        <a href="#" onClick={(e) => { e.preventDefault(); handleLinkClick('contact'); }} className="text-gray-800 dark:text-white text-lg">Contact</a>
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