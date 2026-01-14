import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ausome Academic Activities",
  description:
    "Ausome Academic Activities – an engaging, gamified sight-word intervention with ABA-inspired timing, streaks, and progress tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
