import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';

const icons = {
    bell: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
};

const NotificationBell = ({ notifications, onNotificationUpdate, setPage }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleNotificationClick = async (notification) => {
        setPage({ name: notification.link.substring(1) }); // Navigate to page
        if (!notification.isRead) {
            const res = await api.markNotificationAsRead(notification._id);
            onNotificationUpdate(res.data);
        }
        setIsOpen(false);
    };

    const handleMarkAllRead = async () => {
        await api.markAllNotificationsAsRead();
        onNotificationUpdate(null); // This will trigger a refetch in App.js
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(prev => !prev)} className="relative text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 p-2 rounded-full">
                {icons.bell}
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 z-50">
                    <div className="p-4 flex justify-between items-center border-b dark:border-gray-700">
                        <h3 className="font-bold">Notifications</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllRead} className="text-sm text-teal-500 hover:underline">Mark all as read</button>
                        )}
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                            notifications.map(n => (
                                <div 
                                    key={n._id} 
                                    onClick={() => handleNotificationClick(n)}
                                    className={`p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${!n.isRead ? 'bg-teal-500/10' : ''}`}
                                >
                                    <p className="text-sm">{n.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                                </div>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500">No new notifications.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
