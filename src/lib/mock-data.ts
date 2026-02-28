export interface Property {
    id: string;
    name: string;
    type: 'villa' | 'homestay';
    description: string;
    longDescription?: string;
    isContactForPrice?: boolean;
    contactPriceWeekday?: string;
    contactPriceWeekend?: string;
    price: {
        weekday: number;
        weekend: number;
    };
    attributes: {
        bedrooms: number;
        beds?: number;
        bathrooms?: number;
        capacity: number;
        pool: boolean;
        bbq: boolean;
        wifi?: boolean;
        parking?: boolean;
        kitchen?: boolean;
        aircon?: boolean;
        karaoke?: boolean;
        garden?: boolean;
    };
    images: string[];
    videoUrl: string;
    location: string;
    address?: string;
    rating: number;
    reviews: number;
    policies?: string[];
}

// Mock data cho nhiều căn Villa
export const mockVillas: Property[] = [
    {
        id: "villa-ocean-view",
        name: "Villa Ocean View",
        type: 'villa',
        description: "Biệt thự view biển tuyệt đẹp với hồ bơi tràn bờ, không gian sang trọng và tiện nghi đầy đủ.",
        longDescription: "Villa Ocean View tọa lạc tại vị trí đắc địa ngay Bãi Sau Vũng Tàu, mang đến tầm nhìn biển 180 độ tuyệt đẹp. Với thiết kế hiện đại kết hợp phong cách nhiệt đới, villa sở hữu hồ bơi tràn bờ riêng, khu BBQ ngoài trời, phòng khách rộng rãi và 5 phòng ngủ sang trọng. Đây là lựa chọn lý tưởng cho các buổi tiệc, họp mặt gia đình hoặc nhóm bạn.",
        price: { weekday: 4000000, weekend: 6000000 },
        attributes: { bedrooms: 5, bathrooms: 4, capacity: 15, pool: true, bbq: true, wifi: true, parking: true, kitchen: true, aircon: true, karaoke: true, garden: true },
        images: [
            "https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=800&auto=format&fit=crop",
        ],
        videoUrl: "https://videos.pexels.com/video-files/7578552/7578552-uhd_2160_4096_30fps.mp4",
        location: "Bãi Sau, Vũng Tàu",
        address: "123 Trần Phú, Phường 5, TP. Vũng Tàu",
        rating: 5.0,
        reviews: 128,
        policies: ["Nhận phòng từ 14:00", "Trả phòng trước 12:00", "Không hút thuốc trong nhà", "Cọc 50% khi đặt", "Đổi ngày miễn phí trước 10 ngày"],
    },
    {
        id: "villa-garden-paradise",
        name: "Villa Garden Paradise",
        type: 'villa',
        description: "Không gian xanh mát với vườn nhiệt đới, hồ bơi riêng và khu BBQ ngoài trời rộng rãi.",
        price: { weekday: 3500000, weekend: 5500000 },
        attributes: { bedrooms: 4, capacity: 12, pool: true, bbq: true },
        images: [
            "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop",
        ],
        videoUrl: "",
        location: "Thùy Vân, Vũng Tàu",
        rating: 4.9,
        reviews: 95,
    },
    {
        id: "villa-sunset-bay",
        name: "Villa Sunset Bay",
        type: 'villa',
        description: "Ngắm hoàng hôn tuyệt đẹp từ ban công riêng, thiết kế hiện đại và tiện nghi cao cấp.",
        price: { weekday: 4500000, weekend: 7000000 },
        attributes: { bedrooms: 6, capacity: 20, pool: true, bbq: true },
        images: [
            "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=800&auto=format&fit=crop",
        ],
        videoUrl: "",
        location: "Bãi Trước, Vũng Tàu",
        rating: 4.8,
        reviews: 72,
    },
];

// Mock data cho Homestay
export const mockHomestays: Property[] = [
    {
        id: "homestay-cozy-nest",
        name: "Cozy Nest Homestay",
        type: 'homestay',
        description: "Căn hộ ấm cúng, view biển đẹp, phù hợp cho cặp đôi hoặc gia đình nhỏ.",
        price: { weekday: 800000, weekend: 1200000 },
        attributes: { bedrooms: 2, capacity: 4, pool: false, bbq: false },
        images: [
            "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=800&auto=format&fit=crop",
        ],
        videoUrl: "",
        location: "Trung tâm Vũng Tàu",
        rating: 4.7,
        reviews: 156,
    },
    {
        id: "homestay-beach-front",
        name: "Beach Front Homestay",
        type: 'homestay',
        description: "Ngay sát biển, thức dậy nghe sóng vỗ, không gian thoáng đãng và yên bình.",
        price: { weekday: 1000000, weekend: 1500000 },
        attributes: { bedrooms: 3, capacity: 6, pool: false, bbq: true },
        images: [
            "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?q=80&w=800&auto=format&fit=crop",
        ],
        videoUrl: "",
        location: "Bãi Sau, Vũng Tàu",
        rating: 4.6,
        reviews: 89,
    },
    {
        id: "homestay-mountain-view",
        name: "Mountain View Homestay",
        type: 'homestay',
        description: "View núi Nhỏ tuyệt đẹp, yên tĩnh, thích hợp cho những ai muốn nghỉ ngơi thư giãn.",
        price: { weekday: 700000, weekend: 1000000 },
        attributes: { bedrooms: 2, capacity: 5, pool: false, bbq: false },
        images: [
            "https://images.unsplash.com/photo-1493809842364-78817add7ffb?q=80&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=800&auto=format&fit=crop",
        ],
        videoUrl: "",
        location: "Núi Nhỏ, Vũng Tàu",
        rating: 4.5,
        reviews: 64,
    },
];

// Keep backward compatibility
export const mockVilla = mockVillas[0];

export interface Villa extends Property { }

// Helper: Tìm property theo id
export function getPropertyById(id: string): Property | undefined {
    return [...mockVillas, ...mockHomestays].find(p => p.id === id);
}

// Helper: Lấy tất cả properties
export function getAllProperties(): Property[] {
    return [...mockVillas, ...mockHomestays];
}

