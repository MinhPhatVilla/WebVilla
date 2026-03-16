"use client";

import Image from "next/image";
import Link from "next/link";
import { Property } from "@/types/property";
import { MapPin, Star, Users, BedDouble, Waves, Flame } from "lucide-react";

interface PropertyCardProps {
    property: Property;
    isWeekend?: boolean;
    isBooked?: boolean;
}

export default function PropertyCard({ property, isWeekend = false, isBooked = false }: PropertyCardProps) {
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
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            loading="lazy"
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
                        <div className={`absolute top-4 left-4 text-white px-3 py-1 rounded-full text-xs font-bold uppercase shadow-lg ${property.type === 'villa' ? 'bg-gradient-to-r from-cyan-500 to-blue-600' : property.type === 'homestay' ? 'bg-gradient-to-r from-violet-500 to-purple-600' : 'bg-gradient-to-r from-amber-500 to-orange-600'}`}>
                            {property.type === 'nha-pho' ? 'Nhà Phố' : property.type}
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
