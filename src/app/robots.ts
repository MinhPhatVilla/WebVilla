import { MetadataRoute } from 'next';

/**
 * 🤖 robots.txt — Hướng dẫn bot Google crawl
 * Next.js auto-generates /robots.txt từ file này
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/', '/studio/', '/checkout'],
            },
        ],
        sitemap: 'https://minhphatvilla.com/sitemap.xml',
    };
}
