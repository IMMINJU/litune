import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Litune",
    template: "%s — Litune",
  },
  description: "책의 분위기에 어울리는 음악을 찾아드립니다. 바코드를 스캔하거나 제목을 검색하세요.",
  keywords: ["음악 추천", "책", "플레이리스트", "무드", "독서"],
  authors: [{ name: "Litune" }],
  openGraph: {
    title: "Litune",
    description: "책의 분위기에 어울리는 음악을 찾아드립니다.",
    siteName: "Litune",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Litune",
    description: "책의 분위기에 어울리는 음악을 찾아드립니다.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-bg text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
