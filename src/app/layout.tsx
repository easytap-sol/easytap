import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// 1. Configure Local Satoshi Font (Correctly pointed to src/assets)
const satoshi = localFont({
  src: [
    {
      path: "../assets/fonts/satoshi/Satoshi-Light.woff",
      weight: "300",
      style: "normal",
    },
    {
      path: "../assets/fonts/satoshi/Satoshi-Regular.woff",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/satoshi/Satoshi-Medium.woff",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/satoshi/Satoshi-Bold.woff",
      weight: "700",
      style: "normal",
    },
    {
      path: "../assets/fonts/satoshi/Satoshi-Black.woff",
      weight: "900",
      style: "normal",
    },
    {
      path: "../assets/fonts/satoshi/Satoshi-Italic.woff",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "EasyTap | Digital Loan Management System",
  description: "Comprehensive Lending-as-a-Service (LaaS) platform. Manage loan portfolios, automate disbursements, and track repayments in real-time.",
  manifest: "/manifest.json", // Link to your PWA manifest
  appleWebApp: {
    capable: true,
    title: "EasyTap LMS",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#165FAC", // Primary Brand Blue
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${satoshi.variable} ${satoshi.className} scroll-smooth`}>
      <head>
        {/* Static PWA Assets remain in /public */}
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body
        className={`${satoshi.className} antialiased bg-background text-foreground`}
        suppressHydrationWarning={true}
      >
        {/* 
          NOTE: No Navbar or Footer here. 
          Those are handled in (marketing)/layout.tsx and (dashboard)/layout.tsx 
        */}
        {children}
      </body>
    </html>
  );
}