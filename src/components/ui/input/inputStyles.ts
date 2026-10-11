import { tva } from "@gluestack-ui/utils/nativewind-utils";

export const inputStyle = tva({
  base: "flex-row items-center overflow-hidden border border-ui-parchment bg-ui-paper data-[hover=true]:border-ui-forest/50 data-[focus=true]:border-ui-forest data-[disabled=true]:opacity-40",
  variants: {
    size: {
      "2xl": "h-20",
      "3xl": "h-24",
      xl: "h-16",
      lg: "h-14",
      md: "h-12",
      sm: "h-9",
    },
    variant: {
      underlined:
        "rounded-none border-b data-[invalid=true]:border-b-2 data-[invalid=true]:border-ui-danger data-[invalid=true]:hover:border-ui-danger data-[invalid=true]:data-[focus=true]:border-ui-danger data-[invalid=true]:data-[focus=true]:hover:border-ui-danger data-[invalid=true]:data-[disabled=true]:hover:border-ui-danger",
      outline:
        "rounded-2xl data-[invalid=true]:border-ui-danger data-[focus=true]:web:ring-1 data-[focus=true]:web:ring-inset data-[focus=true]:web:ring-ui-forest",
      rounded:
        "rounded-2xl data-[invalid=true]:border-ui-danger data-[focus=true]:web:ring-1 data-[focus=true]:web:ring-inset data-[focus=true]:web:ring-ui-forest",
    },
  },
});

export const inputIconStyle = tva({
  base: "justify-center items-center text-ui-slate fill-none",
  parentVariants: {
    size: {
      "2xs": "h-3 w-3",
      xs: "h-3.5 w-3.5",
      sm: "h-4 w-4",
      md: "h-[18px] w-[18px]",
      lg: "h-5 w-5",
      xl: "h-6 w-6",
    },
  },
});

export const inputSlotStyle = tva({
  base: "justify-center items-center web:disabled:cursor-not-allowed",
});

export const inputFieldStyle = tva({
  base: "flex-1 text-ui-ink py-0 px-3 placeholder:text-ui-slate h-full ios:leading-[0px] web:cursor-text web:data-[disabled=true]:cursor-not-allowed",
  parentVariants: {
    variant: {
      underlined: "web:outline-0 web:outline-none px-0",
      outline: "web:outline-0 web:outline-none",
      rounded: "web:outline-0 web:outline-none px-4",
    },
    size: {
      "2xs": "text-2xs",
      xs: "text-xs",
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
      "2xl": "text-2xl",
      "3xl": "text-3xl",
      "4xl": "text-4xl",
      "5xl": "text-5xl",
      "6xl": "text-6xl",
    },
  },
});
