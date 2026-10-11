import { createInput } from "@gluestack-ui/core/input/creator";
import { PrimitiveIcon, UIIcon } from "@gluestack-ui/core/icon/creator";
import { withStyleContext } from "@gluestack-ui/utils/nativewind-utils";
import { cssInterop } from "nativewind";
import { Pressable, TextInput, View } from "react-native";

export const INPUT_SCOPE = "INPUT";

export const UIInput = createInput({
  Root: withStyleContext(View, INPUT_SCOPE),
  Icon: UIIcon,
  Slot: Pressable,
  Input: TextInput,
});

cssInterop(PrimitiveIcon, {
  className: {
    target: "style",
    nativeStyleToProp: {
      height: true,
      width: true,
      fill: true,
      color: "classNameColor",
      stroke: true,
    },
  },
});
