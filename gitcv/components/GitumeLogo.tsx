import type { ComponentPropsWithoutRef } from "react";

type GitumeLogoProps = ComponentPropsWithoutRef<"span"> & {
  showWordmark?: boolean;
  bgcolor?: string;
  currentcolor?: string;
};

export function GitumeLogo({
  className = "",
  showWordmark = true,
  ...props
}: GitumeLogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 leading-none text-inherit ${className}`}
      {...props}
    >
      <svg
        className={`w-[40px] h-[40px] flex-none text-black}`}
        viewBox="0 0 40 40"
        role="img"
        aria-label="Gitume logo mark"
      >
        {/* plate */}
        <rect
          x="4"
          y="4"
          width="32"
          height="32"
          rx="10"
          className={`fill-${props.bgcolor ? props.bgcolor : 'black'}`}
        />

        {/* main path */}
        <path
          d="M25 13.5h-7.2a6.7 6.7 0 1 0 0 13.4h5.9a4.7 4.7 0 0 0 0-9.4h-4.2"
          className={`fill-none stroke-white stroke-[2.25] stroke-linecap-round stroke-linejoin-round`}
        />

        {/* diagonal lines */}
        <path
          d="M23.8 17.2 29 12"
          className={`fill-none stroke-white stroke-[2.25] stroke-linecap-round stroke-linejoin-round`}
        />
        <path
          d="M23.8 26.8 29 32"
          className={`fill-none stroke-white stroke-[2.25] stroke-linecap-round stroke-linejoin-round`}
        />

        {/* dots */}
        <circle
          cx="29"
          cy="12"
          r="2.4"
          className={`fill-white stroke-white`}
        />
        <circle
          cx="29"
          cy="32"
          r="2.4"
          className={`fill-white stroke-white`}
        />
      </svg>

      {showWordmark && (
        <span className={`text-2xl text-${props.currentcolor} font-extrabold tracking-normal text-inherit`}>
          Gitume
        </span>
      )}
    </span>
  );
}
