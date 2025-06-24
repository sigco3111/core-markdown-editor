import React from 'react';
import Toast from './Toast';
import { useToastManager } from '../contexts/ToastContext';

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastManager();

  if (!toasts.length) {
    return null;
  }

  return (
    <div 
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-5 right-5 z-[100] w-full max-w-xs sm:max-w-sm space-y-3 print:hidden"
    >
      {toasts.map(toast => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
};

export default ToastContainer;