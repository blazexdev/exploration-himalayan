import React, { useState, useEffect, useRef } from 'react';

const icons = {
    location: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
};

const TrekCard = ({ trek, onSelect }) => {
    const cardRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(cardRef.current);
                }
            },
            { threshold: 0.1 }
        );

        if (cardRef.current) observer.observe(cardRef.current);
        return () => { if (cardRef.current) observer.unobserve(cardRef.current); };
    }, []);

    return (
        <div 
            ref={cardRef} 
            // --- FIX: Added hover glow effect ---
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform transition-all duration-700 group border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-2xl hover:shadow-teal-500/40 hover:-translate-y-2 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
            onClick={() => onSelect(trek._id)}
        >
            <div className="relative">
                <img src={trek.imageUrl} alt={trek.name} className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute top-0 right-0 bg-teal-500 text-white px-3 py-1 m-4 rounded-full text-sm font-semibold">{trek.difficulty}</div>
                
                <div className="absolute top-4 left-4 flex flex-col space-y-2">
                    {trek.isFeatured && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full text-center shadow-md">Featured</span>
                    )}
                    {trek.isUpcoming && (
                        <span className="text-xs bg-purple-500 text-white px-2 py-1 rounded-full text-center shadow-md">Upcoming</span>
                    )}
                </div>
            </div>
            <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{trek.name}</h3>
                <div className="flex items-center text-gray-500 dark:text-gray-400 mb-4">
                    <span className="inline-block w-5 h-5 mr-2">{icons.location}</span>
                    <span>{trek.location}</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">{trek.description}</p>
                <div className="flex justify-between items-center">
                    <span className="text-3xl font-bold text-teal-500 dark:text-teal-400">₹{trek.price.toLocaleString('en-IN')}</span>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect(trek._id);
                        }} 
                        className="bg-teal-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-teal-600 transition duration-300 z-10 relative"
                    >
                        View Details
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrekCard;