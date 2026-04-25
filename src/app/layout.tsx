import type { Metadata } from "next";
import "./globals.css";
import localFont from 'next/font/local'

const sans = localFont({
  src: [
    {
      path: '../lib/fonts/NBlack.otf',
      weight: '900',
      style: 'normal',
    },
    {
      path: '../lib/fonts/NBold.otf',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../lib/fonts/NMedium.otf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../lib/fonts/NRegular.otf',
      weight: '500',
      style: 'normal',
    },
  ],
  variable: '--app-font-default',
  display: 'swap',
})


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
      className={`h-full antialiased ${sans.variable}`}
    >
      <body className="flex min-h-[100svh] flex-col overflow-x-hidden">{children}</body>
    </html>
  );
}
