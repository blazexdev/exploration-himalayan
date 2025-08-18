import React, { useState, useEffect, useRef, useMemo } from 'react';
import TrekCard from './TrekCard';

// --- FIX: Corrected the image URLs ---
const heroImages = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop',
  'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg',
  'https://images.pexels.com/photos/417074/pexels-photo-417074.jpeg',
  'https://images.unsplash.com/photo-1458442310124-dde6edb43d10?q=80&w=2070&auto=format&fit=crop',
  'https://images.pexels.com/photos/158063/bellingrath-gardens-alabama-landscape-scenic-158063.jpeg',
  'https://images.pexels.com/photos/388415/pexels-photo-388415.jpeg',
  'https://images.pexels.com/photos/2166711/pexels-photo-2166711.jpeg',
  'https://images.pexels.com/photos/167699/pexels-photo-167699.jpeg'
];

const HomePage = ({ treks, setPage }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const featuredSectionRef = useRef(null);
    const upcomingSectionRef = useRef(null);
    const [isFeaturedVisible, setIsFeaturedVisible] = useState(false);
    const [isUpcomingVisible, setIsUpcomingVisible] = useState(false);

    const featuredTreks = useMemo(() => treks.filter(t => t.isFeatured).slice(0, 3), [treks]);
    const upcomingTreks = useMemo(() => treks.filter(t => t.isUpcoming).slice(0, 3), [treks]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
        }, 5000);
        return () => clearTimeout(timer);
    }, [currentImageIndex]);
    
    useEffect(() => {
        const observerOptions = { threshold: 0.1 };
        const featuredObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsFeaturedVisible(true);
                if(featuredSectionRef.current) featuredObserver.unobserve(featuredSectionRef.current);
            }
        }, observerOptions);
        const upcomingObserver = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsUpcomingVisible(true);
                if(upcomingSectionRef.current) upcomingObserver.unobserve(upcomingSectionRef.current);
            }
        }, observerOptions);

        if (featuredSectionRef.current) featuredObserver.observe(featuredSectionRef.current);
        if (upcomingSectionRef.current) upcomingObserver.observe(upcomingSectionRef.current);

        return () => { 
            if (featuredSectionRef.current) featuredObserver.unobserve(featuredSectionRef.current);
            if (upcomingSectionRef.current) upcomingObserver.unobserve(upcomingSectionRef.current);
        };
    }, []);

    return (
        <div>
            <section className="relative h-[60vh] text-white bg-gray-800">
                {heroImages.map((src, index) => (
                    <div
                        key={src}
                        className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 z-0"
                        style={{ 
                            backgroundImage: `url(${src})`,
                            opacity: index === currentImageIndex ? 1 : 0,
                        }}
                    />
                ))}
                <div className="absolute inset-0 bg-black opacity-60 z-10"></div>
                <div className="container mx-auto px-4 sm:px-6 h-full flex flex-col justify-center items-center text-center relative z-20">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight mb-4 animate-pulse-glow">Discover Your Next Adventure</h1>
                    <p className="text-md sm:text-lg md:text-xl max-w-3xl">Explore the world's most breathtaking trails with our expert-guided treks.</p>
                </div>
            </section>

            <section ref={upcomingSectionRef} className={`relative py-12 md:py-16 bg-gray-50 dark:bg-gray-900 transition-opacity duration-1000 ${isUpcomingVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-teal-500/30 shadow-[0_-2px_15px_rgba(13,148,136,0.5)]"></div>
                <div className="container mx-auto px-4 sm:px-6 pt-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">Upcoming Treks</h2>
                    {upcomingTreks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {upcomingTreks.map(trek => (
                                <TrekCard key={trek._id} trek={trek} onSelect={(id) => setPage({ name: 'details', trekId: id })} />
                            ))}
                        </div>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">Stay tuned for our next adventures!</p>
                    )}
                </div>
            </section>
            
            <section ref={featuredSectionRef} className={`relative py-12 md:py-16 bg-white dark:bg-gray-800 transition-opacity duration-1000 ${isFeaturedVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="absolute top-0 left-0 w-full h-1 bg-teal-500/30 shadow-[0_-2px_15px_rgba(13,148,136,0.5)]"></div>
                <div className="container mx-auto px-4 sm:px-6 pt-12">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12">Featured Treks</h2>
                    {featuredTreks.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredTreks.map(trek => (
                                <TrekCard key={trek._id} trek={trek} onSelect={(id) => setPage({ name: 'details', trekId: id })} />
                            ))}
                        </div>
                    ) : (
                         <p className="text-center text-gray-500 dark:text-gray-400">No featured treks available at the moment.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default HomePage;