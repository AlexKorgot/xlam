import { TeamSection } from '../../components/ui/TeamSection';
import { getTeamMembers } from '@/src/lib/strapiTeam';

export default async function Main() {
  const members = await getTeamMembers();
  return (
    <main className="h-[100svh]">
      <TeamSection members={members} />
    </main>
  );
}
