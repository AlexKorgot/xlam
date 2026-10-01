import { MainScene } from "@/src/components/ui/MainScene";
import { getProjectSlides } from "@/src/lib/strapiProjects";
import { getServicesContent } from "@/src/lib/strapiServices";
import { getTeamMembers } from "@/src/lib/strapiTeam";

export default async function Home() {
  const [projectSlides, serviceContent, teamMembers] = await Promise.all([
    getProjectSlides(),
    getServicesContent(),
    getTeamMembers(),
  ]);
  return <MainScene projectSlides={projectSlides} serviceContent={serviceContent} teamMembers={teamMembers} />;
}
