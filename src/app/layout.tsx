import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Passport Photo Processor",
  description: "Process passport photos to meet Passport Seva requirements. Crop, resize, validate, and download portal-ready photos.",
  keywords: ["passport", "photo", "processor", "passport seva", "india", "crop", "resize"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased bg-[var(--background)] text-[var(--foreground)]`}>
        {children}
      </body>
    </html>
  );
}
