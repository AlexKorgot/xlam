import {WhyUsSection} from "@/src/components/ui/WhyUsSection";
import { getHomepageContent } from '@/src/lib/strapiHomepage';

export default async function Main() {
  const homepageContent = await getHomepageContent();
  return <WhyUsSection content={homepageContent.whyUs} />;
}
