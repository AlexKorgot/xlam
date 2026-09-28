import { MainScene } from "@/src/components/ui/MainScene";
import { getProjectSlides } from "@/src/lib/strapiProjects";

export default async function Home() {
  const slides = await getProjectSlides();
  return <MainScene projectSlides={slides} />;
}
