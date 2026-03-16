import Link from "next/link";
import TikTokEmbed from "@/components/TikTokEmbed";
import { Property } from "@/types/property";

interface TikTokVideoSectionProps {
    properties: Property[];
}

export default function TikTokVideoSection({ properties }: TikTokVideoSectionProps) {
    const videosAvailable = properties.filter(p => p.videoUrl && p.videoUrl.trim());
    if (videosAvailable.length === 0) return null;

    const randomIdx = Math.floor(Date.now() / 60000) % videosAvailable.length;
    const randomProp = videosAvailable[randomIdx];

    return (
        <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-6 md:p-10 overflow-hidden relative">
                {/* Background decorations */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#FE2C55]/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl" />
                
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                    {/* Text Content */}
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 bg-[#FE2C55]/20 text-[#FE2C55] px-4 py-2 rounded-full text-sm font-bold mb-4">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.01-.3z"/></svg>
                            Video Review Thực Tế
                        </div>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3">
                            Xem trước khi đặt phòng
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base mb-6 leading-relaxed">
                            Video review thực tế từ <span className="text-white font-bold">@villavungtaureview</span> — Giúp bạn chọn nơi ở phù hợp nhất.
                        </p>
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                            <Link
                                href={`/${randomProp.type}/${randomProp.id}`}
                                className="bg-white text-gray-900 px-6 py-3 rounded-full font-bold text-sm hover:bg-gray-100 transition-all shadow-lg"
                            >
                                Xem chi tiết căn này →
                            </Link>
                            <a
                                href="https://www.tiktok.com/@villavungtaureview"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border-2 border-gray-600 text-gray-300 px-6 py-3 rounded-full font-bold text-sm hover:border-[#FE2C55] hover:text-[#FE2C55] transition-all"
                            >
                                Xem tất cả video
                            </a>
                        </div>
                        <p className="text-gray-500 text-xs mt-4">
                            📍 {randomProp.name} — {randomProp.location}
                        </p>
                    </div>
                    
                    {/* TikTok Video Embed */}
                    <div className="flex justify-center">
                        <TikTokEmbed videoUrl={randomProp.videoUrl} tiktokUrl={randomProp.tiktokUrl} propertyName={randomProp.name} compact />
                    </div>
                </div>
            </div>
        </section>
    );
}
