import Image from "next/image";

export default function Footer() {
    return (
        <footer className="bg-gray-900 text-white py-12 mt-16">
            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Image src="/logo.png" alt="Minh Phát Villa" width={48} height={48} className="rounded-full" />
                            <div>
                                <h4 className="font-bold">Minh Phát Villa</h4>
                                <p className="text-sm text-gray-400">EST. 2026</p>
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm">
                            Chuyên cho thuê Villa &amp; Homestay cao cấp tại Vũng Tàu
                        </p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Liên hệ</h4>
                        <p className="text-gray-400 text-sm mb-2">📞 0333.160.365</p>
                        <p className="text-gray-400 text-sm mb-2">📧 minhphatvilla@gmail.com</p>
                        <p className="text-gray-400 text-sm">📍 Vũng Tàu, Việt Nam</p>
                    </div>
                    <div>
                        <h4 className="font-bold mb-4">Theo dõi chúng tôi</h4>
                        <div className="flex gap-4">
                            <a href="https://www.facebook.com/MINHPHATVILLA" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            </a>
                            <a href="https://www.tiktok.com/@villavungtaureview?lang=vi-VN" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer relative overflow-hidden">
                                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.34a8.16 8.16 0 004.76 1.52V7.46a4.85 4.85 0 01-1-.77z"/>
                                </svg>
                            </a>
                            <a href="https://zalo.me/0333160365" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                                <span className="text-sm font-bold">Z</span>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
                    © 2026 Minh Phát Villa &amp; Homestay. All rights reserved.
                </div>
            </div>
        </footer>
    );
}
