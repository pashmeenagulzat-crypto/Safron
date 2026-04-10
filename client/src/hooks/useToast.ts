import { useState, useCallback } from 'react';

export interface Toast { id: number; message: string; type: 'success' | 'error' | 'info'; }

let nextId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, type: Toast['type'] = 'success', duration = 3500) => {
    const id = ++nextId;
    setToasts(p => [...p, { id, message, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);

  const dismiss = useCallback((id: number) => setToasts(p => p.filter(t => t.id !== id)), []);

  return { toasts, show, dismiss };
}
