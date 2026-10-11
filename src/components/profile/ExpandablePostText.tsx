import React, { useState } from "react";
import { Pressable, Text, View } from "react-native";

const ExpandablePostText = ({
  text,
  className,
  numberOfLines = 4,
}: {
  text: string;
  className: string;
  numberOfLines?: number;
}) => {
  const [expanded, setExpanded] = useState(false);
  const canExpand = text.length > 150;

  return (
    <View>
      <Text
        className={className}
        numberOfLines={canExpand && !expanded ? numberOfLines : undefined}
        ellipsizeMode="tail"
      >
        {text}
      </Text>
      {canExpand ? (
        <Pressable
          onPress={() => setExpanded((value) => !value)}
          className="mt-2 min-h-11 self-start justify-center py-1"
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Show less post text" : "Read more post text"}
          accessibilityState={{ expanded }}
        >
          <Text className="text-sm font-bold text-ui-champagne">
            {expanded ? "Show less" : "Read more"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
};

export default ExpandablePostText;
