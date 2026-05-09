import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "EternalEcho",
  description: "Seal your memories into eternity",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Navbar />
        {children}
      </body>
    </html>
  );
}