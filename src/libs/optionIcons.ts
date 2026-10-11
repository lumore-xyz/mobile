import { getLucideIcon } from "@/src/libs/lucideIcons";

export const getLucideOptionIcon = (name: string) =>
  getLucideIcon(name) ?? getLucideIcon("circle-question-mark");
