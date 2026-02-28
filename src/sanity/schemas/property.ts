import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'property',
    title: '🏠 Căn Hộ / Villa',
    type: 'document',
    groups: [
        { name: 'basic', title: 'Thông Tin Cơ Bản' },
        { name: 'media', title: 'Hình Ảnh & Video' },
        { name: 'pricing', title: 'Bảng Giá' },
        { name: 'amenities', title: 'Tiện Nghi' },
        { name: 'location', title: 'Vị Trí' },
    ],
    fields: [
        // === THÔNG TIN CƠ BẢN ===
        defineField({
            name: 'name',
            title: 'Tên Căn',
            type: 'string',
            group: 'basic',
            validation: (Rule) => Rule.required().min(5).max(100),
        }),
        defineField({
            name: 'slug',
            title: 'Đường dẫn URL (slug)',
            type: 'slug',
            group: 'basic',
            options: {
                source: 'name',
                maxLength: 96,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'propertyType',
            title: 'Loại Hình',
            type: 'string',
            group: 'basic',
            options: {
                list: [
                    { title: '🏠 Villa', value: 'villa' },
                    { title: '🏡 Homestay', value: 'homestay' },
                ],
                layout: 'radio',
            },
            initialValue: 'villa',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'status',
            title: 'Trạng Thái',
            type: 'string',
            group: 'basic',
            options: {
                list: [
                    { title: '✅ Đang hoạt động', value: 'active' },
                    { title: '🔧 Đang bảo trì', value: 'maintenance' },
                    { title: '❌ Ngừng cho thuê', value: 'inactive' },
                ],
            },
            initialValue: 'active',
        }),
        defineField({
            name: 'shortDescription',
            title: 'Mô Tả Ngắn',
            type: 'text',
            group: 'basic',
            rows: 3,
            validation: (Rule) => Rule.max(200),
        }),
        defineField({
            name: 'fullDescription',
            title: 'Mô Tả Chi Tiết',
            type: 'array',
            group: 'basic',
            of: [{ type: 'block' }], // Rich text editor
        }),

        // === HÌNH ẢNH & VIDEO ===
        defineField({
            name: 'mainImage',
            title: 'Ảnh Đại Diện',
            type: 'image',
            group: 'media',
            options: {
                hotspot: true,
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'gallery',
            title: 'Bộ Sưu Tập Ảnh',
            type: 'array',
            group: 'media',
            of: [
                {
                    type: 'image',
                    options: { hotspot: true },
                    fields: [
                        {
                            name: 'caption',
                            type: 'string',
                            title: 'Chú thích ảnh',
                        },
                    ],
                },
            ],
            validation: (Rule) => Rule.min(3).max(20),
        }),
        defineField({
            name: 'tiktokVideoUrl',
            title: 'Link Video TikTok',
            type: 'url',
            group: 'media',
            description: 'Dán link video TikTok dọc giới thiệu căn hộ',
        }),
        defineField({
            name: 'youtubeVideoUrl',
            title: 'Link Video YouTube (Tùy chọn)',
            type: 'url',
            group: 'media',
        }),

        // === BẢNG GIÁ ===
        defineField({
            name: 'basePrice',
            title: 'Giá Cơ Bản',
            type: 'object',
            group: 'pricing',
            fields: [
                {
                    name: 'weekday',
                    title: 'Giá Ngày Thường (VND)',
                    type: 'number',
                    validation: (Rule) => Rule.required().min(0),
                },
                {
                    name: 'weekend',
                    title: 'Giá Cuối Tuần (VND)',
                    type: 'number',
                    validation: (Rule) => Rule.required().min(0),
                },
                {
                    name: 'holiday',
                    title: 'Giá Lễ Tết (VND)',
                    type: 'number',
                },
            ],
        }),
        defineField({
            name: 'cleaningFee',
            title: 'Phí Dọn Dẹp (VND)',
            type: 'number',
            group: 'pricing',
            initialValue: 0,
        }),
        defineField({
            name: 'depositPercent',
            title: 'Phần Trăm Đặt Cọc (%)',
            type: 'number',
            group: 'pricing',
            initialValue: 50,
            validation: (Rule) => Rule.min(0).max(100),
        }),

        // === TIỆN NGHI ===
        defineField({
            name: 'bedrooms',
            title: 'Số Phòng Ngủ',
            type: 'number',
            group: 'amenities',
            validation: (Rule) => Rule.required().min(1).max(20),
        }),
        defineField({
            name: 'bathrooms',
            title: 'Số Phòng Tắm',
            type: 'number',
            group: 'amenities',
            validation: (Rule) => Rule.required().min(1).max(10),
        }),
        defineField({
            name: 'maxGuests',
            title: 'Số Khách Tối Đa',
            type: 'number',
            group: 'amenities',
            validation: (Rule) => Rule.required().min(1).max(50),
        }),
        defineField({
            name: 'amenities',
            title: 'Tiện Nghi',
            type: 'array',
            group: 'amenities',
            of: [{ type: 'string' }],
            options: {
                list: [
                    { title: '🏊 Hồ Bơi Riêng', value: 'pool' },
                    { title: '🔥 Khu Vực BBQ', value: 'bbq' },
                    { title: '📶 WiFi Tốc Độ Cao', value: 'wifi' },
                    { title: '🚗 Bãi Đỗ Xe', value: 'parking' },
                    { title: '❄️ Điều Hòa', value: 'aircon' },
                    { title: '🍳 Bếp Đầy Đủ', value: 'kitchen' },
                    { title: '📺 TV / Netflix', value: 'tv' },
                    { title: '🧺 Máy Giặt', value: 'washer' },
                    { title: '🌊 View Biển', value: 'seaview' },
                    { title: '🏞️ Sân Vườn', value: 'garden' },
                    { title: '🎤 Karaoke', value: 'karaoke' },
                    { title: '🎱 Bi-a', value: 'billiards' },
                ],
            },
        }),

        // === VỊ TRÍ ===
        defineField({
            name: 'address',
            title: 'Địa Chỉ Đầy Đủ',
            type: 'string',
            group: 'location',
        }),
        defineField({
            name: 'area',
            title: 'Khu Vực',
            type: 'string',
            group: 'location',
            options: {
                list: [
                    { title: 'Bãi Sau', value: 'bai-sau' },
                    { title: 'Bãi Trước', value: 'bai-truoc' },
                    { title: 'Thùy Vân', value: 'thuy-van' },
                    { title: 'Long Hải', value: 'long-hai' },
                    { title: 'Hồ Tràm', value: 'ho-tram' },
                    { title: 'Khác', value: 'other' },
                ],
            },
        }),
        defineField({
            name: 'geoLocation',
            title: 'Tọa Độ Google Maps',
            type: 'geopoint',
            group: 'location',
        }),
        defineField({
            name: 'googleMapsEmbed',
            title: 'Link Nhúng Google Maps',
            type: 'url',
            group: 'location',
            description: 'Lấy từ Google Maps > Chia sẻ > Nhúng bản đồ',
        }),
    ],

    // Hiển thị trong danh sách
    preview: {
        select: {
            title: 'name',
            subtitle: 'propertyType',
            media: 'mainImage',
            status: 'status',
        },
        prepare({ title, subtitle, media, status }) {
            const typeLabel = subtitle === 'villa' ? '🏠 Villa' : '🏡 Homestay';
            const statusIcon = status === 'active' ? '✅' : status === 'maintenance' ? '🔧' : '❌';
            return {
                title: `${statusIcon} ${title}`,
                subtitle: typeLabel,
                media,
            };
        },
    },
});
