// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { LayoutWrapper } from "@/components/layout/layout-wrapper";
import { GlobalLoading } from "@/components/layout/global-loading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Casino Royale - Premium Crypto Casino",
  description: "Experience the future of online gaming with crypto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-gray-900 via-purple-900/10 to-gray-900 text-white min-h-screen`}
        suppressHydrationWarning
      >
        <Providers>
          <GlobalLoading />
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}