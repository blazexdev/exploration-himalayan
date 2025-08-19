import React, { useEffect } from 'react';
import Modal from './Modal';

const icons = {
    success: (
        <svg className="w-24 h-24 text-green-500 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <style>
                {`
                .checkmark__circle {
                    stroke-dasharray: 166;
                    stroke-dashoffset: 166;
                    stroke-width: 2;
                    stroke-miterlimit: 10;
                    stroke: #4CAF50;
                    fill: none;
                    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
                .checkmark {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    display: block;
                    stroke-width: 2;
                    stroke: #fff;
                    stroke-miterlimit: 10;
                    margin: 10% auto;
                    box-shadow: inset 0px 0px 0px #4CAF50;
                    animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
                }
                .checkmark__check {
                    transform-origin: 50% 50%;
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
                }
                @keyframes stroke {
                    100% { stroke-dashoffset: 0; }
                }
                @keyframes scale {
                    0%, 100% { transform: none; }
                    50% { transform: scale3d(1.1, 1.1, 1); }
                }
                @keyframes fill {
                    100% { box-shadow: inset 0px 0px 0px 30px #4CAF50; }
                }
                `}
            </style>
            <circle className="checkmark__circle" cx="12" cy="12" r="10" />
            <path className="checkmark" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" style={{display:'none'}}/>
            <polyline className="checkmark__check" points="7 12 10 15 17 8" fill="none" />
        </svg>
    ),
    failure: (
        <svg className="w-24 h-24 text-red-500 mx-auto" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <style>
                {`
                .cross__circle {
                    stroke-dasharray: 166;
                    stroke-dashoffset: 166;
                    stroke-width: 2;
                    stroke-miterlimit: 10;
                    stroke: #f44336;
                    fill: none;
                    animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
                }
                .cross {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    display: block;
                    stroke-width: 2;
                    stroke: #fff;
                    stroke-miterlimit: 10;
                    margin: 10% auto;
                    box-shadow: inset 0px 0px 0px #f44336;
                    animation: fill-red .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
                }
                .cross__path {
                    stroke-dasharray: 48;
                    stroke-dashoffset: 48;
                    transform-origin: 50% 50%;
                    animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
                }
                @keyframes fill-red {
                    100% { box-shadow: inset 0px 0px 0px 30px #f44336; }
                }
                `}
            </style>
            <circle className="cross__circle" cx="12" cy="12" r="10" />
            <g className="cross">
                <line className="cross__path" x1="8" y1="8" x2="16" y2="16" stroke="#fff" stroke-width="2" />
                <line className="cross__path" x1="16" y1="8" x2="8" y2="16" stroke="#fff" stroke-width="2" />
            </g>
        </svg>
    ),
};

const PaymentStatusModal = ({ isOpen, onClose, status, message }) => {
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Auto-close after 3 seconds
            return () => clearTimeout(timer);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const isSuccess = status === 'success';

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="text-center p-6">
                {isSuccess ? icons.success : icons.failure}
                <h2 className={`text-2xl font-bold mt-6 mb-2 ${isSuccess ? 'text-green-500' : 'text-red-500'}`}>
                    {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{message}</p>
            </div>
        </Modal>
    );
};

export default PaymentStatusModal;
