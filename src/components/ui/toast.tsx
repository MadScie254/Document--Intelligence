'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  title: string;
  type: ToastType;
}

interface ToastContextValue {
  notify: (title: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);

  const notify = useCallback((title: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setItems((prev) => [...prev, { id, title, type }]);
    window.setTimeout(() => {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }, 3400);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'rounded-lg border px-4 py-3 text-sm font-medium shadow-lg',
              item.type === 'success' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
              item.type === 'error' && 'border-rose-200 bg-rose-50 text-rose-700',
              item.type === 'info' && 'border-blue-200 bg-blue-50 text-blue-700'
            )}
          >
            {item.title}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
}