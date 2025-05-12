import { TextInput, TextInputProps } from "@mantine/core";
import React, { useEffect, useState } from "react";

interface AnimatedTextInputProps extends Omit<TextInputProps, "onChange"> {
  onChange: (value: string) => void;
  animationSpeed?: number; // milliseconds per character
  defaultValue?: string;
}

export const AnimatedTextInput: React.FC<AnimatedTextInputProps> = ({
  value,
  onChange,
  animationSpeed = 50,
  defaultValue = "",
  ...props
}) => {
  const [displayValue, setDisplayValue] = useState(defaultValue);

  const handleUserInput: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const newValue = event.currentTarget.value;
    setDisplayValue(newValue); // Update immediately
    onChange(newValue);
  };

  useEffect(() => {
    if (value === undefined) return;
    if (value === null) return;

    const valueStr = value === undefined ? "" : String(value);

    if (valueStr === displayValue) return;

    let currentPos = 0;
    const commonPrefix = getCommonPrefix(displayValue, valueStr);
    currentPos = commonPrefix.length;

    setDisplayValue(commonPrefix);

    const interval = setInterval(() => {
      if (currentPos < valueStr.length) {
        setDisplayValue((prev) => prev + valueStr[currentPos]);
        currentPos++;
      } else clearInterval(interval);
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [animationSpeed, displayValue, value]);

  const isAnimating = displayValue !== value;

  return (
    <TextInput
      {...props}
      value={displayValue}
      onChange={handleUserInput}
      disabled={isAnimating}
    />
  );
};

// ========================================
// Helpers
// ========================================
function getCommonPrefix(a: string, b: string) {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return a.substring(0, i);
}
