import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// THE UPGRADE: Switch to Inter for a cleaner, professional SaaS look
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter", // Optional: Allows usage in Tailwind via var(--font-inter)
});

export const metadata: Metadata = {
  title: "Insure World",
  description: "Recruiting & Client Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} antialiased`}
        style={{
          margin: 0,
          background: "#f9fafb", // Adds the premium "off-white" background
          minHeight: "100vh",
          color: "#111",
        }}
      >
        {children}
      </body>
    </html>
  );
}