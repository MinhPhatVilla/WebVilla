import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import FloatingSocialButtons from "@/components/FloatingSocialButtons";
import { ClientProviders } from "./providers";

const outfit = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Minh Phát Villa Homestay Vũng Tàu",
    description: "Trải nghiệm kỳ nghỉ sang trọng tại Vũng Tàu - Villa & Homestay cao cấp với hồ bơi riêng, view biển",
    keywords: "villa vũng tàu, homestay vũng tàu, thuê villa, minh phát villa",
    openGraph: {
        title: "Minh Phát Villa Homestay Vũng Tàu",
        description: "Trải nghiệm kỳ nghỉ sang trọng với hồ bơi riêng, view biển tuyệt đẹp",
        type: "website",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <body className={outfit.className}>
                <ClientProviders>
                    {children}
                </ClientProviders>
                <FloatingSocialButtons />
            </body>
        </html>
    );
}
