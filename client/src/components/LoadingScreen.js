// client/src/components/LoadingScreen.js

import React from 'react';

const LOGO_URL = "https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png";

const LoadingScreen = () => (
    <div className="fixed inset-0 bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center z-50">
        <img src={LOGO_URL} alt="Loading Logo" className="h-24 animate-pulse" />
        <p className="text-gray-800 dark:text-white mt-4 text-lg">Loading Adventure...</p>
    </div>
);

export default LoadingScreen;