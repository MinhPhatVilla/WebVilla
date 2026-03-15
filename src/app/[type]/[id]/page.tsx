"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Property } from "@/types/property";
import { usePropertyStore } from "@/lib/property-store";
import { useAuth } from "@/lib/auth-context";
import {
    ChevronLeft, ChevronRight, MapPin, Star, Users, BedDouble, Bed,
    Waves, Flame, Wifi, Target, UtensilsCrossed, AirVent, Mic2,
    Gamepad2, Bath, ArrowLeft, Share2, Heart, Phone, MessageCircle,
    Calendar, Shield, Clock, ChevronDown, ChevronUp, Minus, Plus, Search, Dribbble,
    Ship, LifeBuoy, Volume2, Music
} from "lucide-react";

// ========== IMAGE GALLERY COMPONENT ==========
function ImageGallery({ images, name }: { images: string[]; name: string }) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);

    // Auto slide every 4 seconds
    useEffect(() => {
        if (!isAutoPlay) return;
        const timer = setInterval(() => {
            setActiveIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [isAutoPlay, images.length]);

    const goTo = (index: number) => {
        setActiveIndex(index);
        setIsAutoPlay(false);
        // Resume auto-play after 8 seconds
        setTimeout(() => setIsAutoPlay(true), 8000);
    };

    const goPrev = () => goTo((activeIndex - 1 + images.length) % images.length);
    const goNext = () => goTo((activeIndex + 1) % images.length);

    return (
        <div className="space-y-4">
            {/* Main Image */}
            <div className="relative rounded-3xl overflow-hidden group bg-gray-100"
                style={{ aspectRatio: "16/9" }}>
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 transition-opacity duration-700 ${idx === activeIndex ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <Image
                            src={img}
                            alt={`${name} - Ảnh ${idx + 1}`}
                            fill
                            className="object-cover"
                            priority={idx === 0}
                        />
                    </div>
                ))}

                {/* Navigation Arrows */}
                <button
                    onClick={goPrev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
                >
                    <ChevronLeft size={22} />
                </button>
                <button
                    onClick={goNext}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-white hover:scale-110"
                >
                    <ChevronRight size={22} />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
                    {activeIndex + 1} / {images.length}
                </div>

                {/* Auto-play indicator */}
                {isAutoPlay && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        Tự động
                    </div>
                )}
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => goTo(idx)}
                        className={`relative flex-shrink-0 rounded-2xl overflow-hidden transition-all duration-300 ${idx === activeIndex
                            ? "ring-4 ring-cyan-500 ring-offset-2 scale-105 shadow-lg"
                            : "opacity-60 hover:opacity-100 hover:scale-102"
                            }`}
                        style={{ width: 120, height: 80 }}
                    >
                        <Image
                            src={img}
                            alt={`Thumbnail ${idx + 1}`}
                            fill
                            className="object-cover"
                        />
                        {idx === activeIndex && (
                            <div className="absolute inset-0 bg-cyan-500/20"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ========== MINI CALENDAR FOR DETAIL PAGE ==========
function BookingCalendar({
    checkIn, setCheckIn, checkOut, setCheckOut, customPrices
}: {
    checkIn: string; setCheckIn: (d: string) => void;
    checkOut: string; setCheckOut: (d: string) => void;
    customPrices?: Record<string, number>;
}) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const isSelectingCheckOut = Boolean(checkIn && !checkOut);

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
    ];

    const formatDateStr = (day: number) => {
        const m = String(currentMonth + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return `${currentYear}-${m}-${d}`;
    };

    const isDisabled = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const dateStr = formatDateStr(day);
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        if (date < todayStart) return true;

        const isClosed = customPrices && customPrices[dateStr] === -1;

        if (isSelectingCheckOut) {
            const min = new Date(checkIn);
            if (date <= min) {
                // Return true only if it is closed (so it can't be a NEW check-in)
                if (isClosed) return true;
                return false;
            }

            let hasClosedNight = false;
            let current = new Date(checkIn);
            const target = new Date(date);
            while (current < target) {
                const stepStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
                if (customPrices && customPrices[stepStr] === -1) {
                    hasClosedNight = true;
                    break;
                }
                current.setDate(current.getDate() + 1);
            }

            if (!hasClosedNight) {
                // Valid checkout date!
                return false;
            } else {
                // Invalid checkout, but could it be a NEW check-in?
                if (isClosed) return true;
                return false;
            }
        } else {
            if (isClosed) return true;
        }

        return false;
    };

    const isWeekend = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        return date.getDay() === 0 || date.getDay() === 6;
    };

    const isInRange = (day: number) => {
        if (!checkIn || !checkOut) return false;
        const d = formatDateStr(day);
        return d > checkIn && d < checkOut;
    };

    const handleSelect = (day: number) => {
        const dateStr = formatDateStr(day);

        if (isSelectingCheckOut) {
            if (dateStr <= checkIn) {
                setCheckIn(dateStr);
                setCheckOut("");
            } else {
                let hasClosedNight = false;
                let current = new Date(checkIn);
                const target = new Date(dateStr);
                while (current < target) {
                    const stepStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
                    if (customPrices && customPrices[stepStr] === -1) {
                        hasClosedNight = true;
                        break;
                    }
                    current.setDate(current.getDate() + 1);
                }

                if (!hasClosedNight) {
                    setCheckOut(dateStr);
                } else {
                    // Invalid range => treat as new check in
                    setCheckIn(dateStr);
                    setCheckOut("");
                }
            }
        } else {
            setCheckIn(dateStr);
            setCheckOut("");
        }
    };

    const prevMonth = () => {
        if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
        else setCurrentMonth(currentMonth - 1);
    };

    const nextMonth = () => {
        if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
        else setCurrentMonth(currentMonth + 1);
    };

    const canGoPrev = () => {
        return currentYear > today.getFullYear() ||
            (currentYear === today.getFullYear() && currentMonth > today.getMonth());
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} disabled={!canGoPrev()}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 disabled:opacity-30">
                    <ChevronLeft size={18} />
                </button>
                <h4 className="font-bold text-gray-900">{monthNames[currentMonth]} {currentYear}</h4>
                <button onClick={nextMonth}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100">
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Selecting indicator */}
            <div className="text-center mb-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${isSelectingCheckOut ? "bg-blue-100 text-blue-700" : "bg-cyan-100 text-cyan-700"}`}>
                    {isSelectingCheckOut ? "Chọn ngày trả phòng" : "Chọn ngày nhận phòng"}
                </span>
            </div>

            {/* Day names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((n) => (
                    <div key={n} className={`text-center text-xs font-bold py-1 ${n === "T7" || n === "CN" ? "text-red-400" : "text-gray-400"}`}>{n}</div>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startDay }).map((_, i) => <div key={`e-${i}`} className="h-10"></div>)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const d = formatDateStr(day);
                    const disabled = isDisabled(day);
                    const isCheckIn = d === checkIn;
                    const isCheckOut = d === checkOut;
                    const inRange = isInRange(day);
                    const weekend = isWeekend(day);

                    const isClosed = customPrices && customPrices[d] === -1;

                    return (
                        <button key={day} disabled={disabled} onClick={() => handleSelect(day)}
                            className={`h-10 w-full rounded-full text-sm font-semibold transition-all
                                ${isClosed && !isCheckOut
                                    ? `text-white bg-rose-500/80 font-bold line-through ${disabled ? 'cursor-not-allowed' : 'hover:bg-rose-600'}`
                                    : disabled
                                        ? "text-gray-300 cursor-not-allowed"
                                        : isCheckIn ? "bg-cyan-500 text-white shadow-lg"
                                            : isCheckOut ? "bg-blue-500 text-white shadow-lg"
                                                : inRange ? "bg-cyan-100 text-cyan-800"
                                                    : weekend ? "text-red-500 hover:bg-red-50"
                                                        : "text-gray-700 hover:bg-cyan-50"}`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                    <span>Nhận</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Trả</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-cyan-100"></div>
                    <span>Lưu trú</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-red-500 font-bold">T7</span>
                    <span>Cuối tuần</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-rose-500/80 text-white flex items-center justify-center line-through text-[8px] font-bold">15</span>
                    <span>Đã kín lịch</span>
                </div>
            </div>
        </div>
    );
}

// ========== AMENITY ICON HELPER ==========
function AmenityBadge({ icon: Icon, label, active }: { icon: any; label: string; active?: boolean }) {
    return (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${active !== false
            ? "bg-cyan-50 text-cyan-700 border border-cyan-200"
            : "bg-gray-100 text-gray-400 line-through"
            }`}>
            <Icon size={18} />
            <span>{label}</span>
        </div>
    );
}

// ========== MAIN DETAIL PAGE ==========
export default function PropertyDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const propertyId = params.id as string;
    const store = usePropertyStore();
    const property = store.getPropertyById(propertyId);

    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(2);
    const [showAllPolicies, setShowAllPolicies] = useState(false);

    // Feature: Share & Wishlist
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        // Load wishlist from local storage on mount
        const savedList = JSON.parse(localStorage.getItem('webvilla_wishlist') || '[]');
        if (savedList.includes(propertyId)) {
            setIsSaved(true);
        }
    }, [propertyId]);

    const handleShare = async () => {
        const url = window.location.href;
        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Minh Phát Villa - ${property?.name || 'Chi tiết căn hộ'}`,
                    url: url,
                });
            } catch (err) {
                console.log("Error sharing", err);
            }
        } else {
            // Fallback: Copy to clipboard
            navigator.clipboard.writeText(url);
            alert("Đã copy link thành công!");
        }
    };

    const handleToggleSave = () => {
        if (!user) {
            alert("Vui lòng đăng nhập để lưu căn hộ!");
            router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        const savedList = JSON.parse(localStorage.getItem('webvilla_wishlist') || '[]');
        if (isSaved) {
            const newList = savedList.filter((id: string) => id !== propertyId);
            localStorage.setItem('webvilla_wishlist', JSON.stringify(newList));
            setIsSaved(false);
        } else {
            savedList.push(propertyId);
            localStorage.setItem('webvilla_wishlist', JSON.stringify(savedList));
            setIsSaved(true);
        }
    };

    const nights = useMemo(() => {
        if (!checkIn || !checkOut) return 0;
        const diff = Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    }, [checkIn, checkOut]);

    const formatPrice = (n: number) => n.toLocaleString("vi-VN");

    const formatDate = (d: string) => {
        if (!d) return "—";
        return new Date(d).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
    };

    if (!property) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-6xl mb-4">🏠</p>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy căn này</h2>
                    <p className="text-gray-500 mb-6">Có thể căn đã bị xóa hoặc đường dẫn sai.</p>
                    <Link href="/" className="btn-primary">← Về trang chủ</Link>
                </div>
            </div>
        );
    }

    const totalPrice = nights > 0 ? nights * property.price.weekday : 0;
    const deposit = Math.ceil(totalPrice * 0.5);

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Top Bar */}
            <header className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={20} />
                        <span className="font-semibold">Quay lại</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleShare}
                            className="flex items-center gap-2 px-4 py-2 rounded-full hover:bg-gray-100 transition-colors text-sm font-semibold"
                        >
                            <Share2 size={16} />
                            Chia sẻ
                        </button>
                        <button
                            onClick={handleToggleSave}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors text-sm font-semibold ${isSaved
                                ? "bg-red-50 text-red-600 hover:bg-red-100"
                                : "hover:bg-gray-100 text-gray-700"
                                }`}
                        >
                            <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
                            {isSaved ? "Đã lưu" : "Lưu"}
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Title Section */}
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase">
                            {property.type}
                        </span>
                        <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                            <span className="font-bold">{property.rating}</span>
                            <span className="text-gray-400">({property.reviews} đánh giá)</span>
                        </div>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">{property.name}</h1>
                    <div className="flex items-center gap-2 text-gray-500">
                        <MapPin size={16} className="text-cyan-500" />
                        <span>{property.address || property.location}</span>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left: Gallery + Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <ImageGallery images={property.images} name={property.name} />

                        {/* Description */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">📋 Giới thiệu</h2>
                            <p className="text-gray-600 leading-relaxed text-base">
                                {property.longDescription || property.description}
                            </p>
                        </div>

                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                                <BedDouble size={28} className="text-cyan-500 mx-auto mb-2" />
                                <p className="text-2xl font-extrabold text-gray-900">{property.attributes.bedrooms}</p>
                                <p className="text-sm text-gray-500">Phòng ngủ</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                                <Bed size={28} className="text-indigo-500 mx-auto mb-2" />
                                <p className="text-2xl font-extrabold text-gray-900">{property.attributes.beds || 1}</p>
                                <p className="text-sm text-gray-500">Giường</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                                <Bath size={28} className="text-blue-500 mx-auto mb-2" />
                                <p className="text-2xl font-extrabold text-gray-900">{property.attributes.bathrooms || 2}</p>
                                <p className="text-sm text-gray-500">WC</p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center h-full">
                                <Users size={28} className="text-green-500 mx-auto mb-2" />
                                <p className="text-2xl font-extrabold text-gray-900">{property.attributes.capacity}</p>
                                <p className="text-sm text-gray-500 mb-2 w-full">Sức chứa cơ bản</p>
                                <p className="text-[10px] text-gray-400 mt-auto leading-tight px-1">
                                    Nếu số lượng khách lớn hơn, vui lòng nhắn Zalo để được tư vấn phù hợp ạ
                                </p>
                            </div>
                            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
                                <Star size={28} className="text-yellow-500 mx-auto mb-2" />
                                <p className="text-2xl font-extrabold text-gray-900">{property.rating}</p>
                                <p className="text-sm text-gray-500">{property.reviews} đánh giá</p>
                            </div>
                        </div>

                        {/* Amenities */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">🏠 Tiện nghi</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <AmenityBadge icon={Waves} label="Hồ bơi" active={property.attributes.pool} />
                                <AmenityBadge icon={Flame} label="BBQ" active={property.attributes.bbq} />
                                <AmenityBadge icon={Wifi} label="Wifi miễn phí" active={property.attributes.wifi} />
                                <AmenityBadge icon={Target} label="Bida" active={property.attributes.billiards} />
                                <AmenityBadge icon={UtensilsCrossed} label="Bếp nấu ăn" active={property.attributes.kitchen} />
                                <AmenityBadge icon={AirVent} label="Máy lạnh" active={property.attributes.aircon} />
                                <AmenityBadge icon={Mic2} label="Karaoke" active={property.attributes.karaoke} />
                                <AmenityBadge icon={Gamepad2} label="Máy game trẻ em" active={property.attributes.arcade} />
                                <AmenityBadge icon={Dribbble} label="Bi lắc" active={property.attributes.foosball} />
                                <AmenityBadge icon={Ship} label="Thuyền Súp" active={true} />
                                <AmenityBadge icon={LifeBuoy} label="Phao bơi" active={true} />
                            </div>
                        </div>

                        {/* Policies */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Clock size={24} className="text-blue-500" />
                                Chính sách
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nhận phòng */}
                                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl">
                                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Clock size={18} className="text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-blue-500 uppercase tracking-wide">Nhận phòng</p>
                                        <p className="text-lg font-extrabold text-gray-900">14:00</p>
                                    </div>
                                </div>
                                {/* Trả phòng */}
                                <div className="flex items-start gap-3 p-4 bg-orange-50 rounded-2xl">
                                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Clock size={18} className="text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-orange-500 uppercase tracking-wide">Trả phòng</p>
                                        <p className="text-lg font-extrabold text-gray-900">12:00</p>
                                    </div>
                                </div>
                                {/* Đổi lịch */}
                                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-2xl">
                                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Calendar size={18} className="text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-green-500 uppercase tracking-wide">Đổi lịch</p>
                                        <p className="text-sm font-bold text-gray-900">Miễn phí 1 lần <span className="text-gray-500 font-normal">(trước 10 ngày)</span></p>
                                    </div>
                                </div>
                                {/* Âm thanh */}
                                <div className="flex items-start gap-3 p-4 bg-red-50 rounded-2xl">
                                    <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Volume2 size={18} className="text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-red-500 uppercase tracking-wide">Âm thanh</p>
                                        <p className="text-sm font-bold text-gray-900">Không mang loa kéo</p>
                                    </div>
                                </div>
                                {/* Giới nghiêm */}
                                <div className="md:col-span-2 flex items-start gap-3 p-4 bg-purple-50 rounded-2xl">
                                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                        <Music size={18} className="text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-purple-500 uppercase tracking-wide">Giờ giới nghiêm</p>
                                        <p className="text-sm font-bold text-gray-900">Không hát hò quá <span className="text-purple-600 text-lg">22:00</span></p>
                                    </div>
                                </div>
                            </div>

                            {/* Custom policies from database */}
                            {property.policies && property.policies.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
                                    {property.policies.map((policy, idx) => (
                                        <div key={idx} className="flex items-center gap-3 text-gray-600 text-sm">
                                            <Shield size={14} className="text-cyan-500 flex-shrink-0" />
                                            <span>{policy}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Booking Panel */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-20 space-y-6">
                            {/* Pricing or Contact CTA */}
                            {property.isContactForPrice ? (
                                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-8 shadow-lg border border-amber-200 text-center animate-fadeIn">
                                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-5 shadow-sm">
                                        <MessageCircle size={32} className="text-amber-500" />
                                    </div>
                                    <h3 className="text-2xl font-extrabold text-amber-900 mb-3">Liên hệ báo giá tốt nhất</h3>

                                    {(property.contactPriceWeekday || property.contactPriceWeekend) && (
                                        <div className="bg-white/60 rounded-xl p-4 mb-4 text-left border border-amber-100/50">
                                            <p className="text-xs font-bold text-amber-900/60 uppercase tracking-wide mb-2">💰 Khoảng giá tham khảo</p>
                                            {property.contactPriceWeekday && (
                                                <div className="flex justify-between items-center mb-1.5">
                                                    <span className="text-sm font-medium text-amber-900">Ngày thường (CN-T6)</span>
                                                    <span className="text-sm font-bold text-cyan-600">{property.contactPriceWeekday}</span>
                                                </div>
                                            )}
                                            {property.contactPriceWeekend && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium text-amber-900">Cuối tuần (Thứ 7)</span>
                                                    <span className="text-sm font-bold text-rose-500">{property.contactPriceWeekend}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <p className="text-amber-800/80 mb-6 text-sm leading-relaxed">
                                        Căn này hiện đang được quản lý lịch trình độc quyền. Vui lòng liên hệ trực tiếp qua Zalo để kiểm tra lịch trống và nhận ưu đãi riêng.
                                    </p>
                                    <a href="https://zalo.me/0333160365" target="_blank" className="block w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.02] transition-all">
                                        Chat qua Zalo ngay
                                    </a>
                                </div>
                            ) : (
                                <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100">
                                    <div className="flex items-baseline gap-2 mb-1">
                                        <span className="text-3xl font-extrabold text-gray-900">
                                            {formatPrice(property.price.weekday)}đ
                                        </span>
                                        <span className="text-gray-400">/đêm</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                                        <span>Cuối tuần: <strong className="text-orange-500">{formatPrice(property.price.weekend)}đ</strong>/đêm</span>
                                    </div>

                                    {/* Calendar */}
                                    <div className="mb-6">
                                        <BookingCalendar
                                            checkIn={checkIn}
                                            setCheckIn={setCheckIn}
                                            checkOut={checkOut}
                                            setCheckOut={setCheckOut}
                                            customPrices={property.customPrices}
                                        />
                                    </div>

                                    {/* Date Summary */}
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-gray-50 rounded-2xl p-3">
                                            <p className="text-xs text-gray-400 font-bold uppercase">Nhận phòng</p>
                                            <p className="text-sm font-bold text-gray-900">{checkIn ? formatDate(checkIn) : "Chọn ngày"}</p>
                                        </div>
                                        <div className="bg-gray-50 rounded-2xl p-3">
                                            <p className="text-xs text-gray-400 font-bold uppercase">Trả phòng</p>
                                            <p className="text-sm font-bold text-gray-900">{checkOut ? formatDate(checkOut) : "Chọn ngày"}</p>
                                        </div>
                                    </div>

                                    {/* Guests */}
                                    <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                                        <div className="flex items-center justify-between mb-3">
                                            <p className="text-xs text-gray-400 font-bold uppercase">Số khách</p>
                                            <span className="text-[10px] font-semibold text-gray-500 bg-gray-200 px-2 py-0.5 rounded-md">
                                                Cơ bản {property.attributes.capacity} người
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 mt-1">Chọn số lượng</span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setGuests(Math.max(1, guests - 1))}
                                                    disabled={guests <= 1}
                                                    className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-cyan-500 hover:bg-cyan-50 transition-all disabled:opacity-30 active:scale-90"
                                                >
                                                    <Minus size={14} />
                                                </button>
                                                <span className="text-xl font-bold w-6 text-center">{guests}</span>
                                                <button
                                                    onClick={() => setGuests(Math.min(property.attributes.capacity, guests + 1))}
                                                    disabled={guests >= property.attributes.capacity}
                                                    className="w-9 h-9 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-cyan-500 hover:bg-cyan-50 transition-all disabled:opacity-30 active:scale-90"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mt-4 leading-relaxed text-center">
                                            Nếu số lượng khách lớn hơn vui lòng<br />nhắn Zalo để được tư vấn phù hợp ạ
                                        </p>
                                    </div>

                                    {/* Price Breakdown */}
                                    {nights > 0 && (
                                        <div className="border-t border-gray-100 pt-4 mb-6 space-y-2">
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>{formatPrice(property.price.weekday)}đ × {nights} đêm</span>
                                                <span>{formatPrice(totalPrice)}đ</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Cọc 50%</span>
                                                <span className="text-cyan-600 font-bold">{formatPrice(deposit)}đ</span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600">
                                                <span>Trả khi đến</span>
                                                <span>{formatPrice(totalPrice - deposit)}đ</span>
                                            </div>
                                            <div className="flex justify-between pt-3 border-t border-gray-100">
                                                <span className="font-bold text-gray-900">Tổng cộng</span>
                                                <span className="text-xl font-extrabold text-gray-900">{formatPrice(totalPrice)}đ</span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Book Button */}
                                    {nights > 0 ? (
                                        <button
                                            onClick={() => {
                                                if (!user) {
                                                    // Lưu URL hiện tại với cả query search nếu có
                                                    router.push(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
                                                } else {
                                                    router.push(`/checkout?property=${property.id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
                                                }
                                            }}
                                            className="block w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg text-center hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
                                        >
                                            {user ? `Đặt ngay — Cọc ${formatPrice(deposit)}đ` : `Đăng nhập để đặt phòng`}
                                        </button>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg opacity-50 cursor-not-allowed"
                                        >
                                            Chọn ngày để đặt
                                        </button>
                                    )}

                                    <p className="text-xs text-gray-400 text-center mt-3">
                                        Chưa bị trừ tiền. Bạn sẽ thanh toán cọc 50% qua mã QR Code.
                                    </p>
                                </div>
                            )}

                            {/* Contact Card */}
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                                <h3 className="font-bold text-gray-900 mb-4">📞 Liên hệ đặt phòng</h3>
                                <div className="space-y-3">
                                    <a href="tel:0333160365" className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                        <Phone size={18} className="text-green-500" />
                                        <span className="font-semibold text-gray-700">0333.160.365</span>
                                    </a>
                                    <a href="https://zalo.me/0333160365" target="_blank" className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                                        <MessageCircle size={18} className="text-blue-500" />
                                        <span className="font-semibold text-blue-700">Chat Zalo</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
