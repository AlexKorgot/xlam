import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "XLAM Media",
  description: "Production studio with motion-first digital experiences.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className="h-full antialiased"
    >
      <body className="flex min-h-screen flex-col overflow-x-hidden">{children}</body>
    </html>
  );
}
