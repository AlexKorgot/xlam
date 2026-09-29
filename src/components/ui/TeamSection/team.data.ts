import type { StaticImageData } from 'next/image';
import { publicAssetPath } from '@/src/lib/publicAssetPath';

export type TeamMember = {
  // Keep this key stable when mapping published Strapi entries.
  id: string;
  name: string;
  role: string;
  image: StaticImageData;
  videoSrc?: string;
};

const publicPersonImage = (filename: string): StaticImageData => ({
  src: publicAssetPath(`/persones/${filename}.webp`),
  width: 460,
  height: 800,
});

export const localTeamMembers: TeamMember[] = [
  {
    id: 'aysar',
    name: 'Айсар Альтавил',
    role: 'CCO',
    image: publicPersonImage('character_6'),
  },
  {
    id: 'artem',
    name: 'Артем Зозуля',
    role: 'Head of Creative',
    image: publicPersonImage('character_1'),
  },
  {
    id: 'gleb',
    name: 'Глеб Кучинский',
    role: 'Director',
    image: publicPersonImage('character_2'),
  },
  {
    id: 'valeriya',
    name: 'Валерия Монастырская',
    role: 'Line Producer',
    image: publicPersonImage('character_7'),
  },
  {
    id: 'evgeniy',
    name: 'Евгений Малов',
    role: 'Art Director',
    image: publicPersonImage('character_3'),
  },
  {
    id: 'alexandr',
    name: 'Александр Глебов',
    role: 'Aerial Cinematographer',
    image: publicPersonImage('character_9'),
  },
  {
    id: 'sergey',
    name: 'Сергей Киселев',
    role: 'AI Producer',
    image: publicPersonImage('character_5'),
  },
  {
    id: 'alexey',
    name: 'Алексей Пейзан',
    role: 'Full-stack Developer',
    image: publicPersonImage('character_8'),
  },
  {
    id: 'roman',
    name: 'Роман Ковалев',
    role: 'CEO',
    image: publicPersonImage('character_4'),
  },
];
