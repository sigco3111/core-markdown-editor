import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
}

type AddToastFunction = (message: string, type?: ToastType) => void;

// This context is primarily for components to *trigger* toasts.
// The ToastContainer will use a different hook (useToastManager) to get the toasts and remove function.

const ActualToastContext = createContext<{
  toasts: ToastMessage[];
  add: AddToastFunction;
  remove: (id: string) => void;
} | null>(null);

const ToastProviderFinal: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const add = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9); // Simpler ID, more robust
    setToasts(currentToasts => [{ id, message, type }, ...currentToasts]); // Prepend new toasts

    // Auto-remove toast
    setTimeout(() => {
      remove(id);
    }, 5000);
  }, []); // add depends on remove, so remove should be in its dependency array or be stable. Since remove is stable (defined with useCallback and no deps), this is fine.

  const remove = useCallback((id: string) => {
    setToasts(currentToasts => currentToasts.filter(toast => toast.id !== id));
  }, []);

  return (
    <ActualToastContext.Provider value={{ toasts, add, remove }}>
      {children}
    </ActualToastContext.Provider>
  );
};

interface ToastProviderProps {
  children: ReactNode;
}

// Hook for components to add toasts
export const useToast = (): AddToastFunction => {
  const context = useContext(ActualToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProviderFinal');
  }
  return context.add;
};

// Hook for ToastContainer to get toasts and remove function
export const useToastManager = () => {
  const context = useContext(ActualToastContext);
  if (!context) {
    throw new Error('useToastManager must be used within a ToastProviderFinal');
  }
  return { toasts: context.toasts, removeToast: context.remove };
};

// Re-export ToastProviderFinal as ToastProvider for index.tsx
export { ToastProviderFinal as ToastProvider };
