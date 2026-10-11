import { createTextarea } from "@gluestack-ui/core/textarea/creator";
import { withStyleContext } from "@gluestack-ui/utils/nativewind-utils";
import { TextInput, View } from "react-native";

export const TEXTAREA_SCOPE = "TEXTAREA";

export const UITextarea = createTextarea({
  Root: withStyleContext(View, TEXTAREA_SCOPE),
  Input: TextInput,
});
