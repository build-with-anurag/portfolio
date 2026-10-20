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
    "Portfolio of Anurag Vishwakarma, Diploma CSE student and builder from Bhopal, India.",
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
