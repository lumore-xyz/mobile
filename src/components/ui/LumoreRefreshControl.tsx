import { RefreshControl, type RefreshControlProps } from "react-native";
import { COLORS } from "@/src/libs/constants/theme";

const REFRESH_COLORS = [COLORS.forest];
type LumoreRefreshControlProps = Omit<
  RefreshControlProps,
  "colors" | "tintColor"
>;

export default function LumoreRefreshControl(
  props: LumoreRefreshControlProps,
) {
  return (
    <RefreshControl
      {...props}
      tintColor={COLORS.forest}
      colors={REFRESH_COLORS}
    />
  );
}
