import type { Metadata } from "next";
import { Hanken_Grotesk, IBM_Plex_Mono, Inter } from "next/font/google";
import "./globals.css";

// Typography per CLAUDE.md Section 1:
// Display = Hanken Grotesk (500/600, headings only), Body = Inter (400/500),
// Mono = IBM Plex Mono (labels, tags, stats, route-style eyebrows).
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: "Umer Farooq — Full-Stack & Mobile Developer",
  description:
    "CS student at FAST-NUCES building systems with more than one kind of user in them — backend, API, and UI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${hanken.variable} ${inter.variable} ${plexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>{children}</body>
    </html>
  );
}
