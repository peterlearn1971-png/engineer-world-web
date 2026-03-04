import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
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
    // suppressHydrationWarning is the key to stopping "Zombie Mode" 
    // when extensions or font-loading delays interfere.
    <html lang="en" suppressHydrationWarning>
      <body
        className={inter.className}
        style={{
          margin: 0,
          background: "#f9fafb", 
          minHeight: "100vh",
          color: "#111",
          // Antialiasing can sometimes cause rendering delays on mobile
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        }}
      >
        {children}
      </body>
    </html>
  );
}