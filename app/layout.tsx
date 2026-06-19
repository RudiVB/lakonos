import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lakonos — Automate the work your people do by hand",
  description:
    "Lakonos builds custom automation around how your business already works — replacing manual labour across warehouse, production, quality and admin.",
};

// Favicon: the lambda mark as an inline SVG data URI
const FAVICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect x='2' y='2' width='60' height='60' rx='13' fill='%23161513' stroke='%23C39A4E' stroke-width='2'/%3E%3Cpath d='M 32 17 L 18 49 M 32 17 L 46 49' stroke='%23A4243B' stroke-width='7' stroke-linecap='square' fill='none'/%3E%3C/svg%3E";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/svg+xml" href={FAVICON} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@600;700;800;900&family=Inter:wght@400;500;600&family=Space+Mono:wght@700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
