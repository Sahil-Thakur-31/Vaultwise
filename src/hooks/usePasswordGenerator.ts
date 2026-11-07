import { useCallback, useState } from "react";
import { generatePassword, PasswordOptions } from "@/lib/crypto";

export function usePasswordGenerator(initialLength = 20) {
  const [length, setLengthState] = useState(initialLength);
  const [options, setOptions] = useState<PasswordOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });

  const [password, setPassword] = useState(() =>
    generatePassword(initialLength, {
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
    })
  );

  const regenerate = useCallback(() => {
    setPassword(generatePassword(length, options));
  }, [length, options]);

  const setLength = useCallback(
    (newLength: number) => {
      setLengthState(newLength);
      // Synchronously generate new password on user interaction event, no useEffect needed
      setPassword(generatePassword(newLength, options));
    },
    [options]
  );

  const toggleOption = useCallback(
    (key: keyof PasswordOptions) => {
      setOptions((prev) => {
        const next = { ...prev, [key]: !prev[key] };
        setPassword(generatePassword(length, next));
        return next;
      });
    },
    [length]
  );

  return {
    password,
    length,
    options,
    setLength,
    toggleOption,
    regenerate,
  };
}
