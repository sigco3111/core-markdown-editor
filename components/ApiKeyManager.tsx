
import React from 'react';

interface ApiKeyManagerProps {
  apiKeyInput: string;
  onApiKeyInputChange: (key: string) => void;
  onSaveApiKey: () => void;
  apiKeyStatusText: string;
  isAiInitializing: boolean;
}

const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  apiKeyInput,
  onApiKeyInputChange,
  onSaveApiKey,
  apiKeyStatusText,
  isAiInitializing,
}) => {
  const getStatusColor = () => {
    if (isAiInitializing) return 'text-blue-600';
    if (apiKeyStatusText.includes('활성 상태')) return 'text-green-600';
    if (apiKeyStatusText.includes('유효하지 않')) return 'text-red-600';
    if (apiKeyStatusText.includes('설정되지 않았습니다') || apiKeyStatusText.includes('제거되었습니다')) return 'text-amber-600';
    return 'text-slate-600';
  };

  return (
    <div className="p-3 bg-slate-200 border-b border-slate-300 print:hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3">
        <label htmlFor="apiKeyInput" className="block text-sm font-medium text-slate-700 mb-1 sm:mb-0">
          Gemini API 키:
        </label>
        <input
          type="password"
          id="apiKeyInput"
          value={apiKeyInput}
          onChange={(e) => onApiKeyInputChange(e.target.value)}
          placeholder="여기에 API 키를 입력하세요"
          className="flex-grow p-2 border border-slate-300 rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500 text-sm min-w-0"
          aria-describedby="apiKeyStatus"
        />
        <button
          type="button"
          onClick={onSaveApiKey}
          disabled={isAiInitializing}
          className="mt-2 sm:mt-0 px-4 py-2 bg-sky-600 text-white text-sm font-medium rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isAiInitializing ? '확인 중...' : '키 저장 및 활성화'}
        </button>
      </div>
      <p id="apiKeyStatus" className={`mt-2 text-sm ${getStatusColor()}`} role="status">
        상태: {apiKeyStatusText}
      </p>
    </div>
  );
};

export default ApiKeyManager;
