import React, { useState, useEffect, useRef, useMemo } from 'react';

const icons = {
  send: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>,
  attach: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.59a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>,
};

const LOGO_URL = "https://i.ibb.co/VW3kNJGd/1000006623-removebg-preview.png";

const ContactPage = ({ currentUser, messages = [], onSendMessage }) => {
    const [newMessage, setNewMessage] = useState('');
    const chatContainerRef = useRef(null);
    const chatEndRef = useRef(null);

    const userMessages = useMemo(() => 
        messages.filter(
            msg => (msg.from === currentUser.email && msg.to === 'admin') || (msg.from === 'admin' && msg.to === currentUser.email)
        ), 
    [messages, currentUser.email]);

    const prevMessagesCount = useRef(userMessages.length);

    useEffect(() => {
        const container = chatContainerRef.current;
        if (!container) return;

        const isScrolledToBottom = container.scrollHeight - container.clientHeight <= container.scrollTop + 150;
        const didUserSendMessage = userMessages.length > prevMessagesCount.current && userMessages[userMessages.length - 1]?.from === currentUser.email;

        if (isScrolledToBottom || didUserSendMessage) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
        prevMessagesCount.current = userMessages.length;
    }, [userMessages, currentUser.email]);

    const handleMediaUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            onSendMessage({
                type: file.type.startsWith('image') ? 'image' : 'video',
                from: currentUser.email,
                to: 'admin',
                content: reader.result,
                fileName: file.name,
            });
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim() === '') return;
        onSendMessage({
            type: 'text',
            from: currentUser.email,
            to: 'admin',
            content: newMessage.trim(),
        });
        setNewMessage('');
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 py-12">
            <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-8">Contact Us</h1>
            <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 flex flex-col h-[75vh]">
                <div ref={chatContainerRef} className="flex-grow p-6 space-y-4 overflow-y-auto">
                    {userMessages.map(msg => (
                        <div key={msg._id} className={`flex items-end gap-3 ${msg.from === 'admin' ? 'justify-start' : 'justify-end'}`}>
                            {msg.from === 'admin' && (
                                <img src={LOGO_URL} alt="Admin" className="w-8 h-8 rounded-full object-cover"/>
                            )}
                            <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.from === 'admin' ? 'bg-gray-200 dark:bg-gray-700' : 'bg-teal-500 text-white'}`}>
                                {msg.type === 'text' && <p>{msg.content}</p>}
                                {msg.type === 'image' && <img src={msg.content} alt={msg.fileName} className="rounded-lg"/>}
                                {msg.type === 'video' && <video src={msg.content} controls className="rounded-lg w-full"/>}
                                <p className="text-xs opacity-70 mt-1 text-right">{new Date(msg.timestamp).toLocaleTimeString()}</p>
                            </div>
                             {msg.from !== 'admin' && (
                                <img src={currentUser?.imageUrl || `https://placehold.co/40x40/e2e8f0/4a5568?text=${currentUser?.name.charAt(0)}`} alt={currentUser?.name} className="w-8 h-8 rounded-full object-cover"/>
                            )}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
                <form onSubmit={handleSubmit} className="p-4 border-t dark:border-gray-700 flex items-center">
                    <input type="file" id="contact-chat-upload" className="hidden" onChange={handleMediaUpload} accept="image/*,video/*" />
                    <label htmlFor="contact-chat-upload" className="mr-4 text-gray-500 dark:text-gray-400 hover:text-teal-500 dark:hover:text-teal-400 p-2 cursor-pointer">
                        {icons.attach}
                    </label>
                    <input 
                        type="text" 
                        value={newMessage} 
                        onChange={(e) => setNewMessage(e.target.value)} 
                        placeholder="Type your message..." 
                        className="flex-grow bg-gray-100 dark:bg-gray-700 rounded-lg p-3 focus:outline-none"
                    />
                    <button type="submit" className="ml-4 bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600">
                        <span className="w-6 h-6">{icons.send}</span>
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ContactPage;
