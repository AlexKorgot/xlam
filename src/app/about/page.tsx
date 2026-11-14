import { TeamSection } from '../../components/ui/TeamSection';
import { getTeamMembers } from '@/src/lib/strapiTeam';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Команда — XLAM MEDIA',
  description: 'Знакомьтесь с командой XLAM MEDIA: продюсеры, режиссёры, креаторы и специалисты продакшна.',
  alternates: { canonical: '/about/' },
  openGraph: { title: 'Команда — XLAM MEDIA', description: 'Команда продюсеров, режиссёров, креаторов и специалистов XLAM MEDIA.', url: '/about/' },
};

export default async function Main() {
  const members = await getTeamMembers();
  return (
    <main className="h-[100svh]">
      <TeamSection members={members} />
    </main>
  );
}
