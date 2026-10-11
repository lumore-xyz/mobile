import { tva } from "@gluestack-ui/utils/nativewind-utils";

export const actionsheetStyle = tva({
  base: "w-full h-full web:pointer-events-none",
});

export const actionsheetContentStyle = tva({
  base: "items-center rounded-tl-3xl rounded-tr-3xl pt-2 bg-ui-paper web:pointer-events-auto web:select-none shadow-hard-5 border border-b-0 border-ui-ink/10 pb-safe",
});

export const actionsheetItemStyle = tva({
  base: "w-full flex-row items-center p-3 rounded-lg data-[disabled=true]:opacity-40 data-[disabled=true]:web:pointer-events-auto data-[disabled=true]:web:cursor-not-allowed hover:bg-ui-forest/5 active:bg-ui-forest/10 data-[focus=true]:bg-ui-forest/10 web:data-[focus-visible=true]:bg-ui-forest/10 web:data-[focus-visible=true]:outline-indicator-primary gap-2",
});

export const actionsheetDragIndicatorStyle = tva({
  base: "w-16 h-1 bg-ui-ink/20 rounded-full",
});

export const actionsheetDragIndicatorWrapperStyle = tva({
  base: "w-full py-1 items-center",
});

export const actionsheetBackdropStyle = tva({
  base: "absolute left-0 top-0 right-0 bottom-0 bg-ui-ink/50 web:cursor-default web:pointer-events-auto",
});
