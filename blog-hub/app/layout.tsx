import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Blog Hub",
  description: "Central place to write and generate blog posts for many sites.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
