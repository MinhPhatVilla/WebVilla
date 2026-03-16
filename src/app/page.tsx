"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Property } from "@/types/property";
import { usePropertyStore } from "@/lib/property-store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Phone, X, SlidersHorizontal, Home, Building, Store } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import PropertyCard from "@/components/PropertyCard";
import UserMenu from "@/components/UserMenu";
import TikTokBanner from "@/components/TikTokBanner";
import HeroSection from "@/components/HeroSection";
import TikTokVideoSection from "@/components/TikTokVideoSection";
import Footer from "@/components/Footer";

// ========== FILTERS TYPE ==========
interface SearchFilters {
    location: string;
    checkIn: string;
    checkOut: string;
    guests: number;
}

// ========== MAIN PAGE ==========
export default function HomePage() {
    const store = usePropertyStore();
    const { user, profile, signOut } = useAuth();
    const [activeTab, setActiveTab] = useState<'villa' | 'homestay' | 'nha-pho' | 'all'>('all');
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
    const [isScrolled, setIsScrolled] = useState(false);

    // 🔍 Theo dõi scroll để thu nhỏ SearchBar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 80);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // ===== FILTER LOGIC =====
    const allProperties = store.properties;

    const filteredProperties = useMemo(() => {
        let list: Property[];

        // Tab filter
        if (activeTab === 'villa') list = store.getByType('villa');
        else if (activeTab === 'homestay') list = store.getByType('homestay');
        else if (activeTab === 'nha-pho') list = store.getByType('nha-pho');
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
            setActiveTab('all');
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
                <header className="relative z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <Image src="/logo.png" alt="Minh Phát Villa" width={44} height={44} className="rounded-full shadow-lg" />
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
                            <button
                                onClick={() => setActiveTab('nha-pho')}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${activeTab === 'nha-pho'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                <Store size={14} className="text-amber-600 group-hover:text-white" /> Nhà Phố
                            </button>
                        </div>

                        {/* Auth + Contact */}
                        <div className="flex items-center gap-2 md:gap-3">
                            <a href="tel:0333160365" className="hidden md:flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors text-sm">
                                <Phone size={16} />
                                <span className="font-semibold">0333.160.365</span>
                            </a>
                            <UserMenu user={user} profileName={profile?.name} onSignOut={signOut} />
                        </div>
                    </div>
                </header>
            </div>

            {/* Search Bar */}
            <div className={`relative z-40 md:sticky md:top-16 bg-gradient-to-b from-cyan-50/95 md:to-cyan-50/80 md:backdrop-blur-md px-4 border-b border-cyan-100/50 transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
                <div className={`max-w-4xl mx-auto block transition-transform duration-300 ${isScrolled ? 'scale-[0.92] origin-center' : 'scale-100'}`}>
                    <SearchBar onSearch={handleSearch} isCompact={isScrolled} />
                </div>
            </div>

            {/* TikTok Banner */}
            <TikTokBanner />

            {/* Hero Section */}
            {!hasSearched && (
                <HeroSection activeTab={activeTab} totalProperties={allProperties.length} />
            )}

            {/* TikTok Video Section */}
            <TikTokVideoSection properties={allProperties} />

            {/* Active Filters Bar */}
            {hasActiveFilters && (
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
            )}

            {/* Properties Grid */}
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

            {/* Footer */}
            <Footer />
        </main>
    );
}
