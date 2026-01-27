import type { Metadata } from "next";
import { Outfit } from "next/font/google"; // Using a modern, clean font
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Minh Phát Villa Homestay Vũng Tàu",
    description: "Trải nghiệm kỳ nghỉ sang trọng tại Vũng Tàu",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi">
            <body className={outfit.className}>{children}</body>
        </html>
    );
}
