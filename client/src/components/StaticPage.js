// client/src/components/StaticPage.js

import React from 'react';

const StaticPage = ({ title, children }) => (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container mx-auto px-6 py-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">{title}</h1>
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                {children}
            </div>
        </div>
    </div>
);

export default StaticPage;