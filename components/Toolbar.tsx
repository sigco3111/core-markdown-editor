
import React, { useState, useRef, useEffect } from 'react';
import { FormattingAction, AiAssistAction } from '../types';

interface ToolbarButtonProps {
  action: FormattingAction;
  onClick: (action: FormattingAction, value?:string) => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
  ariaLabel?: string;
}

const ToolbarButtonInternal: React.FC<ToolbarButtonProps> = ({ action, onClick, title, children, disabled, ariaLabel }) => (
  <button
    type="button"
    onClick={() => onClick(action)}
    title={title}
    className="btn-toolbar flex flex-col items-center gap-y-1" 
    aria-label={ariaLabel || title}
    disabled={disabled}
  >
    {children}
  </button>
);

interface ToolbarProps {
  onApplyFormat: (action: FormattingAction, value?: string) => void;
  onAiFormat: () => void;
  onAiAssist: (action: AiAssistAction) => void;
  onInsertToc: () => void;
  isAiFormatting: boolean;
  isAiSuggesting: boolean;
  isAiAvailable: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({ 
  onApplyFormat, 
  onAiFormat, 
  onAiAssist,
  onInsertToc, 
  isAiFormatting, 
  isAiSuggesting,
  isAiAvailable 
}) => {
  const [isAiAssistOpen, setIsAiAssistOpen] = useState(false);
  const aiAssistButtonRef = useRef<HTMLDivElement>(null);
  const commonButtonDisabled = isAiFormatting || isAiSuggesting;

  const aiAssistActions: { label: string; action: AiAssistAction }[] = [
    { label: '요약하기', action: 'summarize' },
    { label: '자세히 쓰기', action: 'elaborate' },
    { label: '전문적으로 변경', action: 'tone-professional' },
    { label: '친근하게 변경', action: 'tone-friendly' },
    { label: '간결하게 변경', action: 'tone-concise' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aiAssistButtonRef.current && !aiAssistButtonRef.current.contains(event.target as Node)) {
        setIsAiAssistOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="flex items-start space-x-1 p-2 bg-slate-100 border-b border-slate-300 flex-wrap print:hidden" role="toolbar" aria-label="텍스트 서식 및 도구 모음">
      <ToolbarButtonInternal action="bold" onClick={onApplyFormat} title="굵게 (Ctrl+B)" disabled={commonButtonDisabled} ariaLabel="굵게">
        <span role="img" aria-hidden="true">🅱️</span>
        <span className="text-xs">굵게</span>
      </ToolbarButtonInternal>
      <ToolbarButtonInternal action="italic" onClick={onApplyFormat} title="기울임꼴 (Ctrl+I)" disabled={commonButtonDisabled} ariaLabel="기울임꼴">
        <span role="img" aria-hidden="true" style={{fontStyle: 'italic'}}>I</span>
        <span className="text-xs">기울임</span>
      </ToolbarButtonInternal>
      <ToolbarButtonInternal action="strikethrough" onClick={onApplyFormat} title="취소선" disabled={commonButtonDisabled} ariaLabel="취소선">
        <span role="img" aria-hidden="true" style={{textDecoration: 'line-through'}}>S</span>
        <span className="text-xs">취소선</span>
      </ToolbarButtonInternal>
      <ToolbarButtonInternal action="link" onClick={onApplyFormat} title="링크 삽입" disabled={commonButtonDisabled} ariaLabel="링크 삽입">
        <span role="img" aria-hidden="true">🔗</span>
        <span className="text-xs">링크</span>
      </ToolbarButtonInternal>
      <ToolbarButtonInternal action="code" onClick={onApplyFormat} title="인라인 코드" disabled={commonButtonDisabled} ariaLabel="인라인 코드">
        <code aria-hidden="true">&lt;/&gt;</code>
        <span className="text-xs">코드</span>
      </ToolbarButtonInternal>
      <ToolbarButtonInternal action="code-block" onClick={onApplyFormat} title="코드 블록" disabled={commonButtonDisabled} ariaLabel="코드 블록">
        <span role="img" aria-hidden="true">🧱</span>
        <span className="text-xs">코드블록</span>
      </ToolbarButtonInternal>
      <ToolbarButtonInternal action="ul" onClick={onApplyFormat} title="글머리 기호 목록" disabled={commonButtonDisabled} ariaLabel="글머리 기호 목록">
        <span role="img" aria-hidden="true">•</span>
        <span className="text-xs">글머리</span>
      </ToolbarButtonInternal>
      <ToolbarButtonInternal action="ol" onClick={onApplyFormat} title="번호 매기기 목록" disabled={commonButtonDisabled} ariaLabel="번호 매기기 목록">
        <span role="img" aria-hidden="true">⒈</span>
        <span className="text-xs">번호</span>
      </ToolbarButtonInternal>
      <ToolbarButtonInternal action="quote" onClick={onApplyFormat} title="인용문" disabled={commonButtonDisabled} ariaLabel="인용문">
        <span role="img" aria-hidden="true">❞</span>
        <span className="text-xs">인용</span>
      </ToolbarButtonInternal>
      
      <select
        onChange={(e) => onApplyFormat(e.target.value as FormattingAction)}
        title="제목 선택"
        className="btn-toolbar self-stretch" 
        aria-label="제목 수준 선택"
        defaultValue=""
        disabled={commonButtonDisabled}
      >
        <option value="" disabled>제목</option>
        <option value="h1">H1</option>
        <option value="h2">H2</option>
        <option value="h3">H3</option>
        <option value="h4">H4</option>
      </select>

      <button
        type="button"
        onClick={onInsertToc}
        title="목차 삽입"
        className="btn-toolbar flex flex-col items-center gap-y-1" 
        disabled={commonButtonDisabled}
        aria-label="목차 삽입"
      >
        <span role="img" aria-hidden="true">📑</span>
        <span className="text-xs">목차</span>
      </button>

      {isAiAvailable && (
        <>
          <button
            type="button"
            onClick={onAiFormat}
            title="AI로 마크다운 포맷 개선"
            className="btn-toolbar flex flex-col items-center gap-y-1" 
            disabled={commonButtonDisabled}
            aria-label={isAiFormatting ? "AI 포맷팅 진행 중" : "AI로 마크다운 포맷 개선"}
          >
            <span role="img" aria-hidden="true">✨</span>
            <span className="text-xs">{isAiFormatting ? "포맷팅 중..." : "AI 포맷"}</span>
          </button>

          <div className="relative" ref={aiAssistButtonRef}>
            <button
              type="button"
              onClick={() => setIsAiAssistOpen(prev => !prev)}
              title="AI 텍스트 지원"
              className="btn-toolbar flex flex-col items-center gap-y-1" 
              disabled={commonButtonDisabled}
              aria-expanded={isAiAssistOpen}
              aria-haspopup="true"
              aria-label={isAiSuggesting ? "AI 텍스트 지원 작업 진행 중" : "AI 텍스트 지원"}
            >
              <span role="img" aria-hidden="true">💡</span>
              <span className="text-xs">
                {isAiSuggesting ? "AI 작업중..." : "AI 도우미"}
                <span className="ml-0.5" aria-hidden="true">▾</span>
              </span>
            </button>
            {isAiAssistOpen && (
              <div 
                className="absolute z-10 mt-1 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none py-1 origin-top-right right-0 md:origin-top-left md:left-0 md:right-auto"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="ai-assist-button"
              >
                {aiAssistActions.map((item) => (
                  <button
                    key={item.action}
                    onClick={() => {
                      onAiAssist(item.action);
                      setIsAiAssistOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-slate-700 hover:bg-slate-100 hover:text-slate-900 btn-toolbar justify-start text-xs"
                    role="menuitem"
                    disabled={commonButtonDisabled}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Toolbar;