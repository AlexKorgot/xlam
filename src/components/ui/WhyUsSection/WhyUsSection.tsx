import { Container } from "@/src/components/ui/grid/Container";
import { publicAssetPath } from "@/src/lib/publicAssetPath";

type FeatureBlockData = {
  label: string[];
  className?: string;
};

const featureBlocks: FeatureBlockData[] = [
  {
    label: ["Собственный парк оборудования"],
  },
  {
    label: ["Гибкость и масштабируемость"],
  },
  {
    label: ["Senior-специалисты под каждую задачу"],

  },
  {
    label: ["Актуальные Ai инструменты"],

  },
  {
    label: ["Медиа контент без аутсорс-лотереи"],

  },
  {
    label: ["Любые ниши, любой формат"],

  },
  {
    label: ["Работаем со всеми платформами и соцсетями"],

  },
  {
    label: ["Полный цикл медиа услуг"],

  },
];

export function WhyUsSection() {
  return (
    <section
      className="relative isolate min-h-[100svh] overflow-hidden bg-black pt-[104px] font-normalidad text-white sm:pt-[128px] lg:h-[100svh] lg:pt-[150px]"
      aria-labelledby="why-us-heading"
    >
      <video
        aria-hidden="true"
        autoPlay
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
        muted
        playsInline
        preload="metadata"
      >
        <source src={publicAssetPath("/video/balls.mp4")} type="video/mp4" />
      </video>
      <Container>
        <div className="relative z-10 flex min-h-0 flex-col items-center">
          <h2
            id="why-us-heading"
            className="mx-auto w-full max-w-[713px] text-center text-[38px] font-black uppercase leading-[1.21] tracking-normal sm:text-5xl md:text-[56px] lg:text-[60px]"
          >
            ПОЧЕМУ <span className="text-[#66ff66]">МЫ</span>
          </h2>

          <ul
            aria-label="Преимущества"
            className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full  justify-items-center "
          >
            {featureBlocks.map((feature, index) => (
              <FeatureBlock
                key={`${feature.label.join("-")}-${index}`}
                label={feature.label}
                className={feature.className}
              />
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function FeatureBlock({
  label,
  className,
}: {
  label: string[];
  className?: string;
}) {
  return (
    <li
      className={`flex min-h-[54px] w-full max-w-[366px] items-center justify-center border border-white px-6 py-[14px] text-center text-[14px] font-medium uppercase leading-[1.12] text-white sm:px-7 lg:max-w-none  ${className ?? ""}`}
    >
      <span className="text-balance">
        {label.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </span>
    </li>
  );
}
