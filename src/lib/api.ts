import { client } from '@/sanity/lib/client';
import { Property } from '@/types/property';

// ============================================
// 📦 API FUNCTIONS - Kết nối Sanity CMS
// ============================================

/**
 * Lấy tất cả properties (Villa & Homestay)
 */
export async function getAllProperties(): Promise<Property[]> {
    const query = `*[_type == "property" && status == "active"] | order(_createdAt desc) {
        "id": slug.current,
        name,
        "type": propertyType,
        "description": shortDescription,
        "price": {
            "weekday": basePrice.weekday,
            "weekend": basePrice.weekend
        },
        "attributes": {
            "bedrooms": bedrooms,
            "capacity": maxGuests,
            "pool": "pool" in amenities,
            "bbq": "bbq" in amenities
        },
        "images": gallery[].asset->url,
        "videoUrl": tiktokVideoUrl,
        "location": address,
        "rating": 4.8,
        "reviews": 50
    }`;

    try {
        return await client.fetch(query);
    } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
    }
}

/**
 * Lấy properties theo loại (villa hoặc homestay)
 */
export async function getPropertiesByType(type: 'villa' | 'homestay'): Promise<Property[]> {
    const query = `*[_type == "property" && propertyType == $type && status == "active"] | order(_createdAt desc) {
        "id": slug.current,
        name,
        "type": propertyType,
        "description": shortDescription,
        "price": {
            "weekday": basePrice.weekday,
            "weekend": basePrice.weekend
        },
        "attributes": {
            "bedrooms": bedrooms,
            "capacity": maxGuests,
            "pool": "pool" in amenities,
            "bbq": "bbq" in amenities
        },
        "images": gallery[].asset->url,
        "videoUrl": tiktokVideoUrl,
        "location": address,
        "rating": 4.8,
        "reviews": 50
    }`;

    try {
        return await client.fetch(query, { type });
    } catch (error) {
        console.error('Error fetching properties by type:', error);
        return [];
    }
}

/**
 * Lấy chi tiết 1 property theo slug
 */
export async function getPropertyBySlug(slug: string) {
    const query = `*[_type == "property" && slug.current == $slug][0] {
        "id": slug.current,
        name,
        "type": propertyType,
        "shortDescription": shortDescription,
        "fullDescription": fullDescription,
        "price": {
            "weekday": basePrice.weekday,
            "weekend": basePrice.weekend,
            "holiday": basePrice.holiday
        },
        cleaningFee,
        depositPercent,
        "bedrooms": bedrooms,
        "bathrooms": bathrooms,
        "maxGuests": maxGuests,
        amenities,
        "mainImage": mainImage.asset->url,
        "gallery": gallery[]{
            "url": asset->url,
            caption
        },
        "tiktokVideoUrl": tiktokVideoUrl,
        "youtubeVideoUrl": youtubeVideoUrl,
        address,
        area,
        geoLocation,
        googleMapsEmbed
    }`;

    try {
        return await client.fetch(query, { slug });
    } catch (error) {
        console.error('Error fetching property:', error);
        return null;
    }
}

/**
 * Lấy lịch trống của 1 property theo tháng
 */
export async function getAvailability(propertyId: string, month: string) {
    // month format: "2026-01"
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const query = `*[_type == "availability" && property._ref == $propertyId && date >= $startDate && date <= $endDate] {
        date,
        status,
        guestName
    }`;

    try {
        return await client.fetch(query, { propertyId, startDate, endDate });
    } catch (error) {
        console.error('Error fetching availability:', error);
        return [];
    }
}

/**
 * Lấy giá đặc biệt của 1 property theo tháng
 */
export async function getDailyPricing(propertyId: string, month: string) {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;

    const query = `*[_type == "dailyPricing" && property._ref == $propertyId && date >= $startDate && date <= $endDate] {
        date,
        price,
        priceType,
        notes
    }`;

    try {
        return await client.fetch(query, { propertyId, startDate, endDate });
    } catch (error) {
        console.error('Error fetching daily pricing:', error);
        return [];
    }
}
