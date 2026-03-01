"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { MapPin, Calendar, Users, Search, X, Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface SearchBarProps {
    onSearch?: (filters: {
        location: string;
        checkIn: string;
        checkOut: string;
        guests: number;
    }) => void;
}

// ========== MINI CALENDAR COMPONENT ==========
function MiniCalendar({
    selectedDate,
    minDate,
    onSelect,
    highlightStart,
    highlightEnd,
}: {
    selectedDate: string;
    minDate?: string;
    onSelect: (date: string) => void;
    highlightStart?: string;
    highlightEnd?: string;
}) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    // Adjust for Monday start (0=Mon, 6=Sun)
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
    const monthNames = [
        "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
        "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
    ];

    const prevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const nextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const isDisabled = (day: number) => {
        const date = new Date(currentYear, currentMonth, day);
        const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        if (date < todayStart) return true;
        if (minDate) {
            const min = new Date(minDate);
            if (date <= min) return true;
        }
        return false;
    };

    const formatDateStr = (day: number) => {
        const m = String(currentMonth + 1).padStart(2, "0");
        const d = String(day).padStart(2, "0");
        return `${currentYear}-${m}-${d}`;
    };

    const isSelected = (day: number) => {
        return formatDateStr(day) === selectedDate;
    };

    const isInRange = (day: number) => {
        if (!highlightStart || !highlightEnd) return false;
        const dateStr = formatDateStr(day);
        return dateStr > highlightStart && dateStr < highlightEnd;
    };

    const isRangeStart = (day: number) => {
        return highlightStart ? formatDateStr(day) === highlightStart : false;
    };

    const isRangeEnd = (day: number) => {
        return highlightEnd ? formatDateStr(day) === highlightEnd : false;
    };

    const isToday = (day: number) => {
        return (
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear()
        );
    };

    const canGoPrev = () => {
        const todayMonth = today.getMonth();
        const todayYear = today.getFullYear();
        return currentYear > todayYear || (currentYear === todayYear && currentMonth > todayMonth);
    };

    return (
        <div className="select-none">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    disabled={!canGoPrev()}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={18} />
                </button>
                <h4 className="font-bold text-gray-900 text-base">
                    {monthNames[currentMonth]} {currentYear}
                </h4>
                <button
                    onClick={nextMonth}
                    className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((name) => (
                    <div key={name} className="text-center text-xs font-bold text-gray-400 py-1">
                        {name}
                    </div>
                ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for alignment */}
                {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="h-10"></div>
                ))}

                {/* Day cells */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const disabled = isDisabled(day);
                    const selected = isSelected(day);
                    const inRange = isInRange(day);
                    const rangeStart = isRangeStart(day);
                    const rangeEnd = isRangeEnd(day);
                    const todayDay = isToday(day);

                    return (
                        <button
                            key={day}
                            disabled={disabled}
                            onClick={() => onSelect(formatDateStr(day))}
                            className={`h-10 w-full rounded-full text-sm font-semibold transition-all relative
                                ${disabled
                                    ? "text-gray-300 cursor-not-allowed"
                                    : selected
                                        ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg scale-110"
                                        : rangeStart || rangeEnd
                                            ? "bg-cyan-500 text-white"
                                            : inRange
                                                ? "bg-cyan-100 text-cyan-800"
                                                : todayDay
                                                    ? "bg-gray-100 text-gray-900 font-bold"
                                                    : "text-gray-700 hover:bg-cyan-50 hover:text-cyan-700"
                                }
                            `}
                        >
                            {day}
                            {todayDay && !selected && (
                                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-500 rounded-full"></span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ========== MAIN SEARCH BAR ==========
export default function SearchBar({ onSearch }: SearchBarProps) {
    const [activeField, setActiveField] = useState<string | null>(null);
    const [location, setLocation] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [guests, setGuests] = useState(1);
    const searchRef = useRef<HTMLDivElement>(null);

    const locations = [
        { name: "Vũng Tàu", icon: "🏖️", desc: "Tất cả khu vực Vũng Tàu" },
        { name: "Bãi Sau", icon: "🌊", desc: "Bãi biển dài, sóng đẹp" },
        { name: "Bãi Trước", icon: "🌅", desc: "Hoàng hôn tuyệt đẹp" },
        { name: "Thùy Vân", icon: "🌴", desc: "Con đường ven biển thơ mộng" },
        { name: "Trung tâm", icon: "🏙️", desc: "Tiện lợi, gần chợ và quán ăn" },
        { name: "Núi Nhỏ", icon: "⛰️", desc: "View núi yên tĩnh, thư giãn" },
    ];

    // Calculate number of nights
    const nights = useMemo(() => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    }, [checkIn, checkOut]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setActiveField(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearch = () => {
        onSearch?.({ location, checkIn, checkOut, guests });
        setActiveField(null);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    };

    const getDayOfWeek = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
        return days[date.getDay()];
    };

    return (
        <div ref={searchRef} className="relative w-full max-w-4xl mx-auto">
            {/* Main Search Bar */}
            <div className={`flex flex-col md:flex-row md:items-center bg-white rounded-3xl md:rounded-full shadow-lg border-2 transition-all duration-300 ${activeField ? "border-cyan-400 shadow-2xl shadow-cyan-100" : "border-gray-100 hover:shadow-xl"
                }`}>

                <div
                    className={`flex-1 px-4 py-3 md:px-5 md:py-4 cursor-pointer rounded-t-3xl md:rounded-none md:rounded-l-full transition-all ${activeField === "location" ? "bg-cyan-50" : "hover:bg-gray-50"
                        }`}
                    onClick={() => setActiveField(activeField === "location" ? null : "location")}
                >
                    <div className="flex items-center gap-3">
                        <MapPin size={20} className="text-cyan-500 flex-shrink-0" />
                        <div className="text-left min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Địa điểm</p>
                            <p className={`text-sm font-semibold truncate ${location ? "text-gray-900" : "text-gray-400"}`}>
                                {location || "Chọn khu vực"}
                            </p>
                        </div>
                        {location && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setLocation(""); }}
                                className="ml-auto p-1 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
                            >
                                <X size={14} className="text-gray-400" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-10 bg-gray-200"></div>
                <div className="block md:hidden h-px w-full bg-gray-100"></div>

                {/* Check-in Field */}
                <div
                    className={`flex-1 px-4 py-3 md:px-5 md:py-4 cursor-pointer transition-all ${activeField === "checkin" ? "bg-cyan-50" : "hover:bg-gray-50"
                        }`}
                    onClick={() => setActiveField(activeField === "checkin" ? null : "checkin")}
                >
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-cyan-500 flex-shrink-0" />
                        <div className="text-left min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Nhận phòng</p>
                            <p className={`text-sm font-semibold truncate ${checkIn ? "text-gray-900" : "text-gray-400"}`}>
                                {checkIn ? `${getDayOfWeek(checkIn)}, ${formatDate(checkIn)}` : "Chọn ngày"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-10 bg-gray-200"></div>
                <div className="block md:hidden h-px w-full bg-gray-100"></div>

                {/* Check-out Field */}
                <div
                    className={`flex-1 px-4 py-3 md:px-5 md:py-4 cursor-pointer transition-all ${activeField === "checkout" ? "bg-cyan-50" : "hover:bg-gray-50"
                        }`}
                    onClick={() => setActiveField(activeField === "checkout" ? null : "checkout")}
                >
                    <div className="flex items-center gap-3">
                        <Calendar size={20} className="text-cyan-500 flex-shrink-0" />
                        <div className="text-left min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trả phòng</p>
                            <p className={`text-sm font-semibold truncate ${checkOut ? "text-gray-900" : "text-gray-400"}`}>
                                {checkOut ? `${getDayOfWeek(checkOut)}, ${formatDate(checkOut)}` : "Chọn ngày"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden md:block w-px h-10 bg-gray-200"></div>
                <div className="block md:hidden h-px w-full bg-gray-100"></div>

                {/* Guests Field */}
                <div
                    className={`flex-1 px-4 py-3 md:px-5 md:py-4 cursor-pointer transition-all ${activeField === "guests" ? "bg-cyan-50" : "hover:bg-gray-50"
                        }`}
                    onClick={() => setActiveField(activeField === "guests" ? null : "guests")}
                >
                    <div className="flex items-center gap-3">
                        <Users size={20} className="text-cyan-500 flex-shrink-0" />
                        <div className="text-left min-w-0">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Khách</p>
                            <p className={`text-sm font-semibold truncate ${guests > 1 ? "text-gray-900" : "text-gray-400"}`}>
                                {guests > 1 ? `${guests} khách` : "Số khách"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search Button */}
                <div className="p-2 md:pr-2 md:p-0">
                    <button
                        onClick={handleSearch}
                        className="w-full md:w-auto flex justify-center items-center gap-2 bg-gradient-to-r from-rose-500 to-pink-600 text-white p-3 md:p-4 rounded-full hover:from-rose-600 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl active:scale-95"
                    >
                        <Search size={20} />
                        <span className="md:hidden font-bold">Tìm kiếm</span>
                    </button>
                </div>
            </div>

            {/* Nights Badge */}
            {nights > 0 && (
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2">
                    <span className="bg-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                        {nights} đêm
                    </span>
                </div>
            )}

            {/* ========== DROPDOWNS ========== */}
            {activeField && (
                <>
                    {/* Mobile Overlay Background */}
                    <div
                        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] animate-in fade-in"
                        onClick={(e) => {
                            e.stopPropagation();
                            setActiveField(null);
                        }}
                    />

                    {/* Dropdown Container */}
                    <div className="fixed bottom-0 left-0 right-0 z-[100] md:absolute md:bottom-auto md:top-full md:mt-4 md:z-50 md:flex md:justify-start">

                        {/* Location Dropdown */}
                        {activeField === "location" && (
                            <div className="bg-white rounded-t-[2rem] md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl border-t md:border border-gray-100 p-6 md:p-6 w-full md:w-80 animate-in slide-in-from-bottom-full md:slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chọn khu vực</p>
                                    <button onClick={(e) => { e.stopPropagation(); setActiveField(null); }} className="md:hidden w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                                        <X size={16} />
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {locations.map((loc) => (
                                        <button
                                            key={loc.name}
                                            onClick={() => { setLocation(loc.name); setActiveField("checkin"); }}
                                            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${location === loc.name
                                                ? "bg-cyan-50 border-2 border-cyan-400 shadow-sm"
                                                : "hover:bg-gray-50 border-2 border-transparent"
                                                }`}
                                        >
                                            <span className="text-3xl">{loc.icon}</span>
                                            <div className="text-left">
                                                <p className="font-bold text-gray-900">{loc.name}</p>
                                                <p className="text-xs text-gray-500">{loc.desc}</p>
                                            </div>
                                            {location === loc.name && (
                                                <div className="ml-auto w-6 h-6 bg-cyan-500 rounded-full flex items-center justify-center">
                                                    <span className="text-white text-xs">✓</span>
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Check-in Calendar */}
                        {activeField === "checkin" && (
                            <div className="bg-white rounded-t-[2rem] md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl border-t md:border border-gray-100 p-6 md:p-6 w-full md:w-[340px] md:mx-auto animate-in slide-in-from-bottom-full md:slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chọn ngày nhận phòng</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setActiveField(null); }} className="md:hidden w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                                        <X size={16} />
                                    </button>
                                </div>
                                <MiniCalendar
                                    selectedDate={checkIn}
                                    highlightStart={checkIn}
                                    highlightEnd={checkOut}
                                    onSelect={(date) => {
                                        setCheckIn(date);
                                        if (checkOut && date >= checkOut) setCheckOut("");
                                        setActiveField("checkout");
                                    }}
                                />
                                {checkIn && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                                        <p className="text-sm text-gray-500">
                                            Nhận phòng: <span className="font-bold text-cyan-600">{getDayOfWeek(checkIn)}, {formatDate(checkIn)}</span>
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Check-out Calendar */}
                        {activeField === "checkout" && (
                            <div className="bg-white rounded-t-[2rem] md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl border-t md:border border-gray-100 p-6 md:p-6 w-full md:w-[340px] md:mx-auto animate-in slide-in-from-bottom-full md:slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Chọn ngày trả phòng</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setActiveField(null); }} className="md:hidden w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                                        <X size={16} />
                                    </button>
                                </div>
                                <MiniCalendar
                                    selectedDate={checkOut}
                                    minDate={checkIn}
                                    highlightStart={checkIn}
                                    highlightEnd={checkOut}
                                    onSelect={(date) => {
                                        setCheckOut(date);
                                        setActiveField("guests");
                                    }}
                                />
                                {checkIn && (
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-500">Nhận phòng:</span>
                                            <span className="font-bold text-cyan-600">{getDayOfWeek(checkIn)}, {formatDate(checkIn)}</span>
                                        </div>
                                        {checkOut && (
                                            <>
                                                <div className="flex items-center justify-between text-sm mt-1">
                                                    <span className="text-gray-500">Trả phòng:</span>
                                                    <span className="font-bold text-blue-600">{getDayOfWeek(checkOut)}, {formatDate(checkOut)}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm mt-2 pt-2 border-t border-gray-100">
                                                    <span className="text-gray-500">Tổng:</span>
                                                    <span className="font-bold text-gray-900 text-base">{nights} đêm</span>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Guests Counter */}
                        {activeField === "guests" && (
                            <div className="bg-white rounded-t-[2rem] md:rounded-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] md:shadow-2xl border-t md:border border-gray-100 p-6 md:p-6 w-full md:w-80 md:ml-auto animate-in slide-in-from-bottom-full md:slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
                                <div className="flex items-center justify-between mb-5">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Số lượng khách</p>
                                    <button onClick={(e) => { e.stopPropagation(); setActiveField(null); }} className="md:hidden w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200">
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Adults */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl mb-3">
                                    <div>
                                        <p className="font-bold text-gray-900">Người lớn</p>
                                        <p className="text-xs text-gray-500">Từ 13 tuổi trở lên</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setGuests(Math.max(1, guests - 1))}
                                            disabled={guests <= 1}
                                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-cyan-500 hover:bg-cyan-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                                        >
                                            <Minus size={16} />
                                        </button>
                                        <span className="text-2xl font-bold text-gray-900 w-8 text-center">{guests}</span>
                                        <button
                                            onClick={() => setGuests(Math.min(30, guests + 1))}
                                            disabled={guests >= 30}
                                            className="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center hover:border-cyan-500 hover:bg-cyan-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-90"
                                        >
                                            <Plus size={16} />
                                        </button>
                                    </div>
                                </div>

                                {/* Quick Select */}
                                <div className="flex gap-2 mt-4">
                                    {[2, 4, 6, 8, 10].map((num) => (
                                        <button
                                            key={num}
                                            onClick={() => setGuests(num)}
                                            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${guests === num
                                                ? "bg-cyan-500 text-white shadow-md"
                                                : "bg-gray-100 text-gray-600 hover:bg-cyan-50 hover:text-cyan-700"
                                                }`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>

                                <p className="text-xs text-gray-400 mt-3 text-center">Tối đa 30 khách</p>
                            </div>
                        )}
                        {activeField && (
                            <div className="p-4 md:hidden border-t border-gray-100 bg-white">
                                <button
                                    onClick={handleSearch}
                                    className="w-full bg-gradient-to-r from-rose-500 to-pink-600 text-white p-3 rounded-full font-bold shadow-lg shadow-rose-200"
                                >
                                    Tìm kiếm ({nights > 0 ? `${nights} đêm, ` : ""}{guests} khách)
                                </button>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
