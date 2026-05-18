import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VisualWiki",
  description: "An infinite AI-generated visual Wikipedia."
};

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
