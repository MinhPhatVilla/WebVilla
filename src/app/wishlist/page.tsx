"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePropertyStore } from "@/lib/property-store";
import { useAuth } from "@/lib/auth-context";
import { Property } from "@/lib/mock-data";
import { ArrowLeft, MapPin, Heart, BedDouble, Users, Waves, Flame, Star, Loader2, Home } from "lucide-react";

// ========== PROPERTY CARD ==========
// Đã được copy từ trang chủ page.tsx để dùng lại ở đây
function PropertyCard({ property }: { property: Property }) {
    return (
        <Link href={`/${property.type}/${property.id}`} className="group">
            <div className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:border-gray-200 hover:-translate-y-2">
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
                            <span className="text-sm font-bold text-amber-600">Liên hệ Zalo</span>
                        ) : (
                            <>
                                <span className="text-lg font-bold text-blue-900">
                                    {property.price.weekday.toLocaleString('vi-VN')}đ
                                </span>
                                <span className="text-xs text-gray-500">/đêm</span>
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
    );
}

// ========== WISHLIST PAGE ==========
export default function WishlistPage() {
    const router = useRouter();
    const store = usePropertyStore();
    const { user, loading } = useAuth();

    const [wishlist, setWishlist] = useState<Property[]>([]);
    const [pageLoading, setPageLoading] = useState(true);

    // Redirect nếu chưa đăng nhập
    useEffect(() => {
        if (!loading && !user) {
            router.push("/login");
        }
    }, [user, loading, router]);

    useEffect(() => {
        const fetchWishlist = () => {
            const savedList = JSON.parse(localStorage.getItem('webvilla_wishlist') || '[]');
            // store.properties may be initially empty when loading from supabase
            if (store.properties.length > 0) {
                const list = store.properties.filter(p => savedList.includes(p.id));
                setWishlist(list);
                setPageLoading(false);
            } else if (store.loading) {
                // Keep loading if store is loading
                setPageLoading(true);
            } else {
                // If store is not loading and has no properties or wishlist loaded
                setPageLoading(false);
            }
        };

        fetchWishlist();
    }, [store.properties, store.loading]);

    // Hiển thị trạng thái đang tải
    if (loading || pageLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <main className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
            {/* ===== HEADER ===== */}
            <header className="bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span className="font-semibold text-sm">Quay lại</span>
                    </button>
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">MP</span>
                        </div>
                        <span className="hidden sm:block text-sm font-bold text-gray-900">Minh Phát Villa</span>
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="text-center mb-16 relative">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 font-bold text-sm tracking-widest uppercase mb-4">
                        Danh sách lưu trữ
                    </span>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight flex items-center justify-center gap-3">
                        <Heart className="text-pink-500 fill-pink-500" size={40} />
                        Villa Yêu Thích
                    </h1>
                    <p className="mt-4 text-xl text-gray-500 font-medium">
                        Bạn đã lưu {wishlist.length} căn lý tưởng
                    </p>
                </div>

                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {wishlist.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-3xl shadow-lg border border-gray-100 max-w-2xl mx-auto">
                        <div className="text-6xl mb-6 flex justify-center">
                            <Heart className="text-gray-300 pointer-events-none" size={64} />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">
                            Chưa có mục nào được lưu
                        </h3>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                            Khi tìm từ khóa hoặc lướt thấy một chỗ ở ưng ý trên Web, bạn hãy nhấp vào biểu tượng trái tim để lưu lại nhé.
                        </p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
                        >
                            <Home size={20} />
                            Khám phá nơi ở ngay
                        </Link>
                    </div>
                )}
            </div>
        </main>
    );
}
