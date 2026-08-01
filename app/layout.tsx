import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "英単語カード | English Study",
  description: "単語、フレーズ、文法を繰り返し学べる英語学習アプリ。",
  openGraph: {
    title: "英単語カード | English Study",
    description: "単語、フレーズ、文法を繰り返し学べる英語学習アプリ。",
    images: [{ url: "/og.png", width: 1680, height: 940, alt: "English Study flashcard" }]
  },
  twitter: { card: "summary_large_image" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
