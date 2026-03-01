"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Property } from "@/types/property";
import { usePropertyStore } from "@/lib/property-store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { MapPin, Star, Users, BedDouble, Waves, Flame, Phone, X, SlidersHorizontal, LogIn, UserCircle, LogOut, ChevronDown, Heart, Luggage, MessageSquare, Settings, Globe, HelpCircle, Home, Building, Palmtree } from "lucide-react";
import SearchBar from "@/components/SearchBar";

// ========== FILTERS TYPE ==========
interface SearchFilters {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: number;
}

// ========== PROPERTY CARD ==========
function PropertyCard({ property, isWeekend = false, isBooked = false }: { property: Property; isWeekend?: boolean, isBooked?: boolean }) {
    const displayPrice = isWeekend && property.contactPriceWeekend
        ? property.contactPriceWeekend
        : property.contactPriceWeekday;

    const displayNumericPrice = isWeekend && property.price.weekend
        ? property.price.weekend
        : property.price.weekday;

    return (
        <div className={`relative block group ${isBooked ? "grayscale opacity-80" : ""}`}>
            {/* Booked Overlay */}
            {isBooked && (
                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/10 backdrop-blur-[1px] rounded-3xl pointer-events-none">
                    <div className="bg-red-600/90 text-white font-extrabold text-2xl px-8 py-3 rounded-2xl shadow-2xl border-2 border-red-500/50 rotate-[15deg]">
                        HẾT PHÒNG
                    </div>
                </div>
            )}

            <Link href={`/${property.type}/${property.id}`} className={isBooked ? "pointer-events-none" : ""}>
                <div className={`bg-white rounded-3xl overflow-hidden shadow-lg transition-all duration-500 border border-gray-100 ${!isBooked && "hover:shadow-2xl hover:-translate-y-2 hover:border-gray-200"}`}>
                    {/* Image */}
                    <div className="relative h-64 overflow-hidden">
                        <Image
                            src={property.images[0]}
                            alt={property.name}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        {/* Price Badge */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                            {property.isContactForPrice ? (
                                <span className="text-sm font-bold text-amber-600">
                                    {displayPrice ? displayPrice : "Liên hệ Zalo"}
                                </span>
                            ) : (
                                <>
                                    <span className="text-lg font-bold text-blue-900">
                                        {displayNumericPrice.toLocaleString('vi-VN')}đ
                                    </span>
                                    <span className="text-xs text-gray-500">/{isWeekend ? "đêm t7" : "đêm"}</span>
                                </>
                            )}
                        </div>
                        {/* Type Badge */}
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg">
                            {property.type}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                            {property.name}
                        </h3>

                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                            <MapPin size={14} className="text-blue-500" />
                            <span>{property.location}</span>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                            {property.description}
                        </p>

                        {/* Attributes */}
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center gap-1">
                                <BedDouble size={16} className="text-blue-500" />
                                <span>{property.attributes.bedrooms} PN</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Users size={16} className="text-green-500" />
                                <span>{property.attributes.capacity} người</span>
                            </div>
                            {property.attributes.pool && (
                                <div className="flex items-center gap-1">
                                    <Waves size={16} className="text-cyan-500" />
                                    <span>Hồ bơi</span>
                                </div>
                            )}
                            {property.attributes.bbq && (
                                <div className="flex items-center gap-1">
                                    <Flame size={16} className="text-orange-500" />
                                    <span>BBQ</span>
                                </div>
                            )}
                        </div>

                        {/* Rating & Reviews */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-1">
                                <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                <span className="font-bold text-gray-900">{property.rating}</span>
                                <span className="text-gray-400">({property.reviews} đánh giá)</span>
                            </div>
                            <button className="text-blue-600 font-semibold text-sm hover:underline">
                                Xem chi tiết →
                            </button>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}

// ========== MAIN PAGE ==========
export default function HomePage() {
    const store = usePropertyStore();
    const router = useRouter();
    const { user, profile, signOut } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [activeTab, setActiveTab] = useState<'villa' | 'homestay' | 'all'>('all');
    const [filters, setFilters] = useState<SearchFilters>({
        location: "",
        checkIn: "",
        checkOut: "",
        guests: 1,
    });
    const [hasSearched, setHasSearched] = useState(false);
    const [bookedPropertyIds, setBookedPropertyIds] = useState<Set<string>>(new Set());
    const [isSearchingBookings, setIsSearchingBookings] = useState(false);
    const resultsRef = useRef<HTMLDivElement>(null);

    // ===== FILTER LOGIC =====
    const allProperties = store.properties;

    const filteredProperties = useMemo(() => {
        let list: Property[];

        // Tab filter
        if (activeTab === 'villa') list = store.getByType('villa');
        else if (activeTab === 'homestay') list = store.getByType('homestay');
        else list = [...allProperties];

        // Location filter
        if (filters.location) {
            list = list.filter(p =>
                p.location.toLowerCase().includes(filters.location.toLowerCase())
            );
        }

        // Guest capacity filter
        if (filters.guests > 1) {
            list = list.filter(p => p.attributes.capacity >= filters.guests);
        }

        return list;
    }, [activeTab, filters, allProperties, store]);

    const isWeekendSearch = useMemo(() => {
        if (!filters.checkIn || !filters.checkOut) return false;
        const start = new Date(filters.checkIn);
        const end = new Date(filters.checkOut);
        for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
            if (d.getDay() === 6) return true; // Saturday
        }
        return false;
    }, [filters.checkIn, filters.checkOut]);

    const handleSearch = async (newFilters: SearchFilters) => {
        setFilters(newFilters);
        setHasSearched(true);
        setIsSearchingBookings(true);

        const newBookedIds = new Set<string>();

        if (newFilters.checkIn && newFilters.checkOut) {
            try {
                // Find overlapping bookings in DB
                const { data, error } = await supabase
                    .from('bookings')
                    .select('property_id')
                    .in('status', ['approved', 'pending'])
                    .lt('check_in', newFilters.checkOut)
                    .gt('check_out', newFilters.checkIn);

                if (!error && data) {
                    data.forEach(b => newBookedIds.add(b.property_id));
                }

                // Check custom prices closing
                allProperties.forEach(p => {
                    let hasClosed = false;
                    let current = new Date(newFilters.checkIn);
                    const end = new Date(newFilters.checkOut);
                    while (current < end) {
                        const stepStr = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
                        if (p.customPrices && p.customPrices[stepStr] === -1) {
                            hasClosed = true;
                            break;
                        }
                        current.setDate(current.getDate() + 1);
                    }
                    if (hasClosed) {
                        newBookedIds.add(p.id);
                    }
                });
            } catch (err) {
                console.error("Error loading overlapping bookings", err);
            }
        }

        setIsSearchingBookings(false);
        setBookedPropertyIds(newBookedIds);

        // Auto switch tab if location matches
        if (newFilters.location) {
            setActiveTab('all'); // Show all types when searching
        }

        // Scroll to results
        setTimeout(() => {
            resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
    };

    const clearFilters = () => {
        setFilters({ location: "", checkIn: "", checkOut: "", guests: 1 });
        setBookedPropertyIds(new Set());
        setHasSearched(false);
    };

    const hasActiveFilters = filters.location || filters.guests > 1 || filters.checkIn || filters.checkOut;

    return (
        <main className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
            {/* ===== STICKY HEADER ===== */}
            <div className="sticky top-0 z-[100]">
                {/* Header */}
                <header className="relative z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 border-3 border-cyan-700 flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm">MP</span>
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-lg font-bold text-gray-900 leading-tight">Minh Phát</h1>
                                <p className="text-[10px] text-cyan-600 font-medium">Villa & Homestay Vũng Tàu</p>
                            </div>
                        </Link>

                        {/* Navigation Tabs */}
                        <div className="flex bg-gray-100 rounded-full p-1 overflow-x-auto scrollbar-hide max-w-[60%] sm:max-w-none">
                            <button
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === 'all'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                Tất cả
                            </button>
                            <button
                                onClick={() => setActiveTab('villa')}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'villa'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Building size={14} className="text-orange-500 group-hover:text-white" /> Villa
                            </button>
                            <button
                                onClick={() => setActiveTab('homestay')}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'homestay'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Home size={14} className="text-green-600 group-hover:text-white" /> Homestay
                            </button>
                        </div>

                        {/* Auth + Contact */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <a href="tel:0333160365" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm">
                                <Phone size={16} />
                                <span className="font-semibold">0333.160.365</span>
                            </a>

                            <div className="relative">
                                <button
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 p-2 md:px-3 md:py-2 rounded-full transition-all"
                                >
                                    {user ? (
                                        <>
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                                                <span className="text-white text-xs font-bold">
                                                    {(profile?.name || user.email || '?').charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="hidden md:block text-sm font-semibold text-gray-700 max-w-[100px] truncate">
                                                {profile?.name || user.email?.split('@')[0]}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                                                <UserCircle size={16} className="text-white" />
                                            </div>
                                            <span className="hidden md:block text-sm font-semibold text-gray-700">Tài khoản</span>
                                        </>
                                    )}
                                    <ChevronDown size={14} className={`hidden md:block text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                                </button>

                                {/* 📋 Dropdown Menu */}
                                {showUserMenu && (
                                    <>
                                        {/* Overlay để click bên ngoài đóng menu */}
                                        <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />

                                        <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 py-2 w-56 z-50 animate-in fade-in slide-in-from-top-2">
                                            {user ? (
                                                <>
                                                    <div className="py-1">
                                                        <button
                                                            onClick={() => { router.push('/messages'); setShowUserMenu(false); }}
                                                            className="w-full px-5 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3.5 transition-colors font-medium"
                                                        >
                                                            <MessageSquare size={18} className="text-gray-400" />
                                                            <span>Tin nhắn</span>
                                                        </button>
                                                        <button
                                                            onClick={() => { router.push('/trips'); setShowUserMenu(false); }}
                                                            className="w-full px-5 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3.5 transition-colors font-medium"
                                                        >
                                                            <Luggage size={18} className="text-gray-400" />
                                                            <span>Đơn booking</span>
                                                        </button>
                                                        <button
                                                            onClick={() => { router.push('/profile'); setShowUserMenu(false); }}
                                                            className="w-full px-5 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3.5 transition-colors font-medium"
                                                        >
                                                            <UserCircle size={18} className="text-gray-400" />
                                                            <span>Hồ sơ</span>
                                                        </button>
                                                    </div>

                                                    <div className="border-t border-gray-100 my-1" />

                                                    <div className="py-1">
                                                        <button
                                                            onClick={async () => { await signOut(); setShowUserMenu(false); }}
                                                            className="w-full px-5 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-3.5 font-bold transition-colors"
                                                        >
                                                            <LogOut size={18} className="text-gray-400" />
                                                            <span>Đăng xuất</span>
                                                        </button>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="py-1">
                                                    <button
                                                        onClick={() => { router.push('/login'); setShowUserMenu(false); }}
                                                        className="w-full px-5 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-3.5 font-bold transition-colors"
                                                    >
                                                        <LogIn size={18} className="text-gray-400" />
                                                        <span>Đăng nhập</span>
                                                    </button>
                                                    <button
                                                        onClick={() => { router.push('/register'); setShowUserMenu(false); }}
                                                        className="w-full px-5 py-3 text-left text-sm text-gray-800 hover:bg-gray-50 flex items-center gap-3.5 font-bold transition-colors"
                                                    >
                                                        <UserCircle size={18} className="text-cyan-500" />
                                                        <span>Đăng ký</span>
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </header>
            </div>

            {/* Search Bar - Sticky on Desktop only */}
            <div className="md:sticky md:top-16 z-40 bg-gradient-to-b from-cyan-50/95 md:to-cyan-50/80 md:backdrop-blur-md py-4 px-4 border-b border-cyan-100/50">
                <div className="max-w-4xl mx-auto block">
                    <SearchBar onSearch={handleSearch} />
                </div>
            </div>

            {/* ===== HERO TEXT (only when no search) ===== */}
            {
                !hasSearched && (
                    <section className="relative py-12 px-4 text-center overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-500/10"></div>
                        <div className="relative z-10 max-w-4xl mx-auto">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">
                                {activeTab === 'villa' ? '🏠 Biệt Thự Sang Trọng'
                                    : activeTab === 'homestay' ? '🏡 Homestay Ấm Cúng'
                                        : '🏖️ Villa & Homestay Vũng Tàu'}
                            </h2>
                            <p className="text-lg text-gray-600 mb-6">
                                Trải nghiệm kỳ nghỉ đẳng cấp với hồ bơi riêng, view biển tuyệt đẹp
                            </p>
                            <div className="flex justify-center gap-4 flex-wrap">
                                <div className="bg-white px-5 py-2.5 rounded-full shadow-md">
                                    <span className="text-xl font-bold text-blue-600">{allProperties.length}</span>
                                    <span className="text-gray-500 ml-2 text-sm">căn cho thuê</span>
                                </div>
                                <div className="bg-white px-5 py-2.5 rounded-full shadow-md">
                                    <span className="text-xl font-bold text-green-600">24/7</span>
                                    <span className="text-gray-500 ml-2 text-sm">hỗ trợ</span>
                                </div>
                            </div>
                        </div>
                    </section>
                )
            }

            {/* ===== ACTIVE FILTERS BAR ===== */}
            {
                hasActiveFilters && (
                    <div ref={resultsRef} className="max-w-7xl mx-auto px-4 pt-6">
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <SlidersHorizontal size={16} />
                                <span className="font-semibold">Đang lọc:</span>
                            </div>

                            {filters.location && (
                                <span className="inline-flex items-center gap-1.5 bg-cyan-100 text-cyan-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                                    📍 {filters.location}
                                    <button onClick={() => setFilters(f => ({ ...f, location: "" }))} className="hover:text-cyan-900">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}

                            {filters.checkIn && (
                                <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                                    📅 {new Date(filters.checkIn).toLocaleDateString("vi-VN")}
                                    {filters.checkOut && ` → ${new Date(filters.checkOut).toLocaleDateString("vi-VN")}`}
                                    <button onClick={() => setFilters(f => ({ ...f, checkIn: "", checkOut: "" }))} className="hover:text-blue-900">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}

                            {filters.guests > 1 && (
                                <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-sm font-semibold">
                                    👥 {filters.guests} khách
                                    <button onClick={() => setFilters(f => ({ ...f, guests: 1 }))} className="hover:text-green-900">
                                        <X size={14} />
                                    </button>
                                </span>
                            )}

                            <button onClick={clearFilters} className="text-sm text-gray-500 hover:text-red-500 font-semibold underline transition-colors">
                                Xóa tất cả
                            </button>

                            <span className="ml-auto text-sm text-gray-500">
                                <strong className="text-gray-900">{filteredProperties.length}</strong> kết quả
                            </span>
                        </div>
                    </div>
                )
            }

            {/* ===== PROPERTIES GRID ===== */}
            <section className={`max-w-7xl mx-auto px-4 ${hasActiveFilters ? 'py-6' : 'py-12'}`}>
                {filteredProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} isWeekend={isWeekendSearch} isBooked={bookedPropertyIds.has(property.id)} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <p className="text-6xl mb-4">😕</p>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy kết quả</h3>
                        <p className="text-gray-500 mb-6">Thử thay đổi bộ lọc hoặc tìm kiếm khác.</p>
                        <button
                            onClick={clearFilters}
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl transition-all"
                        >
                            Xóa bộ lọc
                        </button>
                    </div>
                )}
            </section>


            {/* ===== FOOTER ===== */}
            <footer className="bg-gray-900 text-white py-12 mt-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 border-2 border-cyan-300 flex items-center justify-center">
                                    <span className="text-white font-bold">MP</span>
                                </div>
                                <div>
                                    <h4 className="font-bold">Minh Phát Villa</h4>
                                    <p className="text-sm text-gray-400">EST. 2026</p>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm">
                                Chuyên cho thuê Villa & Homestay cao cấp tại Vũng Tàu
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
                                    <span className="text-sm font-bold">f</span>
                                </a>
                                <a href="https://www.tiktok.com/@minhphatvilla" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-black rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                                    <span className="text-sm font-bold">TK</span>
                                </a>
                                <a href="https://zalo.me/0333160365" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer">
                                    <span className="text-sm font-bold">Z</span>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
                        © 2026 Minh Phát Villa & Homestay. All rights reserved.
                    </div>
                </div>
            </footer>
        </main >
    );
}
