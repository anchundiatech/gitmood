import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gitmood-eta.vercel.app/";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "GitMood — Descubre el estado emocional de tus commits",
  description:
    "Ingresa tu username de GitHub y descubre tu tipo de dev, tu humor mes a mes y tus commits más felices y más dramáticos.",
  openGraph: {
    title: "GitMood",
    description: "Descubre el estado emocional de tus commits de GitHub.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitMood",
    description: "Descubre el estado emocional de tus commits de GitHub.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
