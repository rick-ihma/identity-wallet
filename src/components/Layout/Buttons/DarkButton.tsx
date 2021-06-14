import React, { FunctionComponent } from "react";
import { Text } from "react-native";
import { color, fontSize } from "../../../common/styles";
import { BaseButton } from "./BaseButton";

export interface DarkButton {
  onPress?: () => void;
  text: string;
}

export const DarkButton: FunctionComponent<DarkButton> = ({
  onPress,
  text
}) => (
  <BaseButton onPress={onPress} backgroundColor={color("green", 30)}>
    <Text
      style={{
        color: color("grey", 0),
        fontWeight: "bold",
        fontSize: fontSize(-2)
      }}
    >
      {text}
    </Text>
  </BaseButton>
);
