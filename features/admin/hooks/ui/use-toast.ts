import { useEffect, useState } from "react";

interface UseToastReturn {
  toast: string | null;
  showToast: (message: string, duration?: number) => void;
  clearToast: () => void;
}

export function useToast(): UseToastReturn {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      setToast(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, duration: number = 3000) => {
    setToast(message);
  };

  const clearToast = () => {
    setToast(null);
  };

  return { toast, showToast, clearToast };
}
