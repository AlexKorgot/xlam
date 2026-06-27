import type { SVGProps } from 'react';

type BrandXIconProps = Omit<SVGProps<SVGSVGElement>, 'fill'> & {
  fill?: string;
};

export function BrandXIcon({
  fill = 'currentColor',
  width = 24,
  height = 21,
  ...props
}: BrandXIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 21"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      {...props}
    >
      <path
        d="M1.83588e-06 -2.09815e-06L8.0472 11.3435L3.0708 21L9.10329 21L12 16.9166L14.8967 21L20.9292 21L15.9528 11.3435L24 0L13.8917 -8.83697e-07L12 3.67024L10.1083 -1.21445e-06L1.83588e-06 -2.09815e-06Z"
        fill={fill}
      />
    </svg>
  );
}
