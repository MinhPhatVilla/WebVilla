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
        billiards?: boolean;
        kitchen?: boolean;
        aircon?: boolean;
        karaoke?: boolean;
        arcade?: boolean;
        foosball?: boolean;
    };
    images: string[];
    customPrices?: Record<string, number>;
    videoUrl: string;
    location: string;
    address?: string;
    rating: number;
    reviews: number;
    policies?: string[];
}

export interface Villa extends Property { }
