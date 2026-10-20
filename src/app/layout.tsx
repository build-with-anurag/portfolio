import type { Metadata } from "next";
import { Caveat, Inter } from "next/font/google";
import "./globals.scss";
import SmoothScroll from "@/components/SmoothScroll";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anurag Vishwakarma — CSE Student & Builder",
  description:
    "Portfolio of Anurag Vishwakarma, Diploma CSE student and builder from Bhopal, India. Builder of Krishi Setu, a live agricultural marketplace.",
  openGraph: {
    title: "Anurag Vishwakarma — CSE Student & Builder",
    description:
      "Diploma CSE student from Bhopal who builds and ships real products. Builder of Krishi Setu, a live agricultural marketplace.",
    type: "website",
    siteName: "anurag.build",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Anurag Vishwakarma — CSE Student & Builder",
    description:
      "Diploma CSE student from Bhopal who builds and ships real products. Builder of Krishi Setu, a live agricultural marketplace.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${caveat.variable}`}>
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
