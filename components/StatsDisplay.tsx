import React, { useMemo } from 'react';

interface StatsDisplayProps {
  text: string;
}

const StatsDisplay: React.FC<StatsDisplayProps> = ({ text }) => {
  const stats = useMemo(() => {
    const trimmedText = text.trim();
    const words = trimmedText ? trimmedText.split(/\s+/).length : 0;
    const characters = text.length;
    return { words, characters };
  }, [text]);

  return (
    <div className="absolute bottom-0 right-0 p-2 
                   bg-slate-50 text-slate-500 
                   text-xs font-mono">
      <span>단어: {stats.words}</span>
      <span className="mx-2">|</span>
      <span>글자: {stats.characters}</span>
    </div>
  );
};

export default StatsDisplay;