import type { Metadata } from "next";
import { Inter, Playfair_Display, Caveat } from "next/font/google";
import Navbar from "@/app/components/Navbar";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const playfair = Playfair_Display({ variable: "--font-playfair", subsets: ["latin"] });
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cuvée | Digital Journal",
  description: "Seal your memories into eternity",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${caveat.variable} antialiased min-h-screen flex flex-col`}>
        <Navbar />
        <div className="flex-1 flex flex-col relative">
          {children}
        </div>
      </body>
    </html>
  );
}