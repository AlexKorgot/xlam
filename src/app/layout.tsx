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
  const siteTitle = title === 'XLAM Media' ? 'XLAM MEDIA — продакшн полного цикла' : title;
  const siteDescription = description === 'Production studio with motion-first digital experiences.'
    ? 'XLAM MEDIA — продакшн полного цикла: съёмка, креатив и производство медиапроектов.'
    : description;
  return {
    metadataBase: new URL('https://xlam.media'),
    title: siteTitle,
    description: siteDescription,
    openGraph: { type: 'website', siteName: 'XLAM MEDIA', title: siteTitle, description: siteDescription, url: '/' },
  };
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
