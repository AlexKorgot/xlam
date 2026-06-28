import { Container } from "@/src/components/ui/grid/Container";
import { publicAssetPath } from "@/src/lib/publicAssetPath";
import styles from "./WhyUsSection.module.scss";

type FeatureBlockData = {
  label: string;
  className?: string;
};

const featureBlocks: FeatureBlockData[] = [
  {
    label: "Собственный парк оборудования",
    className: styles.cardEquipment,
  },
  {
    label: "Без рамок по формату",
    className: styles.cardFormat,
  },
  {
    label: "Создаём визуальные миры через брендинг, CGI и моушн",
    className: styles.cardWorlds,
  },
  {
    label: "Генеральный медиаподрядчик, а не аутсорс-лотерея",
    className: styles.cardContractor,
  },
  {
    label: "Senior-специалисты под каждую задачу",
    className: styles.cardSenior,
  },
  {
    label: "Работаем со всеми платформами и соцсетями",
    className: styles.cardPlatforms,
  },
  {
    label: "Актуальные AI-инструменты",
    className: styles.cardAi,
  },
  {
    label: "Гибкость под любой масштаб и бюджет",
    className: styles.cardScale,
  },
  {
    label: "Полный цикл медиауслуг",
    className: styles.cardCycle,
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
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.14)_28%,rgba(0,0,0,0.62)_58%,rgba(0,0,0,0.82)_100%)] lg:hidden"
      />
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
            className={`${styles.featureList} mt-[clamp(7rem,22svh,12rem)] md:mt-7`}
          >
            {featureBlocks.map((feature, index) => (
              <FeatureBlock
                key={`${feature.label}-${index}`}
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
  label: string;
  className?: string;
}) {
  return (
    <li
      className={`${styles.featureBlock} ${className ?? ""}`}
    >
      <span className="text-balance">{label}</span>
    </li>
  );
}
