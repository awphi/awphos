import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import "quill/dist/quill.core.css";
import type { ReactNode } from "react";
import { cn } from "@/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Adam Hodson | adamw.ph",
  description: "Simple web-based graphical OS emulator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="w-full h-full">
      <body
        className={cn(
          `antialiased w-full h-full`,
          geistSans.variable,
          geistMono.variable,
          geistSans.className
        )}
      >
        {children}
      </body>
    </html>
  );
}
