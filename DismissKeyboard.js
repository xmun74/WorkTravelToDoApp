import React from "react";
import { Keyboard, Platform, TouchableWithoutFeedback } from "react-native";
// 키보드밖 터치하면 키보드없애기
// ScrollView, FlatList 밖에서 해야함 안에서는 안됨.
export default function DismissKeyboard({ children }) {
  const dismissKeyboard = () => {
    Keyboard.dismiss();
  };
  return (
    <TouchableWithoutFeedback
      style={{ height: "100%" }}
      onPress={dismissKeyboard}
      disabled={Platform.OS === "web"}
    >
      {children}
    </TouchableWithoutFeedback>
  );
}
