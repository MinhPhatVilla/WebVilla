import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'booking',
    title: '📝 Đơn Đặt Phòng',
    type: 'document',
    fields: [
        defineField({
            name: 'bookingCode',
            title: 'Mã Đặt Phòng',
            type: 'string',
            readOnly: true,
            description: 'Tự động tạo: MP-YYYYMMDD-XXX',
        }),
        defineField({
            name: 'property',
            title: 'Căn Đặt',
            type: 'reference',
            to: [{ type: 'property' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'checkIn',
            title: 'Ngày Nhận Phòng',
            type: 'date',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'checkOut',
            title: 'Ngày Trả Phòng',
            type: 'date',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'numberOfGuests',
            title: 'Số Khách',
            type: 'number',
            validation: (Rule) => Rule.required().min(1),
        }),
        defineField({
            name: 'status',
            title: 'Trạng Thái Đơn',
            type: 'string',
            options: {
                list: [
                    { title: '⏳ Chờ Xác Nhận', value: 'pending' },
                    { title: '✅ Đã Xác Nhận', value: 'confirmed' },
                    { title: '💰 Đã Thanh Toán', value: 'paid' },
                    { title: '🏠 Đã Check-in', value: 'checked_in' },
                    { title: '✔️ Hoàn Thành', value: 'completed' },
                    { title: '❌ Đã Hủy', value: 'cancelled' },
                ],
                layout: 'dropdown',
            },
            initialValue: 'pending',
        }),

        // Thông tin khách
        defineField({
            name: 'guestInfo',
            title: 'Thông Tin Khách Hàng',
            type: 'object',
            fields: [
                { name: 'fullName', title: 'Họ và Tên', type: 'string', validation: (Rule) => Rule.required() },
                { name: 'phone', title: 'Số Điện Thoại', type: 'string', validation: (Rule) => Rule.required() },
                { name: 'email', title: 'Email', type: 'string' },
                { name: 'idNumber', title: 'CCCD/CMND', type: 'string' },
            ],
        }),

        // Thông tin thanh toán
        defineField({
            name: 'payment',
            title: 'Thông Tin Thanh Toán',
            type: 'object',
            fields: [
                { name: 'totalAmount', title: 'Tổng Tiền (VND)', type: 'number' },
                { name: 'depositAmount', title: 'Tiền Cọc (VND)', type: 'number' },
                { name: 'depositPaid', title: 'Đã Nhận Cọc?', type: 'boolean', initialValue: false },
                { name: 'depositDate', title: 'Ngày Nhận Cọc', type: 'datetime' },
                {
                    name: 'paymentMethod', title: 'Phương Thức', type: 'string', options: {
                        list: [
                            { title: '💵 Tiền Mặt', value: 'cash' },
                            { title: '🏦 Chuyển Khoản', value: 'transfer' },
                            { title: '💳 Momo/ZaloPay', value: 'ewallet' },
                        ]
                    }
                },
                { name: 'fullPaid', title: 'Đã Thanh Toán Đủ?', type: 'boolean', initialValue: false },
            ],
        }),

        defineField({
            name: 'specialRequests',
            title: 'Yêu Cầu Đặc Biệt',
            type: 'text',
            rows: 3,
            description: 'VD: Cần thêm nệm, đón sân bay, tiệc sinh nhật...',
        }),

        defineField({
            name: 'internalNotes',
            title: 'Ghi Chú Nội Bộ (Khách không thấy)',
            type: 'text',
            rows: 2,
        }),

        defineField({
            name: 'source',
            title: 'Nguồn Đặt',
            type: 'string',
            options: {
                list: [
                    { title: '🌐 Website', value: 'website' },
                    { title: '📱 Zalo', value: 'zalo' },
                    { title: '📘 Facebook', value: 'facebook' },
                    { title: '🎵 TikTok', value: 'tiktok' },
                    { title: '📞 Điện Thoại', value: 'phone' },
                    { title: '🔄 Khách Quen', value: 'returning' },
                    { title: '📣 Giới Thiệu', value: 'referral' },
                ],
            },
            initialValue: 'website',
        }),
    ],

    preview: {
        select: {
            guestName: 'guestInfo.fullName',
            propertyName: 'property.name',
            checkIn: 'checkIn',
            checkOut: 'checkOut',
            status: 'status',
            code: 'bookingCode',
        },
        prepare({ guestName, propertyName, checkIn, checkOut, status, code }) {
            const statusEmoji = ({
                pending: '⏳',
                confirmed: '✅',
                paid: '💰',
                checked_in: '🏠',
                completed: '✔️',
                cancelled: '❌',
            } as Record<string, string>)[status || 'pending'];

            const formatDate = (d: string) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });

            return {
                title: `${statusEmoji} ${guestName || 'Khách'} - ${propertyName}`,
                subtitle: `${code || 'NEW'} | ${formatDate(checkIn)} → ${formatDate(checkOut)}`,
            };
        },
    },

    orderings: [
        {
            title: 'Mới Nhất',
            name: 'createdDesc',
            by: [{ field: '_createdAt', direction: 'desc' }],
        },
        {
            title: 'Theo Check-in',
            name: 'checkInAsc',
            by: [{ field: 'checkIn', direction: 'asc' }],
        },
    ],
});
