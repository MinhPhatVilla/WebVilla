"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
    Plus, Search, Filter, Edit2, Trash2, Eye, MoreHorizontal,
    Star, MapPin, Users, BedDouble, ChevronDown, ChevronLeft, ChevronRight, X, Check,
    Wifi, Car, UtensilsCrossed, Flame, Music, Waves, Snowflake, TreePine, Calendar,
    Gamepad2, Dribbble, Target
} from "lucide-react";
import { Property } from "@/types/property";
import { usePropertyStore } from "@/lib/property-store";
import { supabase } from "@/lib/supabase";
import AddPropertyModal, { ImageFile } from "./AddPropertyModal";

async function uploadImageFiles(files: ImageFile[]): Promise<string[]> {
    return Promise.all(files.map(async f => {
        // If it's a new file (has size > 0)
        if (f.file.size > 0 && f.preview.startsWith('blob:')) {
            const ext = f.file.name.split('.').pop();
            const fname = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;
            const { error } = await supabase.storage.from('properties').upload(fname, f.file);
            if (!error) {
                return supabase.storage.from('properties').getPublicUrl(fname).data.publicUrl;
            }
        }
        return f.preview; // Fallback to existing URL or temporary blob
    }));
}

// ── Icons for amenities ──
const amenityIcons: Record<string, { icon: React.ReactNode; label: string }> = {
    pool: { icon: <Waves size={14} />, label: "Hồ bơi" },
    bbq: { icon: <Flame size={14} />, label: "BBQ" },
    wifi: { icon: <Wifi size={14} />, label: "WiFi" },
    billiards: { icon: <Target size={14} />, label: "Bida" },
    kitchen: { icon: <UtensilsCrossed size={14} />, label: "Bếp" },
    aircon: { icon: <Snowflake size={14} />, label: "Máy lạnh" },
    karaoke: { icon: <Music size={14} />, label: "Karaoke" },
    arcade: { icon: <Gamepad2 size={14} />, label: "Máy game trẻ em" },
    foosball: { icon: <Dribbble size={14} />, label: "Bi lắc" },
};

