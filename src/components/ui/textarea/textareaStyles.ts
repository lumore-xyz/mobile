import { tva } from "@gluestack-ui/utils/nativewind-utils";

export const textareaStyle = tva({
  base: "h-[120px] w-full rounded-2xl border border-ui-parchment bg-ui-paper data-[hover=true]:border-ui-forest/50 data-[focus=true]:border-ui-forest data-[disabled=true]:opacity-40",
  variants: {
    variant: {
      default:
        "data-[focus=true]:border-ui-forest data-[focus=true]:web:ring-1 data-[focus=true]:web:ring-inset data-[focus=true]:web:ring-indicator-primary data-[invalid=true]:border-ui-danger data-[invalid=true]:web:ring-1 data-[invalid=true]:web:ring-inset data-[invalid=true]:web:ring-indicator-error data-[invalid=true]:data-[hover=true]:border-ui-danger data-[invalid=true]:data-[focus=true]:data-[hover=true]:border-ui-forest data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-1 data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-inset data-[invalid=true]:data-[focus=true]:data-[hover=true]:web:ring-indicator-primary data-[invalid=true]:data-[disabled=true]:data-[hover=true]:border-ui-danger data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-1 data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-inset data-[invalid=true]:data-[disabled=true]:data-[hover=true]:web:ring-indicator-error ",
    },
    size: {
      sm: "",
      md: "",
      lg: "",
      xl: "",
    },
  },
});

export const textareaInputStyle = tva({
  base: "flex-1 p-4 text-ui-ink placeholder:text-ui-slate web:outline-0 web:outline-none web:cursor-text web:data-[disabled=true]:cursor-not-allowed",
  parentVariants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-lg",
      xl: "text-xl",
    },
  },
});
