import { MainScene } from "@/src/components/ui/MainScene";
import { getProjectSlides } from "@/src/lib/strapiProjects";
import { getServicesContent } from "@/src/lib/strapiServices";

export default async function Home() {
  const [projectSlides, serviceContent] = await Promise.all([
    getProjectSlides(),
    getServicesContent(),
  ]);
  return <MainScene projectSlides={projectSlides} serviceContent={serviceContent} />;
}
