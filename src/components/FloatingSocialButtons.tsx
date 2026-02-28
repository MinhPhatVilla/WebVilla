"use client";

import { Phone } from "lucide-react";

export default function FloatingSocialButtons() {
    const phoneNumber = "0333160365";
    const zaloLink = `https://zalo.me/${phoneNumber}`;
    const facebookLink = "https://www.facebook.com/MINHPHATVILLA";

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4 items-end">
            {/* Phone Call Button */}
            <a
                href={`tel:${phoneNumber}`}
                className="group flex items-center gap-3"
                aria-label="Gọi điện"
            >
                <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                    {phoneNumber}
                </span>
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-green-600 shadow-lg hover:shadow-green-500/50 hover:scale-110 transition-all flex items-center justify-center">
                    <Phone size={24} className="text-white" />
                </div>
            </a>

            {/* Facebook Button */}
            <a
                href={facebookLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3"
                aria-label="Facebook"
            >
                <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                    Facebook
                </span>
                <div className="w-14 h-14 rounded-full bg-[#1877F2] shadow-lg hover:shadow-blue-500/50 hover:scale-110 transition-all flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                </div>
            </a>

            {/* Zalo Button - Main */}
            <a
                href={zaloLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3"
                aria-label="Chat Zalo"
            >
                <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                    Chat Zalo
                </span>
                <div className="relative w-16 h-16 rounded-full bg-[#0068FF] shadow-2xl hover:shadow-blue-500/50 hover:scale-110 transition-all flex items-center justify-center">
                    {/* Zalo Logo */}
                    <span className="text-white font-bold text-xs tracking-tight uppercase">
                        zalo
                    </span>
                    {/* Pulse animation */}
                    <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-30" />
                    {/* Notification badge */}
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center animate-bounce">
                        1
                    </span>
                </div>
            </a>
        </div>
    );
}
