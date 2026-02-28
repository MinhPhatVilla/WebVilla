"use client";

import { PropertyProvider } from "@/lib/property-store";
import { AuthProvider } from "@/lib/auth-context";

export function ClientProviders({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <PropertyProvider>
                {children}
            </PropertyProvider>
        </AuthProvider>
    );
}
