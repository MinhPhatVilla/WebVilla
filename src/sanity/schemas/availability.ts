import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'availability',
    title: '📅 Lịch Phòng Trống',
    type: 'document',
    fields: [
        defineField({
            name: 'property',
            title: 'Căn Hộ / Villa',
            type: 'reference',
            to: [{ type: 'property' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'date',
            title: 'Ngày',
            type: 'date',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'status',
            title: 'Trạng Thái',
            type: 'string',
            options: {
                list: [
                    { title: '✅ Còn Trống', value: 'available' },
                    { title: '🔴 Đã Đặt', value: 'booked' },
                    { title: '🔒 Khóa (Bảo trì)', value: 'blocked' },
                    { title: '⏳ Đang Chờ Xác Nhận', value: 'pending' },
                ],
                layout: 'radio',
            },
            initialValue: 'available',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'bookingRef',
            title: 'Mã Đặt Phòng',
            type: 'string',
            description: 'Tự động tạo khi có đặt phòng',
            readOnly: true,
        }),
        defineField({
            name: 'guestName',
            title: 'Tên Khách',
            type: 'string',
            hidden: ({ document }) => document?.status !== 'booked' && document?.status !== 'pending',
        }),
        defineField({
            name: 'guestPhone',
            title: 'SĐT Khách',
            type: 'string',
            hidden: ({ document }) => document?.status !== 'booked' && document?.status !== 'pending',
        }),
        defineField({
            name: 'notes',
            title: 'Ghi Chú Nội Bộ',
            type: 'text',
            rows: 2,
        }),
    ],
    preview: {
        select: {
            propertyName: 'property.name',
            date: 'date',
            status: 'status',
            guestName: 'guestName',
        },
        prepare({ propertyName, date, status, guestName }) {
            const statusLabel = ({
                available: '✅ Trống',
                booked: '🔴 Đã Đặt',
                blocked: '🔒 Khóa',
                pending: '⏳ Chờ',
            } as Record<string, string>)[status || 'available'];

            const formattedDate = new Date(date).toLocaleDateString('vi-VN', {
                weekday: 'short',
                day: '2-digit',
                month: '2-digit',
            });

            return {
                title: `${formattedDate} - ${statusLabel}`,
                subtitle: guestName ? `${propertyName} | ${guestName}` : propertyName,
            };
        },
    },
    orderings: [
        {
            title: 'Theo Ngày',
            name: 'dateAsc',
            by: [{ field: 'date', direction: 'asc' }],
        },
    ],
});
