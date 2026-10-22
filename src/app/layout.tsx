import type { Metadata } from "next";
import { Caveat, Fraunces, Inter } from "next/font/google";
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

// Serif display font for big headlines (hero, section titles in later parts).
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Anurag Vishwakarma — CSE Student & Builder",
  description:
    "Portfolio of Anurag Vishwakarma, Diploma CSE student and builder from Bhopal, India. Builder of Krishi Setu, a live prototype of an agricultural marketplace.",
  openGraph: {
    title: "Anurag Vishwakarma — CSE Student & Builder",
    description:
      "Diploma CSE student from Bhopal who builds and ships real products. Builder of Krishi Setu, a live prototype of an agricultural marketplace.",
    type: "website",
    siteName: "anurag.build",
    locale: "en_IN",
  },
  twitter: {
    card: "summary",
    title: "Anurag Vishwakarma — CSE Student & Builder",
    description:
      "Diploma CSE student from Bhopal who builds and ships real products. Builder of Krishi Setu, a live prototype of an agricultural marketplace.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${caveat.variable} ${fraunces.variable}`}
    >
      <body>
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
