"use client";

import { useState } from "react";
import { X, Phone, MessageCircle } from "lucide-react";

export default function ZaloButton() {
    const [isOpen, setIsOpen] = useState(false);
    const phoneNumber = "0333160365";
    const zaloLink = `https://zalo.me/${phoneNumber}`;

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Popup Menu */}
            {isOpen && (
                <div className="fixed bottom-28 right-6 z-50 animate-in slide-in-from-bottom-4 duration-300">
                    <div className="bg-white rounded-2xl shadow-2xl p-4 w-72 border border-gray-100">
                        <div className="text-center mb-4">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center mb-3 shadow-lg">
                                <ZaloIcon className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">Liên hệ Zalo</h3>
                            <p className="text-sm text-gray-500">Minh Phát Villa Homestay</p>
                        </div>

                        <div className="space-y-3">
                            <a
                                href={zaloLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-[1.02]"
                            >
                                <MessageCircle size={20} />
                                <span>Nhắn tin Zalo</span>
                            </a>

                            <a
                                href={`tel:${phoneNumber}`}
                                className="flex items-center gap-3 w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-xl font-bold hover:bg-gray-200 transition-all"
                            >
                                <Phone size={20} />
                                <span>Gọi điện: {phoneNumber}</span>
                            </a>
                        </div>

                        <p className="text-xs text-gray-400 text-center mt-4">
                            Hỗ trợ 24/7 • Phản hồi nhanh trong 5 phút
                        </p>
                    </div>
                </div>
            )}

            {/* Main Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${isOpen
                        ? "bg-gray-600 rotate-90"
                        : "bg-gradient-to-br from-blue-500 to-blue-600 hover:scale-110 hover:shadow-blue-500/50"
                    }`}
                aria-label="Chat Zalo"
            >
                {isOpen ? (
                    <X size={28} className="text-white" />
                ) : (
                    <ZaloIcon className="w-9 h-9 text-white" />
                )}

                {/* Pulse animation when closed */}
                {!isOpen && (
                    <>
                        <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-30" />
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center animate-bounce">
                            1
                        </span>
                    </>
                )}
            </button>

            {/* Phone number label - appears on hover */}
            <div className="fixed bottom-8 right-24 z-50 bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-medium opacity-0 hover:opacity-100 pointer-events-none transition-opacity shadow-lg">
                {phoneNumber}
            </div>
        </>
    );
}

// Custom Zalo Icon SVG
function ZaloIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 48 48"
            fill="currentColor"
        >
            <path d="M24 4C12.954 4 4 12.954 4 24s8.954 20 20 20 20-8.954 20-20S35.046 4 24 4zm8.5 26.5c-.4.5-1 .8-1.7.8H17.2c-.7 0-1.3-.3-1.7-.8-.4-.5-.5-1.1-.3-1.7l2.4-7.8c.2-.7.9-1.2 1.6-1.2h9.6c.7 0 1.4.5 1.6 1.2l2.4 7.8c.2.6.1 1.2-.3 1.7zM24 14c-2.2 0-4 1.8-4 4s1.8 4 4 4 4-1.8 4-4-1.8-4-4-4z" />
            <text x="14" y="32" fontSize="12" fontWeight="bold" fill="currentColor">Z</text>
        </svg>
    );
}
