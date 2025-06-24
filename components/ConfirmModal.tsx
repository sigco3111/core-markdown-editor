import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="bg-white p-6 sm:p-8 rounded-lg shadow-xl max-w-md w-full transform transition-all">
        <h2 id="confirm-modal-title" className="text-xl font-semibold text-slate-800 mb-6 text-center">
          확인
        </h2>
        <p className="text-slate-600 mb-8 text-center" id="confirm-modal-description">
          {message}
        </p>
        <div className="flex justify-around space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full px-4 py-2.5 rounded-md text-sm font-medium 
                       bg-slate-200 text-slate-700 hover:bg-slate-300 
                       focus:outline-none focus:ring-2 focus:ring-slate-400 transition-colors"
            aria-label="아니요, 취소합니다"
          >
            아니요
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full px-4 py-2.5 rounded-md text-sm font-medium 
                       bg-blue-600 text-white hover:bg-blue-700 
                       focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                       transition-colors"
            aria-label="예, 확인합니다"
          >
            예
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;