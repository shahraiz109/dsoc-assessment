import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repo Health Comparator",
  description: "Compare public GitHub repositories with practical health signals.",
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
