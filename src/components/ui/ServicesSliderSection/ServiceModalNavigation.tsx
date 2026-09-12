import GlitchText from '@/src/components/ui/GlitchText/GlitchText';

type ServiceModalNavigationProps = {
  previousLabel: string;
  currentLabel: string;
  nextLabel: string;
  onPrevious: () => void;
  onNext: () => void;
};

export function ServiceModalNavigation({ previousLabel, currentLabel, nextLabel, onPrevious, onNext }: ServiceModalNavigationProps) {
  return (
    <footer className="relative z-10 grid h-[64px] w-full shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-white/[0.12] bg-black/[0.42] px-5 text-[11px] font-medium leading-none backdrop-blur-sm sm:px-7 sm:text-sm lg:h-[72px] lg:px-10">
      <button
        type="button"
        className="flex h-12 min-w-0 cursor-pointer items-center gap-3 text-left uppercase text-white transition hover:text-[#63ff45] focus-visible:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]"
        aria-label="Show previous service"
        onClick={onPrevious}
      >
        <span className="cursor-pointer text-4xl leading-none text-[#63ff45]" aria-hidden="true">
          <GlitchText size="36">‹</GlitchText>
        </span>
        <span className="hidden min-w-0 cursor-pointer truncate sm:inline">
          <GlitchText size="14">{previousLabel}</GlitchText>
        </span>
      </button>

      <div className="min-w-0 cursor-pointer truncate text-center text-[14px] font-black uppercase leading-none text-[#63ff45] sm:text-[22px] lg:text-[28px]">
        <GlitchText size="28">{currentLabel}</GlitchText>
      </div>

      <button
        type="button"
        className="flex h-12 min-w-0 cursor-pointer items-center justify-end gap-3 text-right uppercase text-white transition hover:text-[#63ff45] focus-visible:text-[#63ff45] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#63ff45]"
        aria-label="Show next service"
        onClick={onNext}
      >
        <span className="hidden min-w-0 cursor-pointer truncate sm:inline">
          <GlitchText size="14">{nextLabel}</GlitchText>
        </span>
        <span className="cursor-pointer text-4xl leading-none text-[#63ff45]" aria-hidden="true">
          <GlitchText size="36">›</GlitchText>
        </span>
      </button>
    </footer>
  );
}
