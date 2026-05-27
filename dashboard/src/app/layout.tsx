import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Content Agent",
  description: "AI-powered social media content dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
