import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

/**
 * 🗺️ Dynamic Sitemap — Tự động cập nhật khi thêm property mới
 * Next.js auto-generates /sitemap.xml từ file này
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://minhphatvilla.com';

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // Dynamic property pages from Supabase
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            return staticPages;
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data: properties } = await supabase
            .from('properties')
            .select('id, type, updated_at')
            .order('created_at', { ascending: false });

        if (properties) {
            const propertyPages: MetadataRoute.Sitemap = properties.map((p) => ({
                url: `${baseUrl}/${p.type}/${p.id}`,
                lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            }));

            return [...staticPages, ...propertyPages];
        }
    } catch (error) {
        console.error('Error generating sitemap:', error);
    }

    return staticPages;
}
