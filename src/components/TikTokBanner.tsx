export default function TikTokBanner() {
    return (
        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
                <a
                    href="https://www.tiktok.com/@villavungtaureview?lang=vi-VN"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-3 sm:gap-4 group"
                >
                    {/* Logo TikTok SVG */}
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-[#25F4EE] via-[#FE2C55] to-[#000] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.34a8.16 8.16 0 004.76 1.52V7.46a4.85 4.85 0 01-1-.77z"/>
                        </svg>
                    </div>
                    <div className="text-center sm:text-left flex-1 min-w-0">
                        {/* Mobile */}
                        <p className="sm:hidden text-white font-bold text-sm group-hover:text-[#FE2C55] transition-colors flex items-center justify-center gap-1.5">
                            <svg className="w-4 h-3 flex-shrink-0" viewBox="0 0 30 20" fill="none"><rect width="30" height="20" rx="2" fill="#DA251D"/><path d="M15 3.5l1.76 5.41h5.69l-4.6 3.35 1.76 5.41L15 14.32l-4.61 3.35 1.76-5.41-4.6-3.35h5.69L15 3.5z" fill="#FFCD00"/></svg>
                            Minh Phát Villa — Thật từ video đến trải nghiệm
                        </p>
                        <p className="sm:hidden text-gray-400 text-xs">@villavungtaureview — Xem ngay trên TikTok 🎬</p>
                        {/* Desktop */}
                        <p className="hidden sm:block text-white font-bold text-base group-hover:text-[#FE2C55] transition-colors">
                            <svg className="inline w-5 h-4 mr-1.5 mb-0.5" viewBox="0 0 30 20" fill="none"><rect width="30" height="20" rx="2" fill="#DA251D"/><path d="M15 3.5l1.76 5.41h5.69l-4.6 3.35 1.76 5.41L15 14.32l-4.61 3.35 1.76-5.41-4.6-3.35h5.69L15 3.5z" fill="#FFCD00"/></svg>
                            Xem review Villa thực tế trên TikTok
                        </p>
                        <p className="hidden sm:block text-gray-400 text-sm">@villavungtaureview — Minh Phát Villa thật từ video đến trải nghiệm <svg className="inline w-4 h-3 ml-1 mb-0.5" viewBox="0 0 30 20" fill="none"><rect width="30" height="20" rx="2" fill="#DA251D"/><path d="M15 3.5l1.76 5.41h5.69l-4.6 3.35 1.76 5.41L15 14.32l-4.61 3.35 1.76-5.41-4.6-3.35h5.69L15 3.5z" fill="#FFCD00"/></svg></p>
                    </div>
                    {/* Mobile button */}
                    <div className="sm:hidden flex items-center gap-1 bg-[#FE2C55] text-white px-3 py-1.5 rounded-full text-xs font-bold group-hover:bg-[#ff4b6e] transition-all shadow-lg flex-shrink-0">
                        Theo dõi
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </div>
                    {/* Desktop button */}
                    <div className="hidden sm:flex items-center gap-1 bg-[#FE2C55] text-white px-4 py-2 rounded-full text-sm font-bold group-hover:bg-[#ff4b6e] transition-all shadow-lg">
                        Theo dõi ngay
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </div>
                </a>
            </div>
        </div>
    );
}
