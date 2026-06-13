import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeForge",
  description: "Personal gamification dashboard builder",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}