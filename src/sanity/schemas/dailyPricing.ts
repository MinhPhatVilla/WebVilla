import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'dailyPricing',
    title: '💰 Giá Theo Ngày',
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
            name: 'price',
            title: 'Giá Đặc Biệt (VND)',
            type: 'number',
            description: 'Giá riêng cho ngày này (nếu khác giá cơ bản)',
            validation: (Rule) => Rule.required().min(0),
        }),
        defineField({
            name: 'priceType',
            title: 'Loại Giá',
            type: 'string',
            options: {
                list: [
                    { title: '📅 Ngày Thường', value: 'weekday' },
                    { title: '🎉 Cuối Tuần', value: 'weekend' },
                    { title: '🎊 Lễ Tết', value: 'holiday' },
                    { title: '🔥 Khuyến Mãi', value: 'promo' },
                    { title: '📈 Cao Điểm', value: 'peak' },
                ],
            },
            initialValue: 'weekday',
        }),
        defineField({
            name: 'notes',
            title: 'Ghi Chú',
            type: 'string',
            description: 'VD: Tết Nguyên Đán, 30/4, Sale 20%...',
        }),
    ],
    preview: {
        select: {
            propertyName: 'property.name',
            date: 'date',
            price: 'price',
            priceType: 'priceType',
        },
        prepare({ propertyName, date, price, priceType }) {
            const typeLabel = ({
                weekday: '📅',
                weekend: '🎉',
                holiday: '🎊',
                promo: '🔥',
                peak: '📈',
            } as Record<string, string>)[priceType || 'weekday'];
            return {
                title: `${typeLabel} ${new Date(date).toLocaleDateString('vi-VN')}`,
                subtitle: `${propertyName} - ${price?.toLocaleString('vi-VN')}đ`,
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
