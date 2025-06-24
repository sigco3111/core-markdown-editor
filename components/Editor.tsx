import React, { forwardRef } from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

const Editor = forwardRef<HTMLTextAreaElement, EditorProps>(({ value, onChange }, ref) => {
  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={handleChange}
      placeholder="여기에 마크다운을 입력하세요..."
      className="w-full h-full p-6 
                 bg-slate-50 text-slate-800 
                 focus:outline-none resize-none font-mono text-base leading-relaxed 
                 selection:bg-blue-200 selection:text-blue-900
                 placeholder-slate-400 
                 flex-grow"
      spellCheck="false"
      autoCapitalize="none"
      autoCorrect="off"
      lang="ko"
      aria-label="마크다운 편집기"
    />
  );
});

Editor.displayName = 'Editor';
export default Editor;