/**
 * 🏢 Schema.org JSON-LD — Structured Data cho Google Rich Results
 * Giúp Google hiểu web là doanh nghiệp cho thuê villa/homestay
 */

export default function SchemaOrg() {
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "LocalBusiness",
                "@id": "https://minhphatvilla.com/#business",
                "name": "Minh Phát Villa & Homestay",
                "description": "Hệ thống cho thuê Villa & Homestay cao cấp tại Vũng Tàu. Hồ bơi riêng, BBQ, view biển. Hơn 1000 căn cho thuê.",
                "url": "https://minhphatvilla.com",
                "telephone": "+84333160365",
                "email": "minhphatvilla@gmail.com",
                "image": "https://minhphatvilla.com/logo.png",
                "logo": "https://minhphatvilla.com/logo.png",
                "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Vũng Tàu",
                    "addressRegion": "Bà Rịa - Vũng Tàu",
                    "addressCountry": "VN",
                },
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": 10.346,
                    "longitude": 107.084,
                },
                "priceRange": "₫₫₫",
                "openingHoursSpecification": {
                    "@type": "OpeningHoursSpecification",
                    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                    "opens": "00:00",
                    "closes": "23:59",
                },
                "sameAs": [
                    "https://www.facebook.com/MINHPHATVILLA",
                    "https://www.tiktok.com/@villavungtaureview",
                ],
                "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.8",
                    "reviewCount": "150",
                    "bestRating": "5",
                },
            },
            {
                "@type": "WebSite",
                "@id": "https://minhphatvilla.com/#website",
                "url": "https://minhphatvilla.com",
                "name": "Minh Phát Villa & Homestay Vũng Tàu",
                "publisher": {
                    "@id": "https://minhphatvilla.com/#business",
                },
                "inLanguage": "vi-VN",
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