export default function PropertiesPage() {
    const store = usePropertyStore();
    const allProps = store.properties;
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<"all" | "villa" | "homestay">("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [showDetailModal, setShowDetailModal] = useState<Property | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState<Property | null>(null);
    const [deleteSuccess, setDeleteSuccess] = useState(false);

    const filtered = useMemo(() => {
        return allProps.filter(p => {
            const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.location.toLowerCase().includes(searchTerm.toLowerCase());
            const matchType = filterType === "all" || p.type === filterType;
            return matchSearch && matchType;
        });
    }, [allProps, searchTerm, filterType]);

    const fmtPrice = (n: number) => n.toLocaleString("vi-VN");

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-sm text-gray-500">Tổng cộng <span className="font-bold text-gray-900">{allProps.length}</span> nơi ở</p>
                </div>
                <button onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-5 py-3 rounded-xl font-bold flex items-center gap-2 hover:shadow-lg hover:shadow-cyan-200 transition-all active:scale-[0.98]">
                    <Plus size={18} /> Thêm nơi ở mới
                </button>
            </div>

            {/* Search & Filter bar */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-3">
                {/* Search */}
                <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2.5">
                    <Search size={16} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo tên, địa điểm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent text-sm font-medium text-gray-700 focus:outline-none w-full placeholder-gray-400"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Type filter */}
                <div className="flex items-center gap-2">
                    {([
                        { key: "all", label: "Tất cả" },
                        { key: "villa", label: "Villa" },
                        { key: "homestay", label: "Homestay" },
                    ] as const).map(f => (
                        <button
                            key={f.key}
                            onClick={() => setFilterType(f.key)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${filterType === f.key
                                ? "bg-gray-900 text-white"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>

                {/* View mode */}
                <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-white shadow-sm" : "text-gray-400"}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect width="7" height="7" rx="1.5" /><rect x="9" width="7" height="7" rx="1.5" /><rect y="9" width="7" height="7" rx="1.5" /><rect x="9" y="9" width="7" height="7" rx="1.5" /></svg>
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-white shadow-sm" : "text-gray-400"}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect width="16" height="3" rx="1.5" /><rect y="5" width="16" height="3" rx="1.5" /><rect y="10" width="16" height="3" rx="1.5" /></svg>
                    </button>
                </div>
            </div>

            {/* Properties Grid / List */}
            {filtered.length === 0 ? (
                <div className="text-center py-16">
                    <span className="text-5xl">🔍</span>
                    <p className="text-lg font-bold text-gray-700 mt-4">Không tìm thấy kết quả</p>
                    <p className="text-sm text-gray-400 mt-1">Thử thay đổi từ khóa tìm kiếm</p>
                </div>
            ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(p => (
                        <PropertyCard
                            key={p.id}
                            property={p}
                            onView={() => setShowDetailModal(p)}
                            onEdit={() => setShowEditModal(p)}
                            onDelete={() => setShowDeleteModal(p.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(p => (
                        <PropertyRow
                            key={p.id}
                            property={p}
                            onView={() => setShowDetailModal(p)}
                            onEdit={() => setShowEditModal(p)}
                            onDelete={() => setShowDeleteModal(p.id)}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowDeleteModal(null); setDeleteSuccess(false); }}>
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        {deleteSuccess ? (
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4 animate-bounce">
                                    <Check size={28} className="text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Đã xóa thành công!</h3>
                                <p className="text-sm text-gray-500">Nơi ở đã được xóa và trang chính đã cập nhật.</p>
                                <button onClick={() => { setShowDeleteModal(null); setDeleteSuccess(false); }}
                                    className="mt-4 px-6 py-3 rounded-xl bg-gray-900 text-white font-bold hover:bg-gray-800 transition-all">
                                    Đóng
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="text-center">
                                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                                        <Trash2 size={28} className="text-red-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Xác nhận xóa?</h3>
                                    <p className="text-sm text-gray-500">Hành động này không thể hoàn tác. Nơi ở sẽ bị xóa vĩnh viễn khỏi website.</p>
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button onClick={() => setShowDeleteModal(null)}
                                        className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition-all">
                                        Hủy bỏ
                                    </button>
                                    <button onClick={async () => {
                                        try {
                                            await store.deleteProperty(showDeleteModal);
                                            setDeleteSuccess(true);
                                        } catch {
                                            alert("Xóa thất bại!");
                                        }
                                    }}
                                        className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all">
                                        Xóa ngay
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Detail Modal with Calendar */}
            {showDetailModal && (
                <PropertyDetailModal
                    property={showDetailModal}
                    onClose={() => setShowDetailModal(null)}
                    fmtPrice={fmtPrice}
                />
            )}

            {/* Add Property Modal */}
            {showAddModal && (
                <AddPropertyModal
                    onClose={() => setShowAddModal(false)}
                    onSubmit={async (data) => {
                        const uploadedImageUrls = await uploadImageFiles(data.imageFiles);
                        const newProperty: Property = {
                            id: "",
                            name: data.name,
                            type: data.type,
                            description: data.description || `${data.type === 'villa' ? 'Biệt thự' : 'Homestay'} ${data.name} tại ${data.location}`,
                            isContactForPrice: data.isContactForPrice,
                            contactPriceWeekday: data.contactPriceWeekday,
                            contactPriceWeekend: data.contactPriceWeekend,
                            customPrices: data.customPrices,
                            price: { weekday: data.priceWeekday, weekend: data.priceWeekend },
                            attributes: {
                                bedrooms: data.bedrooms,
                                beds: data.beds,
                                bathrooms: data.bathrooms,
                                capacity: data.capacity,
                                pool: data.amenities.includes("pool"),
                                bbq: data.amenities.includes("bbq"),
                                wifi: data.amenities.includes("wifi"),
                                billiards: data.amenities.includes("billiards"),
                                kitchen: data.amenities.includes("kitchen"),
                                aircon: data.amenities.includes("aircon"),
                                karaoke: data.amenities.includes("karaoke"),
                                arcade: data.amenities.includes("arcade"),
                                foosball: data.amenities.includes("foosball"),
                            },
                            images: uploadedImageUrls.length > 0 ? uploadedImageUrls : [
                                "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop"
                            ],
                            videoUrl: "",
                            location: data.location,
                            address: data.address,
                            rating: 5.0,
                            reviews: 0,
                        };
                        try {
                            await store.addProperty(newProperty);
                            setShowAddModal(false);
                        } catch {
                            alert("Thêm nơi ở thất bại!");
                        }
                    }}
                />
            )}

            {/* Edit Property Modal */}
            {showEditModal && (
                <AddPropertyModal
                    editMode
                    initialData={showEditModal}
                    onClose={() => setShowEditModal(null)}
                    onSubmit={async (data) => {
                        const uploadedImageUrls = await uploadImageFiles(data.imageFiles);
                        try {
                            await store.updateProperty(showEditModal.id, {
                                name: data.name,
                                type: data.type,
                                description: data.description || showEditModal.description,
                                isContactForPrice: data.isContactForPrice,
                                contactPriceWeekday: data.contactPriceWeekday,
                                contactPriceWeekend: data.contactPriceWeekend,
                                customPrices: data.customPrices,
                                price: { weekday: data.priceWeekday, weekend: data.priceWeekend },
                                attributes: {
                                    bedrooms: data.bedrooms,
                                    beds: data.beds,
                                    bathrooms: data.bathrooms,
                                    capacity: data.capacity,
                                    pool: data.amenities.includes("pool"),
                                    bbq: data.amenities.includes("bbq"),
                                    wifi: data.amenities.includes("wifi"),
                                    billiards: data.amenities.includes("billiards"),
                                    kitchen: data.amenities.includes("kitchen"),
                                    aircon: data.amenities.includes("aircon"),
                                    karaoke: data.amenities.includes("karaoke"),
                                    arcade: data.amenities.includes("arcade"),
                                    foosball: data.amenities.includes("foosball"),
                                },
                                images: uploadedImageUrls.length > 0 ? uploadedImageUrls : showEditModal.images,
                                location: data.location,
                                address: data.address,
                            });
                            setShowEditModal(null);
                        } catch {
                            alert("Cập nhật thất bại!");
                        }
                    }}
                />
            )}
        </div>
    );
}

// ── Grid Card ──
function PropertyCard({ property: p, onView, onEdit, onDelete }: { property: Property; onView: () => void; onEdit: () => void; onDelete: () => void }) {
    const [showMenu, setShowMenu] = useState(false);
    const fmtPrice = (n: number) => n.toLocaleString("vi-VN");

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all group">
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
                <Image src={p.images[0]} alt={p.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.type === "villa" ? "bg-cyan-500 text-white" : "bg-violet-500 text-white"
                        }`}>
                        {p.type.toUpperCase()}
                    </span>
                </div>
                <div className="absolute top-3 right-3">
                    <div className="relative">
                        <button
                            onClick={() => setShowMenu(!showMenu)}
                            className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
                        >
                            <MoreHorizontal size={16} className="text-gray-600" />
                        </button>
                        {showMenu && (
                            <div className="absolute right-0 top-10 bg-white rounded-xl shadow-xl border border-gray-100 py-1 w-40 z-10">
                                <button onClick={() => { onView(); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                    <Eye size={14} /> Xem chi tiết
                                </button>
                                <button onClick={() => { onEdit(); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                    <Edit2 size={14} /> Chỉnh sửa
                                </button>
                                <button onClick={() => { onDelete(); setShowMenu(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-red-50 flex items-center gap-2 text-red-600">
                                    <Trash2 size={14} /> Xóa
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-gray-900 truncate">{p.name}</h3>
                    <div className="flex items-center gap-0.5 text-xs text-gray-500 flex-shrink-0 ml-2">
                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                        <span className="font-bold">{p.rating}</span>
                    </div>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                    <MapPin size={11} /> {p.location}
                </p>

                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1"><BedDouble size={12} /> {p.attributes.bedrooms}</span>
                    <span className="flex items-center gap-1"><Users size={12} /> {p.attributes.capacity}</span>
                    {p.attributes.pool && <span className="flex items-center gap-1"><Waves size={12} /> Hồ bơi</span>}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                        {p.isContactForPrice ? (
                            <span className="text-sm font-bold text-amber-600">
                                {p.contactPriceWeekday ? `~ ${p.contactPriceWeekday}` : "Liên hệ báo giá"}
                            </span>
                        ) : (
                            <>
                                <span className="text-lg font-extrabold text-gray-900">{fmtPrice(p.price.weekday)}đ</span>
                                <span className="text-xs text-gray-400 ml-1">/đêm</span>
                            </>
                        )}
                    </div>
                    <button
                        onClick={onView}
                        className="px-3 py-1.5 rounded-lg bg-cyan-50 text-cyan-600 text-xs font-bold hover:bg-cyan-100 transition-colors"
                    >
                        Chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── List Row ──
function PropertyRow({ property: p, onView, onEdit, onDelete }: { property: Property; onView: () => void; onEdit: () => void; onDelete: () => void }) {
    const fmtPrice = (n: number) => n.toLocaleString("vi-VN");

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-4 hover:shadow-md transition-all">
            <div className="w-20 h-16 rounded-xl overflow-hidden relative flex-shrink-0">
                <Image src={p.images[0]} alt={p.name} fill className="object-cover" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${p.type === "villa" ? "bg-cyan-100 text-cyan-700" : "bg-violet-100 text-violet-700"
                        }`}>{p.type}</span>
                    <h3 className="font-bold text-gray-900 text-sm truncate">{p.name}</h3>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1">
                    <MapPin size={10} /> {p.location} · <BedDouble size={10} /> {p.attributes.bedrooms} PN · <Users size={10} /> {p.attributes.capacity} khách
                </p>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-500 flex-shrink-0">
                <Star size={13} className="text-yellow-500 fill-yellow-500" />
                <span className="font-bold text-gray-900">{p.rating}</span>
            </div>
            <div className="text-right flex-shrink-0">
                {p.isContactForPrice ? (
                    <p className="font-bold text-amber-600 text-sm mt-2">
                        {p.contactPriceWeekday ? `~ ${p.contactPriceWeekday}` : "Liên hệ báo giá"}
                    </p>
                ) : (
                    <>
                        <p className="font-bold text-gray-900">{fmtPrice(p.price.weekday)}đ</p>
                        <p className="text-xs text-gray-400">/đêm</p>
                    </>
                )}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={onView} className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-cyan-100 flex items-center justify-center transition-colors">
                    <Eye size={16} className="text-gray-500" />
                </button>
                <button onClick={onEdit} className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                    <Edit2 size={16} className="text-gray-500" />
                </button>
                <button onClick={onDelete} className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors">
                    <Trash2 size={16} className="text-red-400" />
                </button>
            </div>
        </div>
    );
}

// ── Mock Bookings for Calendar ──
interface BookingDate {
    start: string;
    end: string;
    guest: string;
    status: "confirmed" | "pending" | "cancelled";
}

const mockPropertyBookings: Record<string, BookingDate[]> = {
    "villa-ocean-view": [
        { start: "2026-03-01", end: "2026-03-05", guest: "Nguyễn Văn Tuấn", status: "confirmed" },
        { start: "2026-03-10", end: "2026-03-12", guest: "Phạm Minh Anh", status: "pending" },
        { start: "2026-03-18", end: "2026-03-22", guest: "Lê Hoàng Phúc", status: "confirmed" },
        { start: "2026-04-05", end: "2026-04-08", guest: "Trần Thị Mai", status: "confirmed" },
        { start: "2026-04-15", end: "2026-04-17", guest: "Võ Thanh Sơn", status: "pending" },
    ],
    "villa-sunset-bay": [
        { start: "2026-03-05", end: "2026-03-08", guest: "Lê Hoàng Phúc", status: "confirmed" },
        { start: "2026-03-20", end: "2026-03-23", guest: "Ngô Thị Hương", status: "confirmed" },
        { start: "2026-04-01", end: "2026-04-03", guest: "Đặng Quốc Bảo", status: "pending" },
    ],
    "villa-garden-paradise": [
        { start: "2026-03-15", end: "2026-03-18", guest: "Võ Thanh Sơn", status: "cancelled" },
        { start: "2026-03-25", end: "2026-03-28", guest: "Nguyễn Văn Tuấn", status: "confirmed" },
    ],
    "cozy-nest-homestay": [
        { start: "2026-02-28", end: "2026-03-02", guest: "Trần Thị Mai", status: "pending" },
        { start: "2026-03-08", end: "2026-03-10", guest: "Phạm Minh Anh", status: "confirmed" },
        { start: "2026-04-10", end: "2026-04-13", guest: "Ngô Thị Hương", status: "confirmed" },
    ],
};

const bookingStatusStyles: Record<string, { bg: string; text: string; label: string }> = {
    confirmed: { bg: "bg-green-400", text: "text-white", label: "Đã xác nhận" },
    pending: { bg: "bg-amber-400", text: "text-white", label: "Chờ thanh toán" },
    cancelled: { bg: "bg-red-300", text: "text-white", label: "Đã hủy" },
};

// ── Calendar helpers ──
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1; // Monday = 0
}

function formatDateKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function isWeekend(y: number, m: number, d: number) {
    const day = new Date(y, m, d).getDay();
    return day === 6; // Only Saturday is weekend
}

const MONTH_NAMES = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

// ── Detail Modal with Calendar ──
function PropertyDetailModal({ property, onClose, fmtPrice }: { property: Property; onClose: () => void; fmtPrice: (n: number) => string }) {
    const now = new Date();
    const [viewMonth, setViewMonth] = useState(now.getMonth());
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [hoveredBooking, setHoveredBooking] = useState<BookingDate | null>(null);

    const bookings = mockPropertyBookings[property.id] || [];

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    // Build date -> booking map
    const dateMap = useMemo(() => {
        const map: Record<string, BookingDate> = {};
        bookings.forEach(b => {
            if (b.status === "cancelled") return;
            const start = new Date(b.start);
            const end = new Date(b.end);
            for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
                map[d.toISOString().split("T")[0]] = b;
            }
        });
        return map;
    }, [bookings]);

    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const today = new Date();
    const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());

    // Stats
    const bookedDays = Object.keys(dateMap).filter(k => {
        const d = new Date(k);
        return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    }).length;
    const occupancy = daysInMonth > 0 ? Math.round((bookedDays / daysInMonth) * 100) : 0;

    // Build calendar grid
    const calendarCells = [];
    for (let i = 0; i < firstDay; i++) calendarCells.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="sticky top-0 bg-white/95 backdrop-blur-md rounded-t-3xl px-6 py-4 border-b border-gray-100 z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-10 rounded-xl overflow-hidden relative flex-shrink-0">
                            <Image src={property.images[0]} alt={property.name} fill className="object-cover" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">{property.name}</h3>
                            <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} /> {property.location}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    {/* Info row */}
                    <div className="flex flex-wrap items-center gap-3">
                        <span className={`px-3 py-1 rounded-full font-bold text-xs uppercase ${property.type === "villa" ? "bg-cyan-100 text-cyan-700" : "bg-violet-100 text-violet-700"
                            }`}>{property.type}</span>
                        <span className="flex items-center gap-1 text-sm"><Star size={14} className="text-yellow-500 fill-yellow-500" /> {property.rating}</span>
                        <span className="text-sm text-gray-500">·</span>
                        <span className="flex items-center gap-1 text-sm text-gray-500"><BedDouble size={14} /> {property.attributes.bedrooms} PN</span>
                        <span className="flex items-center gap-1 text-sm text-gray-500"><Users size={14} /> {property.attributes.capacity} khách</span>
                        <div className="ml-auto flex gap-2">
                            {property.isContactForPrice ? (
                                <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-xs font-bold">Liên hệ báo giá qua Zalo</span>
                            ) : (
                                <>
                                    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg text-xs font-bold">{fmtPrice(property.price.weekday)}đ/đêm</span>
                                    <span className="bg-rose-50 text-rose-700 px-3 py-1 rounded-lg text-xs font-bold">CK: {fmtPrice(property.price.weekend)}đ</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* ─── BOOKING CALENDAR ─── */}
                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                        {/* Calendar Header */}
                        <div className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-3">
                            <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
                                <ChevronLeft size={16} />
                            </button>
                            <div className="text-center">
                                <h4 className="text-white font-bold text-lg">
                                    <Calendar size={16} className="inline mr-2 mb-0.5" />
                                    {MONTH_NAMES[viewMonth]} {viewYear}
                                </h4>
                            </div>
                            <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Stats bar */}
                        <div className="flex items-center gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full" style={{ width: `${occupancy}%` }} />
                                </div>
                                <span className="text-xs font-bold text-gray-700">{occupancy}%</span>
                            </div>
                            <span className="text-xs text-gray-500">{bookedDays}/{daysInMonth} ngày đã đặt</span>
                            <span className="text-xs text-gray-500">·</span>
                            <span className="text-xs text-gray-500">{bookings.filter(b => b.status !== "cancelled").length} đơn</span>
                        </div>

                        {/* Day names */}
                        <div className="grid grid-cols-7 px-3 pt-3">
                            {DAY_NAMES.map(d => (
                                <div key={d} className={`text-center text-xs font-bold py-1 ${d === "T7" ? "text-rose-400" : "text-gray-400"
                                    }`}>{d}</div>
                            ))}
                        </div>

                        {/* Calendar Grid */}
                        <div className="grid grid-cols-7 px-3 pb-4 gap-1">
                            {calendarCells.map((day, i) => {
                                if (day === null) return <div key={`e-${i}`} />;

                                const dateKey = formatDateKey(viewYear, viewMonth, day);
                                const booking = dateMap[dateKey];
                                const weekend = isWeekend(viewYear, viewMonth, day);
                                const isToday = dateKey === todayKey;
                                const isPast = new Date(dateKey) < new Date(todayKey);

                                // Check if start or end of a booking range
                                const isStart = booking && booking.start === dateKey;
                                const prevDateKey = formatDateKey(viewYear, viewMonth, day - 1);
                                const nextDateKey = formatDateKey(viewYear, viewMonth, day + 1);
                                const prevBooked = dateMap[prevDateKey] === booking;
                                const nextBooked = dateMap[nextDateKey] === booking;

                                let bgClass = "bg-white hover:bg-gray-50";
                                let textClass = weekend ? "text-rose-500" : "text-gray-700";
                                let roundClass = "rounded-lg";

                                if (isPast && !booking) {
                                    textClass = "text-gray-300";
                                }

                                if (booking) {
                                    const st = bookingStatusStyles[booking.status];
                                    bgClass = st.bg;
                                    textClass = st.text;
                                    // Continuous bar rounding
                                    if (isStart && nextBooked) roundClass = "rounded-l-lg rounded-r-none";
                                    else if (!prevBooked && nextBooked) roundClass = "rounded-l-lg rounded-r-none";
                                    else if (prevBooked && nextBooked) roundClass = "rounded-none";
                                    else if (prevBooked && !nextBooked) roundClass = "rounded-r-lg rounded-l-none";
                                }

                                return (
                                    <div
                                        key={day}
                                        className={`relative h-10 flex items-center justify-center text-sm font-semibold cursor-pointer transition-all ${bgClass} ${textClass} ${roundClass}`}
                                        onMouseEnter={() => booking && setHoveredBooking(booking)}
                                        onMouseLeave={() => setHoveredBooking(null)}
                                    >
                                        {isToday && (
                                            <div className={`absolute inset-0 ${booking ? '' : 'ring-2 ring-cyan-400'} ${roundClass}`} />
                                        )}
                                        <span className="relative z-10">{day}</span>
                                        {isStart && (
                                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-gray-900 text-white text-[10px] px-2 py-0.5 rounded font-medium shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none z-20">
                                                {booking.guest}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Hovered Booking Info */}
                        {hoveredBooking && (
                            <div className="mx-3 mb-3 p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-3 h-3 rounded-full ${bookingStatusStyles[hoveredBooking.status].bg}`} />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{hoveredBooking.guest}</p>
                                        <p className="text-xs text-gray-500">{new Date(hoveredBooking.start).toLocaleDateString("vi-VN")} → {new Date(hoveredBooking.end).toLocaleDateString("vi-VN")}</p>
                                    </div>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${bookingStatusStyles[hoveredBooking.status].bg} ${bookingStatusStyles[hoveredBooking.status].text}`}>
                                    {bookingStatusStyles[hoveredBooking.status].label}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                        <span className="text-gray-400 font-bold">Chú thích:</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-400" /> Đã xác nhận</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-400" /> Chờ thanh toán</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white border border-gray-200" /> Trống</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-white ring-2 ring-cyan-400" /> Hôm nay</span>
                        <span className="flex items-center gap-1.5 text-rose-400">T7-CN: cuối tuần</span>
                    </div>

                    {/* Upcoming bookings list */}
                    {bookings.length > 0 && (
                        <div>
                            <h4 className="font-bold text-gray-900 text-sm mb-3">📋 Danh sách đặt phòng</h4>
                            <div className="space-y-2">
                                {bookings.map((b, i) => {
                                    const st = bookingStatusStyles[b.status];
                                    return (
                                        <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2.5 h-8 rounded-full ${st.bg}`} />
                                                <div>
                                                    <p className="text-sm font-bold text-gray-900">{b.guest}</p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(b.start).toLocaleDateString("vi-VN")} → {new Date(b.end).toLocaleDateString("vi-VN")}
                                                        <span className="ml-2 text-gray-400">
                                                            ({Math.ceil((new Date(b.end).getTime() - new Date(b.start).getTime()) / 86400000)} đêm)
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${st.bg} ${st.text}`}>
                                                {st.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Amenities */}
                    <div>
                        <p className="font-bold text-sm text-gray-900 mb-2">🏷️ Tiện nghi</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(property.attributes)
                                .filter(([k, v]) => typeof v === "boolean" && v && amenityIcons[k])
                                .map(([k]) => (
                                    <span key={k} className="flex items-center gap-1 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-full text-xs font-semibold">
                                        {amenityIcons[k].icon} {amenityIcons[k].label}
                                    </span>
                                ))
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
