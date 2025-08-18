import React from 'react';

const icons = {
  whatsapp: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.894 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.886-.001 2.267.651 4.383 1.803 6.123l-1.218 4.439 4.555-1.19z"/></svg>,
  linkedin: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>,
  facebook: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>,
  instagram: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>,
  mapPin: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>,
};

const COMPANY_NAME = "Exploration Himalayan";
const WHATSAPP_NUMBER = "7876234732";
const MAPS_URL = "https://maps.app.goo.gl/W1XRC4RpxGpkfgjd8";
const ADDRESS = "Plot no 508/1, Ward no 01, Pipty, Rampur Bushahr, Himachal Pradesh 172001";

const Footer = ({ setPage }) => (
    <footer className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white mt-auto">
        <div className="container mx-auto px-4 sm:px-6 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center sm:text-left">
                <div>
                    <h3 className="text-xl font-bold mb-4">Follow Us</h3>
                    <div className="flex space-x-4 justify-center sm:justify-start">
                        <a href="https://www.linkedin.com/company/exploration-himalayan/?originalSubdomain=in" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400">{icons.linkedin}</a>
                        <a href="https://www.facebook.com/ExHimalayan" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400">{icons.facebook}</a>
                        <a href="https://www.instagram.com/explorationhimalayan" target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400">{icons.instagram}</a>
                        <a href={`https://wa.me/${WHATSAPP_NUMBER}`} target="_blank" rel="noopener noreferrer" className="text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400"><span className="w-6 h-6 inline-block">{icons.whatsapp}</span></a>
                    </div>
                </div>
                <div>
                    <h3 className="text-xl font-bold mb-4">Contact Info</h3>
                    <p className="text-gray-600 dark:text-gray-400"><strong>Phone:</strong> 7876234732, 7807452411</p>
                    <p className="text-gray-600 dark:text-gray-400"><strong>Email:</strong> exploration.h@gmail.com</p>
                </div>
                {/* --- NEW Address Section --- */}
                <div className="sm:col-span-2 md:col-span-1">
                    <h3 className="text-xl font-bold mb-4">Our Location</h3>
                    <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 flex items-start justify-center sm:justify-start space-x-2">
                        <span className="flex-shrink-0 w-5 h-5 mt-1">{icons.mapPin}</span>
                        <span>{ADDRESS}</span>
                    </a>
                </div>
                 <div>
                    <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                    <ul className="space-y-2">
                        <li><a href="#" onClick={(e) => {e.preventDefault(); setPage({name: 'about'})}} className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400">About Us</a></li>
                        <li><a href="#" onClick={(e) => {e.preventDefault(); setPage({name: 'faq'})}} className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400">FAQs</a></li>
                        <li><a href="#" onClick={(e) => {e.preventDefault(); setPage({name: 'privacy'})}} className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400">Privacy Policy</a></li>
                        <li><a href="#" onClick={(e) => {e.preventDefault(); setPage({name: 'cancellation'})}} className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400">Cancellation Policy</a></li>
                        <li><a href="#" onClick={(e) => {e.preventDefault(); setPage({name: 'terms'})}} className="text-gray-600 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400">Terms & Conditions</a></li>
                    </ul>
                </div>
            </div>
            <div className="text-center text-gray-500 dark:text-gray-500 mt-10 border-t border-gray-200 dark:border-gray-700 pt-6">
                &copy; {new Date().getFullYear()} {COMPANY_NAME}. All rights reserved.
                <p className="text-xs mt-2">Powered by Blaze</p>
            </div>
        </div>
    </footer>
);

export default Footer;