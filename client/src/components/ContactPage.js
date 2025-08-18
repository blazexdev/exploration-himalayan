// client/src/components/ContactPage.js

import React from 'react';
import ChatWindow from './ChatWindow';

const ContactPage = ({ currentUser, messages, onSendMessage }) => {
    return (
        <div className="container mx-auto px-6 py-12">
            <div className="max-w-3xl mx-auto h-[70vh]">
                <ChatWindow currentUser={currentUser} messages={messages} onSendMessage={onSendMessage} />
            </div>
        </div>
    );
};

export default ContactPage;