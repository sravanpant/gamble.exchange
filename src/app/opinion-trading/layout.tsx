// src/app/opinion-trading/layout.tsx
import type { Metadata } from "next";
import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
    title: "Opinion Trading - Casino Royale",
    description: "Trade opinions on future events and earn rewards",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <main>
            {children}
            <Toaster position="top-center" richColors />

        </main>
    );
}