"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import { NumericFormat } from "react-number-format";
import {
    X, ChevronLeft, ChevronRight, Calendar, Plus, Minus,
    Upload, MapPin, BedDouble, Bed, Users, Bath,
    Wifi, Car, UtensilsCrossed, Flame, Music, Waves, Snowflake, TreePine,
    Check, DollarSign, Image as ImageIcon, Tag, Trash2, Star, Gamepad2, Dribbble, Target
} from "lucide-react";

// ── Calendar Helpers ──
function getDaysInMonth(year: number, month: number) {
    return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year: number, month: number) {
    const d = new Date(year, month, 1).getDay();
    return d === 0 ? 6 : d - 1;
}
function formatDateKey(y: number, m: number, d: number) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
function isWeekend(y: number, m: number, d: number) {
    const day = new Date(y, m, d).getDay();
    return day === 6; // Vũng Tàu: Only Saturday is weekend
}

const MONTH_NAMES = ["Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"];
const DAY_NAMES = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

// ── Amenity Config ──
const amenityOptions = [
    { key: "pool", icon: <Waves size={16} />, label: "Hồ bơi" },
    { key: "bbq", icon: <Flame size={16} />, label: "BBQ" },
    { key: "wifi", icon: <Wifi size={16} />, label: "WiFi" },
    { key: "billiards", icon: <Target size={16} />, label: "Bida" },
    { key: "kitchen", icon: <UtensilsCrossed size={16} />, label: "Bếp" },
    { key: "aircon", icon: <Snowflake size={16} />, label: "Máy lạnh" },
    { key: "karaoke", icon: <Music size={16} />, label: "Karaoke" },
    { key: "arcade", icon: <Gamepad2 size={16} />, label: "Máy game trẻ em" },
    { key: "foosball", icon: <Dribbble size={16} />, label: "Bi lắc" },
];

// ── Steps ──
type Step = 1 | 2 | 3;
const STEP_LABELS = ["Thông tin cơ bản", "Tiện nghi & Giá", "Lịch giá theo ngày"];

import { Property } from "@/types/property";

interface AddPropertyModalProps {
    onClose: () => void;
    onSubmit: (data: PropertyFormData) => void;
    editMode?: boolean;
    initialData?: Property;
}

export interface ImageFile {
    file: File;
    preview: string;
}

export interface PropertyFormData {
    name: string;
    type: "villa" | "homestay" | "nha-pho";
    location: string;
    address: string;
    description: string;
    tiktokUrl: string;
    bedrooms: number;
    beds: number;
    bathrooms: number;
    capacity: number;
    amenities: string[];
    priceWeekday: number;
    priceWeekend: number;
    imageFiles: ImageFile[];
    customPrices: Record<string, number>; // dateKey -> price
    isContactForPrice: boolean;
    contactPriceWeekday?: string;
    contactPriceWeekend?: string;
}

