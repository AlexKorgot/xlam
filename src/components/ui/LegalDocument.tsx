import Link from 'next/link';
import type { ReactNode } from 'react';
import { Container } from '@/src/components/ui/grid/Container';
import { legalDetails } from '@/src/lib/legalDetails';

type LegalSection = {
  title: string;
  content: ReactNode;
};

type LegalDocumentProps = {
  kind: 'terms' | 'privacy';
  title: string;
  lead: string;
  sections: LegalSection[];
};

const links = [
  { href: '/legal/terms/', label: 'Пользовательское соглашение', kind: 'terms' },
  { href: '/legal/privacy/', label: 'Политика обработки данных', kind: 'privacy' },
] as const;

export function LegalDocument({ kind, title, lead, sections }: LegalDocumentProps) {
  return (
    <div className="min-h-screen bg-black font-normalidad text-white">
      <Container className="pb-20 pt-8 sm:pt-14 min-[1000px]:pb-28">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-[0.12em] text-[#b4b4b4] transition-colors hover:text-[#66ff66] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66ff66]"
        >
          <span aria-hidden="true">←</span> На главную
        </Link>

        <header className="mt-12 border-b border-white/30 pb-10 sm:mt-16 sm:pb-14">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#66ff66]">
            XLAM MEDIA / Правовая информация
          </p>
          <h1 className="mt-5 max-w-[1100px] text-[clamp(2.25rem,7vw,6.5rem)] font-black uppercase leading-[0.95] tracking-tight [overflow-wrap:anywhere]">
            {title}
          </h1>
          <p className="mt-7 max-w-[760px] text-base leading-relaxed text-[#c6c6c6] sm:text-lg">
            {lead}
          </p>
        </header>

        <nav aria-label="Правовые документы" className="flex flex-wrap gap-3 py-8 sm:py-10">
          {links.map((link) => (
            <Link
              key={link.kind}
              href={link.href}
              aria-current={kind === link.kind ? 'page' : undefined}
              className={`border px-4 py-3 text-xs font-bold uppercase leading-snug transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#66ff66] sm:text-sm ${kind === link.kind ? 'border-[#66ff66] bg-[#66ff66] text-black' : 'border-white/35 text-white hover:border-[#66ff66] hover:text-[#66ff66]'}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <article className="max-w-[1100px]" aria-label={title}>
          {sections.map((section, index) => (
            <section
              key={section.title}
              className="grid gap-4 border-t border-white/20 py-8 sm:gap-7 sm:py-10 min-[1000px]:grid-cols-[minmax(0,280px)_minmax(0,1fr)]"
            >
              <h2 className="text-xl font-black uppercase leading-tight sm:text-2xl">
                <span className="mr-3 text-[#66ff66]">{String(index + 1).padStart(2, '0')}</span>
                {section.title}
              </h2>
              <div className="space-y-4 text-[15px] leading-[1.65] text-[#dedede] sm:text-[17px] [&_a]:text-[#66ff66] [&_a]:underline [&_a]:underline-offset-4 [&_a:focus-visible]:outline [&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-offset-4 [&_a:focus-visible]:outline-[#66ff66]">
                {section.content}
              </div>
            </section>
          ))}
        </article>

        <footer className="mt-10 flex flex-col gap-5 border-t border-white/30 pt-8 text-sm leading-relaxed text-[#a7a7a7] sm:flex-row sm:justify-between">
          <div>
            <p className="font-bold text-white">{legalDetails.operator}</p>
            <p>ОГРНИП {legalDetails.ogrnip} · ИНН {legalDetails.inn}</p>
          </div>
          <p>Редакция от 17 октября 2026 года</p>
        </footer>
      </Container>
    </div>
  );
}
