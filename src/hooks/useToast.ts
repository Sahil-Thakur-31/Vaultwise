import { useCallback, useRef, useState } from "react";

export function useToast(duration = 2400) {
  const [toast, setToast] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const notify = useCallback(
    (message: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setToast(message);
      timerRef.current = setTimeout(() => {
        setToast("");
        timerRef.current = null;
      }, duration);
    },
    [duration]
  );

  return { toast, notify };
}
