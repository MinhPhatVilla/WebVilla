import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import FloatingSocialButtons from "@/components/FloatingSocialButtons";
import { ClientProviders } from "./providers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import SchemaOrg from "@/components/SchemaOrg";

const montserrat = Montserrat({ subsets: ["latin"] });

export const metadata: Metadata = {
    metadataBase: new URL('https://minhphatvilla.com'),
    title: {
        default: "Minh Phát Villa & Homestay Vũng Tàu — Cho Thuê Villa Hồ Bơi Riêng",
        template: "%s | Minh Phát Villa Vũng Tàu",
    },
    description: "Hệ thống cho thuê Villa & Homestay cao cấp tại Vũng Tàu. Hồ bơi riêng, BBQ, view biển. Giá từ HSSV đến sang trọng. Hơn 1000 căn cho thuê. Liên hệ 0333.160.365",
    keywords: [
        "villa vũng tàu", "homestay vũng tàu", "thuê villa vũng tàu",
        "minh phát villa", "villa hồ bơi riêng vũng tàu",
        "homestay giá rẻ vũng tàu", "nhà phố vũng tàu",
        "villa vung tau", "cho thuê villa", "villa biển vũng tàu",
    ],
    openGraph: {
        title: "Minh Phát Villa & Homestay Vũng Tàu",
        description: "Trải nghiệm kỳ nghỉ sang trọng với hồ bơi riêng, view biển tuyệt đẹp. Hơn 1000 căn cho thuê tại Vũng Tàu.",
        type: "website",
        locale: "vi_VN",
        siteName: "Minh Phát Villa",
        images: [
            {
                url: "/logo.png",
                width: 512,
                height: 512,
                alt: "Minh Phát Villa & Homestay Vũng Tàu",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        title: "Minh Phát Villa & Homestay Vũng Tàu",
        description: "Hệ thống cho thuê Villa & Homestay cao cấp tại Vũng Tàu. Liên hệ 0333.160.365",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/logo.png",
        apple: "/logo.png",
    },
    alternates: {
        canonical: "https://minhphatvilla.com",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <body className={montserrat.className}>
                <SchemaOrg />
                <ErrorBoundary>
                    <ClientProviders>
                        {children}
                    </ClientProviders>
                </ErrorBoundary>
                <FloatingSocialButtons />
            </body>
        </html>
    );
}
