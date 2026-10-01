import { MainScene } from "@/src/components/ui/MainScene";
import { getProjectSlides } from "@/src/lib/strapiProjects";
import { getServicesContent } from "@/src/lib/strapiServices";
import { getTeamMembers } from "@/src/lib/strapiTeam";
import { getHomepageContent } from "@/src/lib/strapiHomepage";

export default async function Home() {
  const [projectSlides, serviceContent, teamMembers, homepageContent] = await Promise.all([
    getProjectSlides(),
    getServicesContent(),
    getTeamMembers(),
    getHomepageContent(),
  ]);
  return <MainScene projectSlides={projectSlides} serviceContent={serviceContent} teamMembers={teamMembers} homepageContent={homepageContent} />;
}
