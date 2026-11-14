import {WhyUsSection} from "@/src/components/ui/WhyUsSection";
import { getHomepageContent } from '@/src/lib/strapiHomepage';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Почему XLAM MEDIA — продакшн полного цикла',
  description: 'Узнайте, как команда XLAM MEDIA создаёт и реализует медиапроекты полного цикла.',
  alternates: { canonical: '/contacts/' },
  openGraph: { title: 'Почему XLAM MEDIA — продакшн полного цикла', description: 'Как команда XLAM MEDIA создаёт и реализует медиапроекты.', url: '/contacts/' },
};

export default async function Main() {
  const homepageContent = await getHomepageContent();
  return <WhyUsSection content={homepageContent.whyUs} />;
}
