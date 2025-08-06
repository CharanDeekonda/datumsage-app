// File: src/app/layout.tsx

import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '500', '600'] 
});

export const metadata: Metadata = {
  title: "DatumSage",
  description: "Conversational Data Analysis Platform",
  // This adds a unique query string to bust the cache
  icons: {
    icon: `/favicon.svg?v=${new Date().getTime()}`,
  },
};

export default function RootLayout({
  children,}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* This link tag provides an additional, direct hint to the browser */}
        <link rel="icon" href="/favicon.svg" sizes="any" />
      </head>
      <body className={`${poppins.className} bg-[#080710]`} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
