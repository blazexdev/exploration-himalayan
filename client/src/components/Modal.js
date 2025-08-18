import React from 'react';

const Modal = ({ isOpen, onClose, children, size = 'md' }) => {
    if (!isOpen) return null;

    // Defines different size options for the modal
    const sizeClasses = {
        md: 'max-w-md p-8',
        lg: 'max-w-lg p-8',
        '2xl': 'max-w-2xl p-8',
        '4xl': 'max-w-4xl p-2', // Less padding for large images
        '6xl': 'max-w-6xl p-2', // Less padding for large images
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 animate-fade-in" onClick={onClose}>
            <div 
                className={`bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl w-full relative transform transition-all duration-300 ${sizeClasses[size]}`}
                onClick={(e) => e.stopPropagation()} // Prevents modal from closing when clicking inside
            >
                {/* The close button is now styled to sit just outside the content area for better UX */}
                <button 
                    onClick={onClose} 
                    className="absolute -top-3 -right-3 bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full h-9 w-9 flex items-center justify-center text-2xl z-10 border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    aria-label="Close modal"
                >
                    &times;
                </button>
                {children}
            </div>
        </div>
    );
};

export default Modal;