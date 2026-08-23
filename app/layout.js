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

export const metadata = {
  title: "SST HackMates — Scaler School of Technology Team-Matching & Hackathon Platform",
  description:
    "Exclusive hackathon squad matching and event management platform for Scaler School of Technology (SST) students and faculty hosts.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground relative selection:bg-cyan-500/30 selection:text-white">
        {/* Sci-Fi Mecha Circuit Background Vectors (Inspired by reference techwear graphic) */}
        <div className="mecha-bg-decor" aria-hidden="true">
          {/* Top-Left Circuit Traces */}
          <svg className="mecha-bg-tl" viewBox="0 0 300 300">
            <path d="M 0 40 L 80 40 L 120 80 L 120 140 L 160 180 L 220 180 L 250 210 L 300 210" />
            <path d="M 0 90 L 60 90 L 100 130 L 100 180 L 140 220 L 200 220" />
            <path d="M 40 0 L 40 60 L 80 100 L 140 100 L 180 140 L 180 200" />
            <line x1="85" y1="35" x2="85" y2="45" strokeWidth="4" />
            <line x1="125" y1="75" x2="125" y2="85" strokeWidth="4" />
            <rect x="15" y="15" width="20" height="20" fill="currentColor" opacity="0.6" />
          </svg>

          {/* Top-Right Circuit Traces */}
          <svg className="mecha-bg-tr" viewBox="0 0 300 300">
            <path d="M 0 50 L 90 50 L 130 90 L 130 160 L 180 210 L 240 210 L 280 250" />
            <path d="M 50 0 L 50 80 L 90 120 L 150 120 L 190 160 L 190 230" />
            <rect x="250" y="20" width="16" height="32" fill="currentColor" opacity="0.6" />
          </svg>

          {/* Bottom-Left Circuit Traces */}
          <svg className="mecha-bg-bl" viewBox="0 0 300 300">
            <path d="M 0 60 L 70 60 L 110 100 L 110 170 L 170 230 L 260 230" />
            <path d="M 60 0 L 60 90 L 120 150 L 180 150 L 220 190" />
            <rect x="30" y="240" width="30" height="15" fill="currentColor" opacity="0.6" />
          </svg>

          {/* Bottom-Right Circuit Traces */}
          <svg className="mecha-bg-br" viewBox="0 0 300 300">
            <path d="M 0 40 L 80 40 L 120 80 L 120 150 L 170 200 L 240 200 L 280 240" />
            <path d="M 40 0 L 40 70 L 90 120 L 150 120 L 200 170" />
            <rect x="230" y="230" width="24" height="24" fill="currentColor" opacity="0.6" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-1 flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
