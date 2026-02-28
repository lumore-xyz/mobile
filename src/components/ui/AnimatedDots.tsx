import React, { useEffect, useState } from "react";
import { StyleProp, Text, TextStyle } from "react-native";

interface AnimatedDotsProps {
  text: string;
  textStyle?: StyleProp<TextStyle>;
  dotStyle?: StyleProp<TextStyle>;
  speed?: number; // milliseconds between dot changes
}

const AnimatedDots: React.FC<AnimatedDotsProps> = ({
  text,
  textStyle,
  dotStyle,
  speed = 500,
}) => {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev + 1) % 4); // 0 → 3 dots
    }, speed);

    return () => clearInterval(interval);
  }, [speed]);

  return (
    <Text style={textStyle}>
      {text}
      <Text
        style={[
          {
            width: 24, // reserve space for 3 dots
          },
          dotStyle,
        ]}
      >
        {".".repeat(dots)}
      </Text>
    </Text>
  );
};

export default AnimatedDots;
