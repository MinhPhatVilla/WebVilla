"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play } from "lucide-react";

interface VideoPhoneFrameProps {
    videoUrl: string;
    tiktokUrl?: string;
    propertyName?: string;
    compact?: boolean;
}

export default function VideoPhoneFrame({ videoUrl, tiktokUrl, propertyName, compact = false }: VideoPhoneFrameProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isMuted, setIsMuted] = useState(true);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handlePlay = () => {
        if (!videoRef.current) return;
        setHasStarted(true);
        videoRef.current.muted = isMuted;
        videoRef.current.play().then(() => {
            setIsPlaying(true);
        }).catch(() => {
            // Still blocked — show error
            setHasError(true);
        });
    };

    const toggleMute = () => {
        if (videoRef.current) {
            const newMuted = !isMuted;
            videoRef.current.muted = newMuted;
            setIsMuted(newMuted);
        }
    };

    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    if (!videoUrl || !isMounted) {
        return (
            <div className={`mx-auto ${compact ? "max-w-[280px]" : "max-w-[320px]"}`}>
                <div className="bg-gray-900 rounded-[3rem] border-[6px] border-gray-800 aspect-[9/19] flex items-center justify-center">
                    <div className="text-gray-500 text-center px-4">
                        <div className="text-3xl mb-2">📱</div>
                        <p className="text-sm">Chưa có video</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`mx-auto ${compact ? "max-w-[280px]" : "max-w-[320px]"}`}>
            {/* iPhone Frame */}
            <div className="relative bg-black rounded-[3rem] border-[6px] border-gray-800 shadow-2xl overflow-hidden ring-2 ring-gray-700/50 aspect-[9/19]">
                {/* Dynamic Island */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full z-30 flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-gray-800" />
                    <div className="w-3 h-3 rounded-full bg-gray-800 ring-1 ring-gray-700" />
                </div>

                {/* Video element */}
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-cover"
                    muted={isMuted}
                    loop
                    playsInline
                    preload="metadata"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onError={() => setHasError(true)}
                    onCanPlay={() => setHasError(false)}
                />

                {/* Error state */}
                {hasError && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-20 text-center p-4">
                        <div className="text-3xl mb-2">⚠️</div>
                        <p className="text-white text-xs font-bold mb-1">Không load được video</p>
                        <p className="text-gray-400 text-[10px]">Kiểm tra lại file video</p>
                        {tiktokUrl && (
                            <a href={tiktokUrl} target="_blank" rel="noopener noreferrer"
                                className="mt-3 text-[#FE2C55] text-xs font-bold underline">
                                Xem trên TikTok ↗
                            </a>
                        )}
                    </div>
                )}

                {/* Big Play button overlay — shown before first play */}
                {!hasStarted && !hasError && (
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-20 cursor-pointer group"
                        onClick={handlePlay}
                    >
                        <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                            <Play className="w-9 h-9 text-gray-900 ml-1" fill="currentColor" />
                        </div>
                        <p className="text-white text-xs mt-3 font-bold opacity-80">Nhấn để xem video</p>
                    </div>
                )}

                {/* Pause overlay — shown after started but paused */}
                {hasStarted && !isPlaying && !hasError && (
                    <div
                        className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 cursor-pointer"
                        onClick={togglePlay}
                    >
                        <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                            <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                        </div>
                    </div>
                )}

                {/* Bottom gradient + info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent h-32 z-20 pointer-events-none p-4 flex items-end">
                    <div className="text-white">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 border-2 border-white/60 flex items-center justify-center text-[9px] font-extrabold shadow-md">
                                MP
                            </div>
                            <span className="text-xs font-bold drop-shadow-md">@villavungtaureview</span>
                            {tiktokUrl && (
                                <span className="bg-[#FE2C55] text-white text-[9px] px-2 py-0.5 rounded font-bold">Follow</span>
                            )}
                        </div>
                        {propertyName && (
                            <p className="text-[10px] text-gray-300 line-clamp-2 drop-shadow-md leading-relaxed">
                                {propertyName} — Review thực tế 🏖️ #vungtau #villa
                            </p>
                        )}
                    </div>
                </div>

                {/* Sound toggle — only show when playing */}
                {hasStarted && (
                    <button
                        onClick={toggleMute}
                        className="absolute top-12 right-3 z-30 p-2.5 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-black/70 transition-all active:scale-90"
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                )}

                {/* Home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/40 rounded-full z-30" />
            </div>

            {/* TikTok link below */}
            {tiktokUrl && (
                <div className="flex items-center justify-center gap-2 mt-3">
                    <svg className="w-4 h-4 text-[#FE2C55]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.01-.3z" />
                    </svg>
                    <a
                        href={tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-gray-500 hover:text-[#FE2C55] transition-colors"
                    >
                        Xem trên TikTok
                    </a>
                </div>
            )}
        </div>
    );
}
