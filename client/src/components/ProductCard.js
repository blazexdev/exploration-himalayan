import React from 'react';

const ProductCard = ({ product, onSelect }) => {
    return (
        <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 group border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-2xl hover:shadow-teal-500/40 hover:-translate-y-2"
            onClick={() => onSelect(product._id)}
        >
            <div className="relative">
                <img src={product.imageUrl} alt={product.name} className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white truncate">{product.name}</h3>
                <p className="text-2xl font-bold text-teal-500 dark:text-teal-400 mt-2">₹{product.price.toLocaleString('en-IN')}</p>
            </div>
        </div>
    );
};

export default ProductCard;