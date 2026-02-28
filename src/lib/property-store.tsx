"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import { Property } from "@/types/property";
import { supabase } from "./supabase";

// ── Helper: convert DB row → Property ──
function rowToProperty(row: Record<string, unknown>): Property {
    return {
        id: row.id as string,
        name: row.name as string,
        type: row.type as "villa" | "homestay",
        description: (row.description as string) || "",
        longDescription: (row.long_description as string) || "",
        isContactForPrice: (row.is_contact_for_price as boolean) || false,
        contactPriceWeekday: (row.contact_price_weekday as string) || "",
        contactPriceWeekend: (row.contact_price_weekend as string) || "",
        price: {
            weekday: row.price_weekday as number,
            weekend: row.price_weekend as number,
        },
        attributes: {
            bedrooms: row.bedrooms as number,
            beds: (row.beds as number) || 0,
            bathrooms: (row.bathrooms as number) || 0,
            capacity: row.capacity as number,
            pool: row.pool as boolean,
            bbq: row.bbq as boolean,
            wifi: (row.wifi as boolean) || false,
            billiards: (row.billiards as boolean) || false,
            kitchen: (row.kitchen as boolean) || false,
            aircon: (row.aircon as boolean) || false,
            karaoke: (row.karaoke as boolean) || false,
            arcade: (row.arcade as boolean) || false,
            foosball: (row.foosball as boolean) || false,
        },
        images: (row.images as string[]) || [],
        customPrices: (row.custom_prices as Record<string, number>) || undefined,
        videoUrl: (row.video_url as string) || "",
        location: (row.location as string) || "",
        address: (row.address as string) || "",
        rating: Number(row.rating) || 5.0,
        reviews: (row.reviews as number) || 0,
        policies: (row.policies as string[]) || [],
    };
}

// ── Helper: Property → DB row for insert/update ──
function propertyToRow(p: Partial<Property>): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    if (p.name !== undefined) row.name = p.name;
    if (p.type !== undefined) row.type = p.type;
    if (p.description !== undefined) row.description = p.description;
    if (p.longDescription !== undefined) row.long_description = p.longDescription;
    if (p.isContactForPrice !== undefined) row.is_contact_for_price = p.isContactForPrice;
    if (p.contactPriceWeekday !== undefined) row.contact_price_weekday = p.contactPriceWeekday;
    if (p.contactPriceWeekend !== undefined) row.contact_price_weekend = p.contactPriceWeekend;
    if (p.price) {
        row.price_weekday = p.price.weekday;
        row.price_weekend = p.price.weekend;
    }
    if (p.attributes) {
        row.bedrooms = p.attributes.bedrooms;
        row.beds = p.attributes.beds;
        row.bathrooms = p.attributes.bathrooms;
        row.capacity = p.attributes.capacity;
        row.pool = p.attributes.pool;
        row.bbq = p.attributes.bbq;
        row.wifi = p.attributes.wifi;
        row.billiards = p.attributes.billiards;
        row.kitchen = p.attributes.kitchen;
        row.aircon = p.attributes.aircon;
        row.karaoke = p.attributes.karaoke;
        row.arcade = p.attributes.arcade;
        row.foosball = p.attributes.foosball;
    }
    if (p.images !== undefined) row.images = p.images;
    if (p.customPrices !== undefined) row.custom_prices = p.customPrices;
    if (p.videoUrl !== undefined) row.video_url = p.videoUrl;
    if (p.location !== undefined) row.location = p.location;
    if (p.address !== undefined) row.address = p.address;
    if (p.rating !== undefined) row.rating = p.rating;
    if (p.reviews !== undefined) row.reviews = p.reviews;
    if (p.policies !== undefined) row.policies = p.policies;
    return row;
}

// ── Store interface ──
interface PropertyStore {
    properties: Property[];
    loading: boolean;
    error: string | null;
    addProperty: (property: Property) => Promise<void>;
    updateProperty: (id: string, updates: Partial<Property>) => Promise<void>;
    deleteProperty: (id: string) => Promise<void>;
    getPropertyById: (id: string) => Property | undefined;
    getByType: (type: "villa" | "homestay") => Property[];
    getAllProperties: () => Property[];
    refreshProperties: () => Promise<void>;
}

const PropertyContext = createContext<PropertyStore | null>(null);

// ── Provider ──
export function PropertyProvider({ children }: { children: React.ReactNode }) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch properties from Supabase on mount
    const fetchProperties = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const { data, error: fetchError } = await supabase
                .from("properties")
                .select("*")
                .order("created_at", { ascending: true });

            if (fetchError) throw fetchError;
            setProperties((data || []).map(rowToProperty));
        } catch (err) {
            console.error("Failed to fetch properties:", err);
            setError("Không thể tải dữ liệu nơi ở");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    // ADD — insert to Supabase then update local state
    const addProperty = useCallback(async (property: Property) => {
        try {
            const row = propertyToRow(property);
            const { data, error: insertError } = await supabase
                .from("properties")
                .insert(row)
                .select()
                .single();

            if (insertError) throw insertError;
            setProperties(prev => [rowToProperty(data), ...prev]);
        } catch (err) {
            console.error("Failed to add property:", err);
            throw err;
        }
    }, []);

    // UPDATE — update in Supabase then update local state
    const updateProperty = useCallback(async (id: string, updates: Partial<Property>) => {
        try {
            const row = propertyToRow(updates);
            const { data, error: updateError } = await supabase
                .from("properties")
                .update(row)
                .eq("id", id)
                .select()
                .single();

            if (updateError) throw updateError;
            setProperties(prev =>
                prev.map(p => (p.id === id ? rowToProperty(data) : p))
            );
        } catch (err) {
            console.error("Failed to update property:", err);
            throw err;
        }
    }, []);

    // DELETE — delete from Supabase then update local state
    const deleteProperty = useCallback(async (id: string) => {
        try {
            const { error: deleteError } = await supabase
                .from("properties")
                .delete()
                .eq("id", id);

            if (deleteError) throw deleteError;
            setProperties(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            console.error("Failed to delete property:", err);
            throw err;
        }
    }, []);

    const getPropertyById = useCallback(
        (id: string) => properties.find(p => p.id === id),
        [properties]
    );

    const getByType = useCallback(
        (type: "villa" | "homestay") => properties.filter(p => p.type === type),
        [properties]
    );

    const getAllProperties = useCallback(() => properties, [properties]);

    const value = useMemo<PropertyStore>(
        () => ({
            properties,
            loading,
            error,
            addProperty,
            updateProperty,
            deleteProperty,
            getPropertyById,
            getByType,
            getAllProperties,
            refreshProperties: fetchProperties,
        }),
        [properties, loading, error, addProperty, updateProperty, deleteProperty, getPropertyById, getByType, getAllProperties, fetchProperties]
    );

    return (
        <PropertyContext.Provider value={value}>
            {children}
        </PropertyContext.Provider>
    );
}

// ── Hook ──
export function usePropertyStore(): PropertyStore {
    const ctx = useContext(PropertyContext);
    if (!ctx) throw new Error("usePropertyStore must be used within PropertyProvider");
    return ctx;
}
