// client/src/components/ChatWindow.js

import React, { useState, useEffect, useRef } from 'react';

const icons = {
    attach: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>,
    send: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
};
const LOGO_URL = "https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png";

const ChatWindow = ({ currentUser, messages, onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const chatEndRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const userMessages = messages.filter(msg => 
        (msg.from === currentUser.email && msg.to === 'admin') ||
        (msg.from === 'admin' && msg.to === currentUser.email)
    );

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        onSendMessage({
            type: 'text',
            from: currentUser.email,
            to: 'admin',
            content: newMessage.trim()
        });
        setNewMessage('');
    };
    
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            onSendMessage({
                type: file.type.startsWith('image/') ? 'image' : 'video',
                from: currentUser.email,
                to: 'admin',
                content: loadEvent.target.result,
                fileName: file.name
            });
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg flex flex-col h-full">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-center text-gray-900 dark:text-white">Chat with Admin</h3>
            </div>
            <div className="flex-grow p-6 space-y-4 overflow-y-auto">
                {userMessages.map(msg => (
                    <div key={msg._id} className={`flex items-end gap-3 ${msg.from === 'admin' ? 'justify-start' : 'justify-end'}`}>
                        {msg.from === 'admin' && (
                            <img src={LOGO_URL} alt="Admin" className="w-8 h-8 rounded-full object-cover"/>
                        )}
                        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.from === 'admin' ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white' : 'bg-teal-500 text-white'}`}>
                            {msg.type === 'text' && <p>{msg.content}</p>}
                            {msg.type === 'image' && <img src={msg.content} alt={msg.fileName} className="rounded-lg"/>}
                            {msg.type === 'video' && <video src={msg.content} controls className="rounded-lg"/>}
                            <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                        </div>
                        {msg.from !== 'admin' && (
                             <img src={currentUser.imageUrl || `https://placehold.co/40x40/1a202c/718096?text=${currentUser.name.charAt(0)}`} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover"/>
                        )}
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center">
                <button type="button" onClick={() => fileInputRef.current.click()} className="mr-4 text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 p-2">
                    <span className="w-6 h-6">{icons.attach}</span>
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*,video/*"/>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-grow bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <button type="submit" className="ml-4 bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600">
                    <span className="w-6 h-6">{icons.send}</span>
                </button>
            </form>
        </div>
    );
};

export default ChatWindow;