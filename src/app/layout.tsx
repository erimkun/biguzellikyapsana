import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kentaş Toplantı Odası",
  description: "Tactile 3D Meeting Room Booking Experience",
  icons: {
    icon: '/KentasLogoWhite.png',
    shortcut: '/KentasLogoWhite.png',
    apple: '/KentasLogoWhite.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
