"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import { mockVilla } from "@/lib/mock-data";

export default function BookingCalendar() {
    const [selectedRange, setSelectedRange] = useState<DateRange | undefined>();

    // Giả lập những ngày đã kín phòng (Ví dụ: ngày 20, 21, 22 tháng này)
    const today = new Date();
    const disabledDays = [
        new Date(today.getFullYear(), today.getMonth(), 20),
        new Date(today.getFullYear(), today.getMonth(), 21),
        new Date(today.getFullYear(), today.getMonth(), 22),
    ];

    const footer = selectedRange?.from ? (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-gray-600">Bạn chọn từ:</p>
            <p className="font-bold text-lg text-primary">
                {format(selectedRange.from, 'dd/MM/yyyy', { locale: vi })}
                {selectedRange.to && ` - ${format(selectedRange.to, 'dd/MM/yyyy', { locale: vi })}`}
            </p>
            {selectedRange.to && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                    <p className="flex justify-between text-sm">
                        <span>Tạm tính:</span>
                        <span className="font-bold text-lg text-blue-600">
                            {/* Logic tính tiền đơn giản layout */}
                            {((mockVilla.price.weekday) * 2).toLocaleString()}đ
                        </span>
                    </p>
                    <button className="w-full mt-3 bg-primary text-white py-2 rounded-lg font-bold hover:bg-primary-light transition-colors">
                        ĐẶT NGAY
                    </button>
                </div>
            )}
        </div>
    ) : (
        <p className="mt-4 text-sm text-gray-500">Vui lòng chọn ngày nhận và trả phòng.</p>
    );

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                📅 Kiểm Tra Phòng Trống
            </h3>

            <div className="flex justify-center border rounded-xl p-4 bg-gray-50/50">
                <DayPicker
                    mode="range"
                    selected={selectedRange}
                    onSelect={setSelectedRange}
                    disabled={disabledDays}
                    // @ts-ignore - mismatch between date-fns and react-day-picker v9 locale types
                    locale={vi}
                />
            </div>

            {footer}

            {/* Chú thích màu */}
            <div className="flex gap-4 mt-4 text-xs text-gray-500 justify-center">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                    <span>Đang chọn</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                    <span>Đã Book</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border border-gray-300 rounded-full"></div>
                    <span>Còn trống</span>
                </div>
            </div>
        </div>
    );
}
