import type { Metadata } from "next";
import "./globals.css";
import { HeaderProvider } from '@/src/components/ui/Header/HeaderProvider';
import { ContactModalProvider } from '@/src/components/ui/contact-modal';
import { getSiteSettings } from '@/src/lib/strapiSiteSettings';
import { getSeoSettings } from '@/src/lib/strapiSeoSettings';

export const viewport = {
  width: 375,
  initialScale: 1,
};


export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getSeoSettings();
  return { title, description };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteSettings = await getSiteSettings();
  return (
    <html
      lang="ru"
      className="h-full antialiased"
    >
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/pfn2mjq.css" />
      </head>
      <body className="flex min-h-[100svh] flex-col overflow-x-hidden">
        <ContactModalProvider settings={siteSettings}>
          <HeaderProvider>{children}</HeaderProvider>
        </ContactModalProvider>
      </body>
    </html>
  );
}
