import React from 'react';

const SearchInput = ({ searchTerm, onSearchChange, placeholder }) => {
    return (
        <div className="mb-4">
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={placeholder || "Search..."}
                className="w-full max-w-xs p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500"
            />
        </div>
    );
};

export default SearchInput;