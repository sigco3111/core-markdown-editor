
import React from 'react';
import { ViewMode, PreviewTheme, PreviewThemeIdentifier } from '../types'; 

interface FileActionsProps {
  onFileAction: (action: 'new' | 'download-md' | 'copy' | 'load' | 'download-html' | 'download-pdf') => void;
  viewMode: ViewMode;
  onSetViewMode: (mode: ViewMode) => void;
  availableThemes: PreviewTheme[];
  currentThemeId: PreviewThemeIdentifier;
  onSetThemeId: (themeId: PreviewThemeIdentifier) => void;
}


const FileActions: React.FC<FileActionsProps> = ({ 
  onFileAction, 
  viewMode, 
  onSetViewMode,
  availableThemes,
  currentThemeId,
  onSetThemeId
 }) => {
  const baseButtonClasses = "btn-toolbar flex flex-col items-center gap-y-1";
  
  const getActiveButtonClasses = (isActive: boolean) => 
    isActive 
      ? "bg-sky-100 text-sky-700 ring-1 ring-sky-300 hover:bg-sky-200" 
      : "bg-slate-200 text-slate-700 hover:bg-slate-300";


  return (
    <div className="flex items-start space-x-1 p-2 bg-slate-100 border-b border-slate-300 flex-wrap" role="toolbar" aria-label="파일 작업 및 보기 모드 모음">
      {/* File actions */}
      <button
        type="button"
        onClick={() => onFileAction('new')}
        title="새 파일"
        className={baseButtonClasses}
        aria-label="새 파일 만들기"
      >
        <span role="img" aria-hidden="true">📄</span>
        <span className="text-xs">새 파일</span>
      </button>
       <button
        type="button"
        onClick={() => onFileAction('load')}
        title="파일 불러오기"
        className={baseButtonClasses}
        aria-label="Markdown 파일 불러오기"
      >
        <span role="img" aria-hidden="true">📂</span>
        <span className="text-xs">불러오기</span>
      </button>
      <button
        type="button"
        onClick={() => onFileAction('download-md')}
        title="Markdown 다운로드 (.md)"
        className={baseButtonClasses}
        aria-label="Markdown 파일 다운로드"
      >
        <span role="img" aria-hidden="true">💾</span>
        <span className="text-xs">MD 저장</span>
      </button>
      <button
        type="button"
        onClick={() => onFileAction('download-html')}
        title="HTML로 내보내기"
        className={baseButtonClasses}
        aria-label="HTML 파일로 내보내기"
      >
        <span role="img" aria-hidden="true">🌐</span>
        <span className="text-xs">HTML 저장</span>
      </button>
      <button
        type="button"
        onClick={() => onFileAction('download-pdf')}
        title="PDF로 내보내기"
        className={baseButtonClasses}
        aria-label="PDF 파일로 내보내기"
      >
        <span role="img" aria-hidden="true">📜</span>
        <span className="text-xs">PDF 저장</span>
      </button>
      <button
        type="button"
        onClick={() => onFileAction('copy')}
        title="Markdown 복사"
        className={baseButtonClasses}
        aria-label="Markdown 콘텐츠 복사"
      >
       <span role="img" aria-hidden="true">📋</span>
       <span className="text-xs">복사</span>
      </button>

      <div className="h-full border-l border-slate-300 mx-1 self-stretch"></div>

      {/* View mode toggles */}
      <button
        type="button"
        onClick={() => onSetViewMode('split')}
        title="분할 보기"
        className={`${baseButtonClasses} ${getActiveButtonClasses(viewMode === 'split')}`}
        aria-pressed={viewMode === 'split'}
        aria-label="편집기 및 미리보기 분할 보기"
      >
        <span role="img" aria-hidden="true">📰</span>
        <span className="text-xs">분할 보기</span>
      </button>
      <button
        type="button"
        onClick={() => onSetViewMode('editor')}
        title="편집기 보기"
        className={`${baseButtonClasses} ${getActiveButtonClasses(viewMode === 'editor')}`}
        aria-pressed={viewMode === 'editor'}
        aria-label="편집기만 보기"
      >
        <span role="img" aria-hidden="true">📝</span>
        <span className="text-xs">편집기</span>
      </button>
      <button
        type="button"
        onClick={() => onSetViewMode('preview')}
        title="미리보기"
        className={`${baseButtonClasses} ${getActiveButtonClasses(viewMode === 'preview')}`}
        aria-pressed={viewMode === 'preview'}
        aria-label="미리보기만 보기"
      >
        <span role="img" aria-hidden="true">👁️</span>
        <span className="text-xs">미리보기</span>
      </button>
      
      <div className="h-full border-l border-slate-300 mx-1 self-stretch"></div>

      {/* Preview Theme Selector */}
      <div className="flex flex-col items-center">
        <label htmlFor="preview-theme-select" className="sr-only">미리보기 테마</label>
        <select
          id="preview-theme-select"
          value={currentThemeId}
          onChange={(e) => onSetThemeId(e.target.value as PreviewThemeIdentifier)}
          title="미리보기 테마 선택"
          className="btn-toolbar self-stretch h-full text-xs appearance-none pr-6 bg-slate-200 hover:bg-slate-300"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1.2em 1.2em' }}
        >
          {availableThemes.map(theme => (
            <option key={theme.id} value={theme.id} className="text-slate-700 bg-white">
              {theme.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-slate-600 mt-0.5">미리보기 테마</span>
      </div>

    </div>
  );
};

export default FileActions;