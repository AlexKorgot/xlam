import { Container } from "@/src/components/ui/grid/Container";
import { publicAssetPath } from "@/src/lib/publicAssetPath";

const featureRows = [
  [
    { label: "Умеем в шоу, рекламу и B2B", className: "lg:w-[366px]" },
    { label: "Работаем быстро и нестандартно", className: "lg:w-[533px]" },
    { label: "Умеем в шоу, рекламу и B2B", className: "lg:w-[366px]" },
  ],
  [
    { label: "Умеем в шоу, рекламу и B2B", className: "lg:w-[366px]" },
    { label: "Умеем в шоу, рекламу и B2B", className: "lg:w-[366px]" },
    { label: "Умеем в шоу, рекламу и B2B", className: "lg:w-[366px]" },
    { label: "Умеем в шоу, рекламу и B2B", className: "lg:w-[366px]" },
  ],
];

export function WhyUsSection() {
  return (
    <section
      className="relative isolate h-[100svh] overflow-hidden bg-black font-normalidad text-white pt-[150px]"
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
        <div className="relative z-10">
          <h2
            id="why-us-heading"
            className="mx-auto w-full max-w-[713px] text-center text-[38px] font-black uppercase leading-[1.21] tracking-normal sm:text-5xl md:text-[56px] lg:text-[60px]"
          >
            ПОЧЕМУ <span className="text-[#66ff66]">МЫ</span>
          </h2>
          <ul
            aria-label="Преимущества"
            className="mt-[27px] flex flex-col gap-[28px] lg:mt-[26.7px]"
          >
            {featureRows.map((row, rowIndex) => (
              <li key={rowIndex}>
                <ul className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:gap-[20px]">
                  {row.map((feature, index) => (
                    <FeaturePill
                      key={`${feature.label}-${rowIndex}-${index}`}
                      label={feature.label}
                      className={feature.className}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

function FeaturePill({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <li
      className={`flex max-w-full items-center justify-center border border-white px-6 py-[14px] text-center text-[18px] font-medium leading-[1.21] text-white sm:px-7 lg:text-[18.844px] ${className ?? ""}`}
    >
      <span className="whitespace-nowrap">{label}</span>
    </li>
  );
}
