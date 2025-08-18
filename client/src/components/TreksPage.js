import React, { useState, useMemo } from 'react';
import TrekCard from './TrekCard';

const TreksPage = ({ treks, setPage, isUpcomingPage = false }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name-asc');
    const [filter, setFilter] = useState(isUpcomingPage ? 'upcoming' : 'all');

    const filteredAndSortedTreks = useMemo(() => {
        return treks
            .filter(trek => {
                const searchMatch = trek.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                   trek.location.toLowerCase().includes(searchTerm.toLowerCase());
                
                if (filter === 'all') return searchMatch;
                if (filter === 'featured') return searchMatch && trek.isFeatured;
                if (filter === 'upcoming') return searchMatch && trek.isUpcoming;
                return searchMatch;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'price-asc': return a.price - b.price;
                    case 'price-desc': return b.price - a.price;
                    case 'name-desc': return b.name.localeCompare(a.name);
                    case 'name-asc':
                    default:
                        return a.name.localeCompare(b.name);
                }
            });
    }, [treks, searchTerm, sortBy, filter]);

    return (
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
            <section className="py-16 container mx-auto px-4 sm:px-6">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 text-center">
                    {isUpcomingPage ? 'Upcoming Treks' : 'All Treks'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-8">
                    {isUpcomingPage ? 'Get ready for our next big adventures!' : 'Find your perfect adventure from our complete collection.'}
                </p>
                
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <input 
                        type="text"
                        placeholder="Search by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-1/3 p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500"
                    />
                    {!isUpcomingPage && (
                        <div className="flex items-center space-x-2 rounded-lg bg-gray-200 dark:bg-gray-700 p-1">
                            <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded-md transition ${filter === 'all' ? 'bg-teal-500 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}>All</button>
                            <button onClick={() => setFilter('featured')} className={`px-3 py-1 rounded-md transition ${filter === 'featured' ? 'bg-teal-500 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Featured</button>
                            <button onClick={() => setFilter('upcoming')} className={`px-3 py-1 rounded-md transition ${filter === 'upcoming' ? 'bg-teal-500 text-white' : 'hover:bg-gray-300 dark:hover:bg-gray-600'}`}>Upcoming</button>
                        </div>
                    )}
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="p-3 border rounded-lg bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:ring-teal-500 focus:border-teal-500">
                        <option value="name-asc">Sort by Name (A-Z)</option>
                        <option value="name-desc">Sort by Name (Z-A)</option>
                        <option value="price-asc">Sort by Price (Low-High)</option>
                        <option value="price-desc">Sort by Price (High-Low)</option>
                    </select>
                </div>

                {filteredAndSortedTreks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAndSortedTreks.map(trek => (
                            <TrekCard key={trek._id} trek={trek} onSelect={(id) => setPage({ name: 'details', trekId: id })} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 dark:text-gray-400 mt-16">No treks found matching your criteria.</p>
                )}
            </section>
        </div>
    );
};

export default TreksPage;