import React, { useState, useMemo } from 'react';
import ProductCard from './ProductCard';

const ShopPage = ({ products, setPage }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name-asc');

    const filteredAndSortedProducts = useMemo(() => {
        return products
            .filter(product =>
                product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                product.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
            .sort((a, b) => {
                switch (sortBy) {
                    case 'price-asc':
                        return a.price - b.price;
                    case 'price-desc':
                        return b.price - a.price;
                    case 'name-desc':
                        return b.name.localeCompare(a.name);
                    case 'name-asc':
                    default:
                        return a.name.localeCompare(b.name);
                }
            });
    }, [products, searchTerm, sortBy]);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <section className="py-16 container mx-auto px-4 sm:px-6">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">Our Shop</h1>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-12">Gear up for your next adventure with our curated collection of trekking essentials.</p>
                
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <input 
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500"
                    />
                    <select 
                        value={sortBy} 
                        onChange={(e) => setSortBy(e.target.value)} 
                        className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500"
                    >
                        <option value="name-asc">Sort by Name (A-Z)</option>
                        <option value="name-desc">Sort by Name (Z-A)</option>
                        <option value="price-asc">Sort by Price (Low-High)</option>
                        <option value="price-desc">Sort by Price (High-Low)</option>
                    </select>
                </div>

                {filteredAndSortedProducts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {filteredAndSortedProducts.map(product => (
                            <ProductCard key={product._id} product={product} onSelect={(id) => setPage({ name: 'productDetails', productId: id })} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-16">No products found matching your criteria.</p>
                )}
            </section>
        </div>
    );
};

export default ShopPage;