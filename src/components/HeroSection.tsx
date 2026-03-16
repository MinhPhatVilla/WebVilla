interface HeroSectionProps {
    activeTab: 'villa' | 'homestay' | 'nha-pho' | 'all';
    totalProperties: number;
}

export default function HeroSection({ activeTab, totalProperties }: HeroSectionProps) {
    return (
        <section className="relative py-12 px-4 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-500/10"></div>
            <div className="relative z-10 max-w-4xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                    {activeTab === 'villa' ? '🏠 Villa giá từ HSSV đến Sang Trọng'
                        : activeTab === 'homestay' ? '🏡 Homestay cho cặp đôi và nhóm bạn, gia đình dưới 10 khách'
                            : activeTab === 'nha-pho' ? '🏘️ Những căn Nhà Phố cho đoàn khách không cần hồ bơi, vẫn nướng được bbq và sạch sẽ'
                                : '🏖️ Villa & Homestay & Nhà Phố Vũng Tàu'}
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                    {activeTab === 'villa' ? 'Trải nghiệm kỳ nghỉ tuyệt vời cùng gia đình hoặc nhóm bạn — hồ bơi riêng, nướng BBQ và view biển chill'
                        : activeTab === 'homestay' ? 'Trải nghiệm những chiếc Home xinh xắn, sạch sẽ, view biển đẹp nhất Vũng Tàu'
                            : activeTab === 'nha-pho' ? 'Trải nghiệm những căn Nhà Phố đẹp giá tốt nhất Vũng Tàu'
                                : 'Trải nghiệm kỳ nghỉ tuyệt vời cùng gia đình hoặc nhóm bạn — hồ bơi riêng, nướng BBQ và view biển chill'}
                </p>
                <p className="text-sm font-semibold text-cyan-600 mb-6 tracking-wide">✨ Hệ thống hơn 1000 căn chuyên cho thuê tại Vũng Tàu</p>
                <div className="flex justify-center gap-4 flex-wrap">
                    <div className="bg-white px-5 py-2.5 rounded-full shadow-md">
                        <span className="text-xl font-bold text-blue-600">{totalProperties}</span>
                        <span className="text-gray-500 ml-2 text-sm">căn cho thuê</span>
                    </div>
                    <a
                        href="https://zalo.me/0333160365"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-6 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all group flex items-center gap-2"
                    >
                        <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.14 2 11.2c0 2.89 1.44 5.47 3.68 7.17-.1.76-.55 2.82-.63 3.26-.1.54.2.53.42.39.17-.11 2.4-1.63 3.38-2.29.98.18 2 .27 3.15.27 5.52 0 10-4.14 10-9.2S17.52 2 12 2z"/></svg>
                        <span className="text-white font-bold text-sm">Liên Hệ Zalo Tư Vấn</span>
                    </a>
                </div>
            </div>
        </section>
    );
}
