import React from 'react';
import { ToastMessage, ToastType } from '../contexts/ToastContext';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return {
        bg: 'bg-green-500',
        iconBg: 'bg-green-600',
        iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
        text: 'text-white'
      };
    case 'error':
      return {
        bg: 'bg-red-500',
        iconBg: 'bg-red-600',
        iconPath: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
        text: 'text-white'
      };
    case 'warning':
      return {
        bg: 'bg-yellow-400',
        iconBg: 'bg-yellow-500',
        iconPath: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
        text: 'text-slate-800' 
      };
    case 'info':
    default:
      return {
        bg: 'bg-blue-500',
        iconBg: 'bg-blue-600',
        iconPath: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
        text: 'text-white'
      };
  }
};

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const styles = getToastStyles(toast.type);

  return (
    <div 
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
      className={`
        ${styles.bg} ${styles.text} 
        p-4 rounded-md shadow-lg flex items-center space-x-3
        transform transition-all duration-300 ease-in-out
        hover:shadow-xl
      `}
    >
      <div className={`p-1.5 ${styles.iconBg} rounded-full`}>
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={styles.iconPath} />
        </svg>
      </div>
      <span className="flex-grow text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="알림 닫기"
        className={`
          ml-auto -mx-1.5 -my-1.5 
          ${styles.bg} ${styles.text} rounded-lg focus:ring-2 focus:ring-white
          p-1.5 hover:bg-opacity-80 inline-flex h-8 w-8
        `}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

export default Toast;