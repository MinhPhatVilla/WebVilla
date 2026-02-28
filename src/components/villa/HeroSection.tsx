"use client";

import { useState, useEffect } from "react";
import { mockVilla } from "@/lib/mock-data";
import { Volume2, VolumeX, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function HeroSection() {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [isMounted, setIsMounted] = useState(false);
    const [isHovering, setIsHovering] = useState(false); // New state for hover

    // Auto-slide effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (!isHovering) {
            interval = setInterval(() => {
                setCurrentImageIndex((prev) => (prev + 1) % mockVilla.images.length);
            }, 3000); // Change slide every 3 seconds
        }
        return () => clearInterval(interval);
    }, [isHovering]); // Re-run effect when hover state changes

    // Prevent hydration mismatch for media elements
    useEffect(() => {
        setIsMounted(true);
    }, []);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % mockVilla.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + mockVilla.images.length) % mockVilla.images.length);
    };

    if (!isMounted) {
        return <div className="h-[600px] w-full bg-gray-100 animate-pulse rounded-2xl"></div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 lg:h-[600px]">
            {/* Gallery Slider (chiếm 2/3) */}
            <div
                className="lg:col-span-2 flex flex-col gap-4"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                {/* Ảnh Chính Lớn */}
                <div className="relative flex-1 rounded-2xl overflow-hidden group h-[400px] lg:h-auto shadow-lg">
                    <Image
                        src={mockVilla.images[currentImageIndex]}
                        alt={mockVilla.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        priority
                    />

                    {/* Navigation Buttons */}
                    <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 p-3 rounded-full text-white transition-all shadow-lg border border-white/10"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/40 p-3 rounded-full text-white transition-all shadow-lg border border-white/10"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>

                {/* Danh Sách Ảnh Nhỏ (Thumbnail Strip) */}
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide h-[100px] lg:h-[120px]">
                    {mockVilla.images.map((img, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`relative min-w-[140px] md:min-w-[180px] h-full rounded-xl overflow-hidden transition-all duration-300 ${idx === currentImageIndex
                                ? "ring-4 ring-primary shadow-lg scale-105 z-10"
                                : "opacity-70 hover:opacity-100 hover:scale-105"
                                }`}
                        >
                            <Image
                                src={img}
                                alt={`Thumbnail ${idx}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            {/* Vertical Video (Phone Frame Style) */}
            <div className="hidden lg:flex justify-center h-full">
                {/* Iphone Mockup Frame Container */}
                <div className="relative w-[300px] h-full bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden ring-4 ring-gray-900/50">
                    {/* Notch giả */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-xl z-20"></div>

                    <video
                        src={mockVilla.videoUrl}
                        className="w-full h-full object-cover"
                        autoPlay={isPlaying}
                        muted={isMuted}
                        loop
                        playsInline
                    ></video>

                    {/* TikTok Overlay UI Mock */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 z-10 pointer-events-none p-4 flex flex-col justify-between">
                        <div className="pt-8 flex justify-between items-start">
                            {/* Top controls */}
                        </div>

                        {/* Bottom Info */}
                        <div className="pb-8 pl-1 text-white space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-600 border border-white flex items-center justify-center font-bold text-xs shadow-md">
                                    MP
                                </div>
                                <span className="font-semibold text-sm drop-shadow-md">MinhPhatVilla</span>
                                <button className="bg-red-500 text-white text-[10px] px-2 py-1 rounded font-bold ml-1">Follow</button>
                            </div>
                            <p className="text-xs line-clamp-2 w-[80%] drop-shadow-md">
                                {mockVilla.name} - Trải nghiệm nghỉ dưỡng đẳng cấp tại Vũng Tàu... #vungtau #villa #travel
                            </p>
                        </div>
                    </div>

                    {/* Sound Control Toggle */}
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        className="absolute top-10 right-4 z-30 p-2 bg-black/40 backdrop-blur rounded-full text-white hover:bg-black/60 transition-colors"
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                </div>
            </div>
        </div>
    );
}