export default function AddPropertyModal({ onClose, onSubmit, editMode = false, initialData }: AddPropertyModalProps) {
    const [step, setStep] = useState<Step>(1);

    // Helper to get initial amenities from property attributes
    const getInitialAmenities = (p: Property): string[] => {
        const a: string[] = [];
        if (p.attributes.pool) a.push("pool");
        if (p.attributes.bbq) a.push("bbq");
        if (p.attributes.wifi) a.push("wifi");
        if (p.attributes.billiards) a.push("billiards");
        if (p.attributes.kitchen) a.push("kitchen");
        if (p.attributes.aircon) a.push("aircon");
        if (p.attributes.karaoke) a.push("karaoke");
        if (p.attributes.arcade) a.push("arcade");
        if (p.attributes.foosball) a.push("foosball");
        return a;
    };

    // Form state — initialize from initialData if editMode
    const [name, setName] = useState(initialData?.name || "");
    const [type, setType] = useState<"villa" | "homestay" | "nha-pho">(initialData?.type || "villa");
    const [location, setLocation] = useState(initialData?.location || "");
    const [address, setAddress] = useState(initialData?.address || "");
    const [description, setDescription] = useState(initialData?.description || "");
    const [tiktokUrl, setTiktokUrl] = useState(initialData?.videoUrl || "");
    const [bedrooms, setBedrooms] = useState(initialData?.attributes.bedrooms || 3);
    const [beds, setBeds] = useState(initialData?.attributes.beds || 3);
    const [bathrooms, setBathrooms] = useState(initialData?.attributes.bathrooms || 2);
    const [capacity, setCapacity] = useState(initialData?.attributes.capacity || 10);
    const [amenities, setAmenities] = useState<string[]>(initialData ? getInitialAmenities(initialData) : ["wifi", "aircon"]);
    const [priceWeekday, setPriceWeekday] = useState(initialData?.price.weekday || 3000000);
    const [priceWeekend, setPriceWeekend] = useState(initialData?.price.weekend || 5000000);
    const [isContactForPrice, setIsContactForPrice] = useState(initialData?.isContactForPrice || false);
    const [contactPriceWeekday, setContactPriceWeekday] = useState(initialData?.contactPriceWeekday || "");
    const [contactPriceWeekend, setContactPriceWeekend] = useState(initialData?.contactPriceWeekend || "");
    const [imageFiles, setImageFiles] = useState<ImageFile[]>(
        // In edit mode, create ImageFile objects from existing image URLs
        initialData ? initialData.images.map((url, i) => ({
            file: new File([], `existing-${i}.jpg`),
            preview: url,
        })) : []
    );
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calendar pricing state
    const now = new Date();
    const [viewMonth, setViewMonth] = useState(now.getMonth());
    const [viewYear, setViewYear] = useState(now.getFullYear());
    const [customPrices, setCustomPrices] = useState<Record<string, number>>(initialData?.customPrices || {});
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [bulkPrice, setBulkPrice] = useState("");
    const [isSelecting, setIsSelecting] = useState(false);

    const fmtPrice = (n: number) => n.toLocaleString("vi-VN");

    // Toggle amenity
    const toggleAmenity = (key: string) => {
        setAmenities(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]);
    };

    // Image handling
    const processFiles = useCallback((files: FileList | File[]) => {
        const newFiles: ImageFile[] = [];
        const fileArray = Array.from(files);
        fileArray.forEach(file => {
            if (!file.type.startsWith("image/")) return;
            // Avoid duplicates by name+size
            const isDuplicate = imageFiles.some(f => f.file.name === file.name && f.file.size === file.size);
            if (isDuplicate) return;
            newFiles.push({ file, preview: URL.createObjectURL(file) });
        });
        if (newFiles.length > 0) {
            setImageFiles(prev => [...prev, ...newFiles]);
        }
    }, [imageFiles]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files);
        e.target.value = ""; // reset to allow re-selecting same files
    };

    const removeImage = (idx: number) => {
        setImageFiles(prev => {
            const removed = prev[idx];
            URL.revokeObjectURL(removed.preview);
            return prev.filter((_, i) => i !== idx);
        });
    };

    const moveImage = (fromIdx: number, toIdx: number) => {
        setImageFiles(prev => {
            const arr = [...prev];
            const [item] = arr.splice(fromIdx, 1);
            arr.splice(toIdx, 0, item);
            return arr;
        });
    };

    // Drag & drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    }, [processFiles]);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + "B";
        if (bytes < 1048576) return (bytes / 1024).toFixed(0) + "KB";
        return (bytes / 1048576).toFixed(1) + "MB";
    };

    // Calendar navigation
    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    // Date selection
    const toggleDate = (dateKey: string) => {
        setSelectedDates(prev =>
            prev.includes(dateKey) ? prev.filter(d => d !== dateKey) : [...prev, dateKey]
        );
    };

    // Apply bulk price
    const applyBulkPrice = () => {
        const price = parseInt(bulkPrice.replace(/\D/g, ""));
        if (!price || selectedDates.length === 0) return;
        const newPrices = { ...customPrices };
        selectedDates.forEach(d => { newPrices[d] = price; });
        setCustomPrices(newPrices);
        setSelectedDates([]);
        setBulkPrice("");
    };

    // Đóng lịch
    const applyCloseDate = () => {
        if (selectedDates.length === 0) return;
        const newPrices = { ...customPrices };
        selectedDates.forEach(d => { newPrices[d] = -1; });
        setCustomPrices(newPrices);
        setSelectedDates([]);
        setBulkPrice("");
    };

    // Remove custom price
    const removeCustomPrice = (dateKey: string) => {
        const newPrices = { ...customPrices };
        delete newPrices[dateKey];
        setCustomPrices(newPrices);
    };

    // Select entire weekend
    const selectAllWeekends = () => {
        const days = getDaysInMonth(viewYear, viewMonth);
        const weekendDates: string[] = [];
        for (let d = 1; d <= days; d++) {
            if (isWeekend(viewYear, viewMonth, d)) {
                weekendDates.push(formatDateKey(viewYear, viewMonth, d));
            }
        }
        setSelectedDates(prev => {
            const combined = new Set([...prev, ...weekendDates]);
            return Array.from(combined);
        });
    };

    // Select entire month
    const selectEntireMonth = () => {
        const days = getDaysInMonth(viewYear, viewMonth);
        const allDates: string[] = [];
        const today = new Date();
        const todayKey = formatDateKey(today.getFullYear(), today.getMonth(), today.getDate());
        for (let d = 1; d <= days; d++) {
            const dk = formatDateKey(viewYear, viewMonth, d);
            if (dk >= todayKey) allDates.push(dk);
        }
        setSelectedDates(allDates);
    };

    // Clear selection
    const clearSelection = () => setSelectedDates([]);

    // Calendar rendering
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const todayKey = formatDateKey(now.getFullYear(), now.getMonth(), now.getDate());

    const calendarCells: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) calendarCells.push(null);
    for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

    // Count custom prices per month
    const customPricesThisMonth = Object.entries(customPrices).filter(([k]) => {
        const d = new Date(k);
        return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });

    // Validation
    const canGoStep2 = name.trim() && location.trim();
    const canGoStep3 = priceWeekday > 0 && priceWeekend > 0;

    // Submit
    const handleSubmit = () => {
        onSubmit({
            name, type, location, address, description, tiktokUrl,
            bedrooms, beds, bathrooms, capacity, amenities,
            priceWeekday, priceWeekend, imageFiles,
            customPrices, isContactForPrice,
            contactPriceWeekday, contactPriceWeekend
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl max-h-[92vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{editMode ? "Chỉnh sửa nơi ở" : "Thêm nơi ở mới"}</h2>
                        <p className="text-xs text-gray-400 mt-0.5">Bước {step}/3 — {STEP_LABELS[step - 1]}</p>
                    </div>
                    <button onClick={onClose} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200">
                        <X size={18} />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="px-6 pt-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {[1, 2, 3].map(s => (
                            <div key={s} className="flex-1 flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${s < step ? "bg-green-500 text-white"
                                    : s === step ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-200"
                                        : "bg-gray-100 text-gray-400"
                                    }`}>
                                    {s < step ? <Check size={14} /> : s}
                                </div>
                                {s < 3 && <div className={`flex-1 h-1 rounded-full ${s < step ? "bg-green-400" : "bg-gray-100"}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Body (scrollable) */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {/* ═══════ STEP 1: Basic Info ═══════ */}
                    {step === 1 && (
                        <div className="space-y-5 animate-fadeIn">
                            {/* Type selector */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Loại hình</label>
                                <div className="flex gap-3">
                                    {(["villa", "homestay", "nha-pho"] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => setType(t)}
                                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${type === t
                                                ? t === "villa"
                                                    ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                                                    : t === "homestay"
                                                        ? "border-violet-500 bg-violet-50 text-violet-700"
                                                        : "border-amber-500 bg-amber-50 text-amber-700"
                                                : "border-gray-200 text-gray-500 hover:border-gray-300"
                                                }`}
                                        >
                                            {t === "villa" ? "🏡 Villa" : t === "homestay" ? "🏠 Homestay" : "🏘️ Nhà Phố"}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Tên nơi ở *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    placeholder="VD: Villa Ocean View, Cozy Nest Homestay..."
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none text-sm font-medium transition-all"
                                />
                            </div>

                            {/* Location + Address */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        <MapPin size={14} className="inline mr-1 mb-0.5" /> Khu vực *
                                    </label>
                                    <input
                                        type="text"
                                        value={location}
                                        onChange={e => setLocation(e.target.value)}
                                        placeholder="VD: Bãi Sau, Vũng Tàu"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none text-sm font-medium transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Địa chỉ cụ thể</label>
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={e => setAddress(e.target.value)}
                                        placeholder="VD: 123 Thùy Vân, P.2"
                                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none text-sm font-medium transition-all"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Mô tả</label>
                                <textarea
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    placeholder="Giới thiệu ngắn gọn về nơi ở..."
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 outline-none text-sm font-medium transition-all resize-none"
                                />
                            </div>

                            {/* TikTok Video URL */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <svg className="inline w-4 h-4 mr-1 mb-0.5 text-[#FE2C55]" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.87a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.01-.3z"/></svg>
                                    Link TikTok Video
                                </label>
                                <input
                                    type="url"
                                    value={tiktokUrl}
                                    onChange={e => setTiktokUrl(e.target.value)}
                                    placeholder="https://www.tiktok.com/@user/video/1234567890"
                                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-pink-400 focus:ring-2 focus:ring-pink-100 outline-none text-sm font-medium transition-all"
                                />
                                <p className="text-xs text-gray-400 mt-1">Paste link video TikTok review của căn này (nếu có)</p>
                            </div>

                            {/* Attributes */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Thông số</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {/* Bedrooms */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                            <BedDouble size={16} className="text-cyan-500 hidden sm:block" />
                                            <span className="text-xs font-bold text-gray-600">Phòng ngủ</span>
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                                            <button onClick={() => setBedrooms(Math.max(1, bedrooms - 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Minus size={12} /></button>
                                            <span className="text-lg font-extrabold text-gray-900 w-8 text-center">{bedrooms}</span>
                                            <button onClick={() => setBedrooms(bedrooms + 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Plus size={12} /></button>
                                        </div>
                                    </div>
                                    {/* Beds */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                            <Bed size={16} className="text-indigo-500 hidden sm:block" />
                                            <span className="text-xs font-bold text-gray-600">Số giường</span>
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                                            <button onClick={() => setBeds(Math.max(1, beds - 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Minus size={12} /></button>
                                            <span className="text-lg font-extrabold text-gray-900 w-8 text-center">{beds}</span>
                                            <button onClick={() => setBeds(beds + 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Plus size={12} /></button>
                                        </div>
                                    </div>
                                    {/* Bathrooms */}
                                    <div className="bg-gray-50 rounded-xl p-4">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                                            <Bath size={16} className="text-blue-500 hidden sm:block" />
                                            <span className="text-xs font-bold text-gray-600">WC</span>
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2">
                                            <button onClick={() => setBathrooms(Math.max(1, bathrooms - 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Minus size={12} /></button>
                                            <span className="text-lg font-extrabold text-gray-900 w-8 text-center">{bathrooms}</span>
                                            <button onClick={() => setBathrooms(bathrooms + 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Plus size={12} /></button>
                                        </div>
                                    </div>
                                    {/* Capacity */}
                                    <div className="bg-gray-50 flex flex-col items-center justify-center h-full rounded-xl p-4">
                                        <div className="flex items-center justify-center sm:justify-start gap-2 mb-2 w-full">
                                            <Users size={16} className="text-green-500 hidden sm:block" />
                                            <span className="text-xs font-bold text-gray-600 text-center sm:text-left w-full sm:w-auto">Sức chứa cơ bản</span>
                                        </div>
                                        <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 mb-2">
                                            <button onClick={() => setCapacity(Math.max(1, capacity - 1))} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Minus size={12} /></button>
                                            <span className="text-lg font-extrabold text-gray-900 w-8 text-center">{capacity}</span>
                                            <button onClick={() => setCapacity(capacity + 1)} className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100"><Plus size={12} /></button>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-auto leading-tight text-center sm:text-left">
                                            Nếu số lượng khách lớn hơn vui lòng nhắn Zalo để được tư vấn phù hợp ạ
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Images - File Upload */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    <ImageIcon size={14} className="inline mr-1 mb-0.5" /> Hình ảnh
                                    {imageFiles.length > 0 && (
                                        <span className="text-xs font-normal text-gray-400 ml-2">({imageFiles.length} ảnh đã chọn)</span>
                                    )}
                                </label>

                                {/* Hidden file input */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />

                                {/* Drop zone */}
                                <div
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${isDragging
                                        ? "border-cyan-400 bg-cyan-50 scale-[1.01]"
                                        : "border-gray-300 hover:border-cyan-400 hover:bg-gray-50"
                                        }`}
                                >
                                    <div className="flex flex-col items-center gap-2">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${isDragging ? "bg-cyan-100 text-cyan-600" : "bg-gray-100 text-gray-400"
                                            }`}>
                                            <Upload size={22} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-700">
                                                {isDragging ? "Thả ảnh vào đây..." : "Nhấn để chọn ảnh hoặc kéo thả vào đây"}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">Hỗ trợ JPG, PNG, WebP • Chọn nhiều ảnh cùng lúc</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Image previews */}
                                {imageFiles.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {imageFiles.map((img, i) => (
                                                <div key={`${img.file.name}-${i}`} className="relative group rounded-xl overflow-hidden border-2 border-gray-200 hover:border-cyan-400 transition-all">
                                                    <div className="aspect-[4/3] relative">
                                                        <img src={img.preview} alt={img.file.name} className="w-full h-full object-cover" />
                                                        {/* Cover badge */}
                                                        {i === 0 && (
                                                            <div className="absolute top-2 left-2 px-2 py-0.5 bg-cyan-500 text-white text-[10px] font-bold rounded-md shadow">
                                                                📸 Ảnh bìa
                                                            </div>
                                                        )}
                                                        {/* Overlay on hover */}
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                            {i > 0 && (
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); moveImage(i, 0); }}
                                                                    className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-cyan-600 hover:bg-white transition-colors"
                                                                    title="Đặt làm ảnh bìa"
                                                                >
                                                                    <Star size={14} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                                className="w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center text-red-500 hover:bg-white transition-colors"
                                                                title="Xóa ảnh"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {/* File info */}
                                                    <div className="px-2.5 py-2 bg-white">
                                                        <p className="text-[11px] font-semibold text-gray-700 truncate" title={img.file.name}>
                                                            {img.file.name}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400">{formatFileSize(img.file.size)}</p>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Add more button */}
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="aspect-[4/3] rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-cyan-400 hover:bg-cyan-50 transition-all text-gray-400 hover:text-cyan-500"
                                            >
                                                <Plus size={24} />
                                                <span className="text-xs font-bold">Thêm ảnh</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ═══════ STEP 2: Amenities & Price ═══════ */}
                    {step === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                            {/* Amenities */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">Tiện nghi</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {amenityOptions.map(a => {
                                        const active = amenities.includes(a.key);
                                        return (
                                            <button
                                                key={a.key}
                                                onClick={() => toggleAmenity(a.key)}
                                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${active
                                                    ? "border-cyan-500 bg-cyan-50 text-cyan-700"
                                                    : "border-gray-200 text-gray-500 hover:border-gray-300"
                                                    }`}
                                            >
                                                {a.icon}
                                                <span>{a.label}</span>
                                                {active && <Check size={14} className="ml-auto text-cyan-500" />}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Base Prices */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-3">
                                    <DollarSign size={14} className="inline mr-1 mb-0.5" /> Giá cơ bản (VNĐ/đêm)
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 border border-green-200">
                                        <p className="text-xs font-bold text-green-600 mb-2">📅 Ngày thường (CN-T6)</p>
                                        <div className="flex items-center gap-2">
                                            <NumericFormat
                                                value={priceWeekday}
                                                onValueChange={(values) => setPriceWeekday(values.floatValue || 0)}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                allowNegative={false}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-green-300 focus:border-green-500 outline-none text-lg font-extrabold text-green-700 bg-white text-center"
                                            />
                                            <span className="text-sm font-bold text-green-600 whitespace-nowrap">đ</span>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 border border-rose-200">
                                        <p className="text-xs font-bold text-rose-600 mb-2">🌟 Cuối tuần (Thứ 7)</p>
                                        <div className="flex items-center gap-2">
                                            <NumericFormat
                                                value={priceWeekend}
                                                onValueChange={(values) => setPriceWeekend(values.floatValue || 0)}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                allowNegative={false}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-rose-300 focus:border-rose-500 outline-none text-lg font-extrabold text-rose-700 bg-white text-center"
                                            />
                                            <span className="text-sm font-bold text-rose-600 whitespace-nowrap">đ</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 text-center">
                                    💡 Bạn có thể set giá riêng cho từng ngày ở bước tiếp theo
                                </p>
                            </div>

                            {/* Preview */}
                            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Xem trước</p>
                                <div className="bg-white rounded-xl p-4 border border-gray-200">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${type === "villa" ? "bg-cyan-100 text-cyan-700" : type === "homestay" ? "bg-violet-100 text-violet-700" : "bg-amber-100 text-amber-700"}`}>
                                            {type}
                                        </span>
                                        <span className="text-sm font-bold text-gray-900">{name || "Tên nơi ở"}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-2">📍 {location || "Khu vực"}</p>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                        <span>{bedrooms} PN</span>
                                        <span>{bathrooms} PT</span>
                                        <span>{capacity} khách</span>
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                        {amenities.map(k => {
                                            const a = amenityOptions.find(x => x.key === k);
                                            return a ? (
                                                <span key={k} className="px-2 py-0.5 bg-cyan-50 text-cyan-600 rounded text-[10px] font-bold">
                                                    {a.label}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ═══════ STEP 3: Calendar Pricing ═══════ */}
                    {step === 3 && (
                        <div className="space-y-5 animate-fadeIn">
                            {/* Contact For Price toggle */}
                            <label className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200 cursor-pointer hover:bg-amber-100 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={isContactForPrice}
                                    onChange={(e) => setIsContactForPrice(e.target.checked)}
                                    className="mt-1 w-5 h-5 text-amber-600 rounded border-gray-300 focus:ring-amber-500 flex-shrink-0"
                                />
                                <div>
                                    <p className="font-bold text-amber-900">📲 Chỉ nhận liên hệ báo giá qua Zalo</p>
                                    <p className="text-sm text-amber-800 mt-0.5">Tích vào đây nếu bạn muốn ẩn lịch trống và mức giá chi tiết của căn này. Khách hàng chỉ thấy hình ảnh, thông tin và nút liên hệ Zalo trên đầu trang.</p>
                                </div>
                            </label>

                            {isContactForPrice && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                        <label className="block text-[13px] font-bold text-amber-900 mb-1.5">
                                            Giá khoảng Ngày thường (Từ CN - T6)
                                        </label>
                                        <input
                                            type="text"
                                            value={contactPriceWeekday}
                                            onChange={(e) => setContactPriceWeekday(e.target.value)}
                                            placeholder="VD: 3tr - 4tr"
                                            className="w-full px-4 py-2.5 rounded-xl border border-amber-200 text-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                                        <label className="block text-[13px] font-bold text-amber-900 mb-1.5">
                                            Giá khoảng Cuối tuần (Thứ 7)
                                        </label>
                                        <input
                                            type="text"
                                            value={contactPriceWeekend}
                                            onChange={(e) => setContactPriceWeekend(e.target.value)}
                                            placeholder="VD: 5tr - 6tr"
                                            className="w-full px-4 py-2.5 rounded-xl border border-amber-200 text-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-100 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            )}


                            <div className={`transition-opacity duration-300 ${isContactForPrice ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-200 mb-5">
                                    <p className="text-sm font-bold text-blue-700">📅 Đặt giá riêng cho từng ngày</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Chọn các ngày trên lịch → nhập giá → nhấn &ldquo;Áp dụng&rdquo;. Ngày không set sẽ dùng giá cơ bản ({fmtPrice(priceWeekday)}đ / {fmtPrice(priceWeekend)}đ).
                                    </p>
                                </div>

                                {/* Calendar */}
                                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                                    {/* Header */}
                                    <div className="flex items-center justify-between bg-gradient-to-r from-slate-800 to-slate-900 px-5 py-3">
                                        <button onClick={prevMonth} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
                                            <ChevronLeft size={16} />
                                        </button>
                                        <h4 className="text-white font-bold text-base">
                                            <Calendar size={15} className="inline mr-2 mb-0.5" />
                                            {MONTH_NAMES[viewMonth]} {viewYear}
                                        </h4>
                                        <button onClick={nextMonth} className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition">
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>

                                    {/* Quick select */}
                                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 border-b border-gray-100 flex-wrap">
                                        <span className="text-xs text-gray-400 font-bold">Chọn nhanh:</span>
                                        <button onClick={selectAllWeekends} className="px-3 py-1 rounded-lg bg-rose-100 text-rose-600 text-xs font-bold hover:bg-rose-200 transition">
                                            Cuối tuần
                                        </button>
                                        <button onClick={selectEntireMonth} className="px-3 py-1 rounded-lg bg-blue-100 text-blue-600 text-xs font-bold hover:bg-blue-200 transition">
                                            Cả tháng
                                        </button>
                                        {selectedDates.length > 0 && (
                                            <button onClick={clearSelection} className="px-3 py-1 rounded-lg bg-gray-200 text-gray-600 text-xs font-bold hover:bg-gray-300 transition">
                                                Bỏ chọn ({selectedDates.length})
                                            </button>
                                        )}
                                    </div>

                                    {/* Day headers */}
                                    <div className="grid grid-cols-7 px-3 pt-3">
                                        {DAY_NAMES.map(d => (
                                            <div key={d} className={`text-center text-xs font-bold py-1 ${d === "T7" ? "text-rose-400" : "text-gray-400"
                                                }`}>{d}</div>
                                        ))}
                                    </div>

                                    {/* Calendar Grid */}
                                    <div className="grid grid-cols-7 px-3 pb-3 gap-1">
                                        {calendarCells.map((day, i) => {
                                            if (day === null) return <div key={`e-${i}`} />;

                                            const dateKey = formatDateKey(viewYear, viewMonth, day);
                                            const weekend = isWeekend(viewYear, viewMonth, day);
                                            const isToday = dateKey === todayKey;
                                            const isPast = dateKey < todayKey;
                                            const isSelected = selectedDates.includes(dateKey);
                                            const customPrice = customPrices[dateKey];
                                            const basePrice = weekend ? priceWeekend : priceWeekday;

                                            return (
                                                <button
                                                    key={day}
                                                    disabled={isPast}
                                                    onClick={() => !isPast && toggleDate(dateKey)}
                                                    className={`relative rounded-lg transition-all text-center py-1.5 ${isPast
                                                        ? "text-gray-300 cursor-not-allowed"
                                                        : isSelected
                                                            ? "bg-cyan-500 text-white ring-2 ring-cyan-300 shadow-sm"
                                                            : customPrice === -1
                                                                ? "bg-red-50 text-red-500 hover:bg-red-100 line-through"
                                                                : customPrice
                                                                    ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                                                                    : isToday
                                                                        ? "ring-2 ring-cyan-400 bg-white hover:bg-cyan-50"
                                                                        : weekend
                                                                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                                                            : "bg-white text-gray-700 hover:bg-gray-100"
                                                        }`}
                                                >
                                                    <span className="text-sm font-bold block">{day}</span>
                                                    <span className={`text-[9px] font-medium block leading-tight ${isSelected ? "text-cyan-100" : isPast ? "text-gray-300" : customPrice === -1 ? "text-red-500 font-bold" : customPrice ? "text-amber-600 font-bold" : "text-gray-400"
                                                        }`}>
                                                        {isPast ? "" : customPrice === -1
                                                            ? "Đã đóng"
                                                            : customPrice
                                                                ? `${(customPrice / 1000000).toFixed(1)}tr`
                                                                : `${(basePrice / 1000000).toFixed(1)}tr`
                                                        }
                                                    </span>
                                                    {customPrice && customPrice !== -1 && !isSelected && (
                                                        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                    )}
                                                    {customPrice === -1 && !isSelected && (
                                                        <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                                                    )}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Apply price panel */}
                                {selectedDates.length > 0 && (
                                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-4 border border-cyan-200 animate-fadeIn">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Tag size={16} className="text-cyan-600" />
                                                <span className="text-sm font-bold text-cyan-700">
                                                    Đã chọn {selectedDates.length} ngày
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-1 max-w-[300px]">
                                                {selectedDates.slice(0, 5).map(d => (
                                                    <span key={d} className="px-1.5 py-0.5 bg-cyan-200 text-cyan-700 rounded text-[10px] font-bold">
                                                        {new Date(d).getDate()}/{new Date(d).getMonth() + 1}
                                                    </span>
                                                ))}
                                                {selectedDates.length > 5 && (
                                                    <span className="text-[10px] text-cyan-500 font-bold">+{selectedDates.length - 5}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <NumericFormat
                                                value={bulkPrice}
                                                onValueChange={(values) => setBulkPrice(values.value)}
                                                thousandSeparator="."
                                                decimalSeparator=","
                                                allowNegative={false}
                                                placeholder="Nhập giá (VD: 5.000.000)"
                                                className="flex-1 px-4 py-3 rounded-xl border-2 border-cyan-300 focus:border-cyan-500 outline-none text-sm font-bold text-center"
                                            />
                                            <button
                                                onClick={applyBulkPrice}
                                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm hover:shadow-lg transition-all"
                                            >
                                                Áp dụng
                                            </button>
                                            <button
                                                onClick={applyCloseDate}
                                                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-red-200 transition-all font-medium"
                                                title="Khóa không cho khách đặt vào những ngày này"
                                            >
                                                Đóng lịch
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Custom prices list */}
                                {customPricesThisMonth.length > 0 && (
                                    <div>
                                        <h4 className="font-bold text-gray-700 text-sm mb-2">
                                            Giá đã tùy chỉnh ({MONTH_NAMES[viewMonth]}):
                                        </h4>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {customPricesThisMonth
                                                .sort(([a], [b]) => a.localeCompare(b))
                                                .map(([dateKey, price]) => {
                                                    const d = new Date(dateKey);
                                                    const weekend = d.getDay() === 6;
                                                    return (
                                                        <div key={dateKey} className="flex items-center justify-between bg-amber-50 rounded-lg px-3 py-2 border border-amber-200 group">
                                                            <div>
                                                                <span className="text-xs font-bold text-gray-700">
                                                                    {d.getDate()}/{d.getMonth() + 1}
                                                                    {weekend && <span className="text-rose-400 ml-1">(CK)</span>}
                                                                </span>
                                                                <span className="text-xs font-extrabold text-amber-700 ml-2">
                                                                    {price === -1 ? <span className="text-red-500 line-through">Đã đóng</span> : `${fmtPrice(price)}đ`}
                                                                </span>
                                                            </div>
                                                            <button
                                                                onClick={() => removeCustomPrice(dateKey)}
                                                                className="w-5 h-5 rounded-full hover:bg-red-100 flex items-center justify-center text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                                title="Xóa giá tùy chỉnh"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                <span className="text-gray-400 font-bold">Chú thích:</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-gray-200" /> Giá thường</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-rose-50 border border-rose-200" /> Cuối tuần</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-300" /> Giá tùy chỉnh</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-100 border border-red-300" /> Đóng lịch</span>
                                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-cyan-500" /> Đang chọn</span>
                            </div>
                        </div>
                    )}
                </div>
                < div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0" >
                    {step > 1 ? (
                        <button onClick={() => setStep((step - 1) as Step)} className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                            ← Quay lại
                        </button>
                    ) : (
                        <button onClick={onClose} className="px-5 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition-all">
                            Hủy bỏ
                        </button>
                    )}

                    {
                        step < 3 ? (
                            <button
                                onClick={() => setStep((step + 1) as Step)}
                                disabled={step === 1 ? !canGoStep2 : !canGoStep3}
                                className={`px-6 py-3 rounded-xl font-bold text-sm transition-all ${(step === 1 ? canGoStep2 : canGoStep3)
                                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-200"
                                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                                    }`}
                            >
                                Tiếp theo →
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-sm hover:shadow-lg hover:shadow-green-200 transition-all flex items-center gap-2"
                            >
                                <Check size={16} /> Tạo nơi ở
                            </button>
                        )
                    }
                </div >
            </div >
        </div >
    );
}
