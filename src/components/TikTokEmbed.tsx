"use client";

import { useState, useEffect, useMemo } from "react";

interface TikTokEmbedProps {
    url: string;
    propertyName?: string;
    compact?: boolean; // Dùng cho homepage (nhỏ hơn)
}

/**
 * Parse TikTok URL → Video ID
 * Supports:
 * - https://www.tiktok.com/@user/video/1234567890
 * - https://vm.tiktok.com/XXXXXXX/
 * - https://www.tiktok.com/t/XXXXXXX/
 */
function extractTikTokId(url: string): string | null {
    if (!url) return null;

    // Pattern 1: full URL with video ID
    const fullMatch = url.match(/\/video\/(\d+)/);
    if (fullMatch) return fullMatch[1];

    // Pattern 2: short URL — can't extract ID from short URLs directly
    // We'll use the full URL for oEmbed instead
    return null;
}

export default function TikTokEmbed({ url, propertyName, compact = false }: TikTokEmbedProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    const videoId = useMemo(() => extractTikTokId(url), [url]);

    // If we can extract video ID, use embed iframe
    // Otherwise, use oEmbed script approach
    const embedUrl = videoId
        ? `https://www.tiktok.com/embed/v2/${videoId}`
        : null;

    if (!url || !url.trim()) return null;

    return (
        <div className={`relative ${compact ? "max-w-[320px]" : "max-w-[400px]"} mx-auto`}>
            {/* Phone Frame Container */}
            <div className={`relative bg-black rounded-[2.5rem] border-[6px] border-gray-900 shadow-2xl overflow-hidden ring-2 ring-gray-800/50 ${compact ? "aspect-[9/16] max-h-[480px]" : "aspect-[9/16] max-h-[600px]"}`}>
                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-b-2xl z-20" />

                {embedUrl ? (
                    <>
                        {/* Loading State */}
                        {!isLoaded && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
                                <div className="w-12 h-12 border-4 border-gray-700 border-t-[#FE2C55] rounded-full animate-spin mb-3" />
                                <p className="text-gray-400 text-sm font-medium">Đang tải video...</p>
                            </div>
                        )}
                        <iframe
                            src={embedUrl}
                            className="w-full h-full border-0"
                            allowFullScreen
                            allow="autoplay; encrypted-media"
                            onLoad={() => setIsLoaded(true)}
                            style={{ borderRadius: "inherit" }}
                        />
                    </>
                ) : (
                    // Fallback: show link to TikTok
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 text-white gap-3 hover:bg-gray-800 transition-colors"
                    >
                        <svg className="w-16 h-16 text-[#FE2C55]" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.01-.3z" />
                        </svg>
                        <p className="font-bold text-lg">Xem trên TikTok</p>
                        <p className="text-gray-400 text-sm">Nhấn để mở video</p>
                    </a>
                )}

                {/* TikTok-style overlay */}
                {embedUrl && isLoaded && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent h-24 z-10 pointer-events-none p-4 flex items-end">
                        <div className="text-white">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 border border-white/50 flex items-center justify-center text-[8px] font-bold">
                                    MP
                                </div>
                                <span className="text-xs font-semibold drop-shadow-md">@villavungtaureview</span>
                            </div>
                            {propertyName && (
                                <p className="text-[10px] text-gray-300 line-clamp-1 drop-shadow-md">
                                    {propertyName} — Review thực tế #vungtau
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* TikTok branding below */}
            <div className="flex items-center justify-center gap-2 mt-3">
                <svg className="w-4 h-4 text-[#FE2C55]" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.01-.3z" />
                </svg>
                <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-gray-500 hover:text-[#FE2C55] transition-colors"
                >
                    Xem trên TikTok
                </a>
            </div>
        </div>
    );
}
