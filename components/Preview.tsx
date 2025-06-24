

import React, { useEffect, useMemo, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client'; 
import { useToast } from '../contexts/ToastContext';

declare global {
  interface Window {
    marked: {
      parse: (markdownString: string, options?: MarkedOptions) => string | unknown;
      Renderer: new () => MarkedRendererInstance; 
      Slugger: new () => MarkedSlugger; 
    };
    hljs: {
      highlightAll: () => void;
      highlightElement: (element: HTMLElement) => void;
    };
  }
}

interface MarkedOptions {
  gfm?: boolean;
  breaks?: boolean;
  renderer?: MarkedRendererInstance;
}

interface MarkedRendererInstance {
  heading?: (htmlOrToken: string | any, levelOrUndefined: number | undefined, rawOrUndefined: string | undefined, slugger: MarkedSlugger) => string;
}


interface MarkedSlugger {
  slug(value: string, options?: { dryrun?: boolean }): string;
  seen: { [key: string]: number };
}


interface PreviewProps {
  markdown: string;
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

const CopyIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.375a3.375 3.375 0 003.375-3.375V9.375a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125V7.5m-6 10.5a2.25 2.25 0 00-2.25-2.25H5.25a2.25 2.25 0 00-2.25 2.25v.005c0 .414.336.75.75.75h3.75a.75.75 0 00.75-.75v-.005zm0 0H9.75m0 0a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25v.005c0 .414-.336.75-.75.75h-3.75a.75.75 0 01-.75-.75v-.005z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-3 h-3 ml-1 inline-block align-baseline text-blue-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
  </svg>
);


const Preview: React.FC<PreviewProps> = ({ markdown, scrollContainerRef }) => {
  const internalPreviewRef = useRef<HTMLDivElement>(null);
  const addToast = useToast(); 

  const setRefs = useCallback((node: HTMLDivElement | null) => {
    (internalPreviewRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    if (scrollContainerRef) {
      (scrollContainerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }
  }, [scrollContainerRef]);

  const markedOptionsToUse: MarkedOptions | undefined = useMemo(() => {
    return { gfm: true, breaks: false };
  }, []);


  const rawHtml = useMemo(() => {
    if (typeof window.marked?.parse !== 'function') {
      return '<p class="text-amber-500">미리보기 라이브러리(marked.js)가 로드되지 않았습니다. 네트워크 또는 스크립트 태그를 확인하세요.</p>';
    }
    if (!markedOptionsToUse) { 
        return '<p class="text-red-500">Marked options could not be initialized.</p>';
    }

    try {
      const parsedResult = window.marked.parse(markdown, markedOptionsToUse);
      if (typeof parsedResult !== 'string') {
        console.error("Marked.parse did not return a string:", parsedResult);
        return '<p class="text-red-500">미리보기 생성 중 오류 발생: 파서가 유효한 문자열을 반환하지 않았습니다. 콘솔을 확인하세요.</p>';
      }
      return parsedResult;
    } catch (error) {
      console.error("마크다운 파싱 오류:", error);
      const errorMsg = error instanceof Error ? error.message : String(error);
      return `<p class="text-red-500">마크다운 파싱 오류: ${errorMsg}. 콘솔을 확인하세요.</p>`;
    }
  }, [markdown, markedOptionsToUse]);

  useEffect(() => {
    const previewElement = internalPreviewRef.current;
    if (!previewElement) return;

    if (typeof window.hljs?.highlightElement === 'function') {
      const codeBlocks = previewElement.querySelectorAll('pre code');
      codeBlocks.forEach((block) => {
        window.hljs.highlightElement(block as HTMLElement);
      });
    }

    const preElements = previewElement.querySelectorAll('pre');
    preElements.forEach(pre => {
      if (pre.querySelector('.copy-code-button')) return; 

      const codeElement = pre.querySelector('code');
      if (!codeElement) return;

      pre.style.position = 'relative'; 

      const button = document.createElement('button');
      button.className = `copy-code-button absolute top-2 right-2 p-1.5 
                          bg-slate-700 hover:bg-slate-600 text-slate-200 
                          rounded-md opacity-25 hover:opacity-100 focus:opacity-100 
                          transition-opacity duration-150`;
      button.setAttribute('aria-label', '코드 복사');
      button.title = '코드 복사';
      
      const iconContainer = document.createElement('span'); 
      button.appendChild(iconContainer);
      
      const tempDiv = document.createElement('div');
      const tempRoot = createRoot(tempDiv); 
      tempRoot.render(<CopyIcon />);
      if (tempDiv.firstChild) { 
        iconContainer.innerHTML = tempDiv.innerHTML;
      }


      button.onclick = async (e) => {
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(codeElement.innerText);
          addToast('코드가 클립보드에 복사되었습니다!', 'success');
        } catch (err) {
          console.error('클립보드 복사 실패:', err);
          addToast('클립보드 복사에 실패했습니다.', 'error');
        }
      };
      pre.appendChild(button);
    });

    const tocLinks = previewElement.querySelectorAll('a[href^="#"]');
    tocLinks.forEach(link => {
      const anchorLink = link as HTMLAnchorElement;
      if (!(anchorLink as any).__tocClickHandlerAttached) {
        const clickHandler = (event: MouseEvent) => {
          const href = anchorLink.getAttribute('href');
          if (href && href.startsWith('#') && href.length > 1) {
            event.preventDefault(); 
            const targetId = decodeURIComponent(href.substring(1)); 
            const targetElement = previewElement.ownerDocument.getElementById(targetId);
            
            if (targetElement) {
              targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
              addToast(`링크된 섹션 '#${targetId}'을(를) 찾을 수 없습니다.`, "error");
            }
          }
        };
        anchorLink.addEventListener('click', clickHandler);
        (anchorLink as any).__tocClickHandlerAttached = true; 
      }
    });

    const externalLinks = previewElement.querySelectorAll('a[href^="http://"], a[href^="https://"]');
    externalLinks.forEach(link => {
      const anchorLink = link as HTMLAnchorElement;
      anchorLink.target = '_blank';
      anchorLink.rel = 'noopener noreferrer';
      
      if (!anchorLink.querySelector('.external-link-icon')) {
        const iconSpan = document.createElement('span');
        iconSpan.className = 'external-link-icon inline-flex items-center';
        
        const tempDiv = document.createElement('div');
        const tempRoot = createRoot(tempDiv); 
        tempRoot.render(<ExternalLinkIcon />); 
        if (tempDiv.firstChild) { 
            iconSpan.innerHTML = tempDiv.innerHTML;
        }

        anchorLink.appendChild(iconSpan);
      }
    });

  }, [rawHtml, addToast]); 

  return (
    <div
      ref={setRefs} 
      className={`
        preview-content w-full h-full p-6 overflow-y-auto 
        selection:bg-yellow-200 selection:text-yellow-900
      `}
      dangerouslySetInnerHTML={{ __html: rawHtml }}
      lang="ko"
      aria-live="polite"
    />
  );
};

export default Preview;
