
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import Editor from './components/Editor';
import Preview from './components/Preview';
import Toolbar from './components/Toolbar';
import FileActions from './components/FileActions';
import ApiKeyManager from './components/ApiKeyManager';
import StatsDisplay from './components/StatsDisplay';
import ConfirmModal from './components/ConfirmModal';
import ToastContainer from './components/ToastContainer';
import { useToast } from './contexts/ToastContext';
import { INITIAL_MARKDOWN, PREVIEW_THEMES } from './constants';
import { FormattingAction, AiAssistAction, ViewMode, PreviewThemeIdentifier } from './types';

const LOCAL_STORAGE_KEY_MARKDOWN = 'markdownProEditorContent_v2';
const LOCAL_STORAGE_KEY_PREVIEW_THEME = 'markdownProEditorPreviewTheme_v1';
const LOCAL_STORAGE_KEY_API_KEY = 'markdownProEditorApiKey_v1';
const AUTOSAVE_DELAY = 2000; // 2초

type ConfirmActionType = (() => void) & { _customCancel?: () => void };

const App: React.FC = () => {
  const [markdownText, setMarkdownText] = useState<string>('');
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const previewScrollContainerRef = useRef<HTMLDivElement>(null);
  const addToast = useToast();

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [confirmModalMessage, setConfirmModalMessage] = useState<string>('');
  const [confirmAction, setConfirmAction] = useState<ConfirmActionType | null>(null);
  
  const [isAiFormatting, setIsAiFormatting] = useState<boolean>(false);
  const [isAiSuggesting, setIsAiSuggesting] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');

  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [persistedApiKey, setPersistedApiKey] = useState<string | null>(null);
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [isAiInitializing, setIsAiInitializing] = useState<boolean>(false);
  const [apiKeyStatusText, setApiKeyStatusText] = useState<string>("API 키를 설정해주세요.");


  const [currentPreviewThemeId, setCurrentPreviewThemeId] = useState<PreviewThemeIdentifier>(() => {
    const savedThemeValue = localStorage.getItem(LOCAL_STORAGE_KEY_PREVIEW_THEME);
    const defaultThemeId: PreviewThemeIdentifier = PREVIEW_THEMES.length > 0 ? PREVIEW_THEMES[0].id : 'github-light';

    if (savedThemeValue) {
      const isValidCurrentTheme = PREVIEW_THEMES.some(theme => theme.id === savedThemeValue);
      if (isValidCurrentTheme) {
        return savedThemeValue as PreviewThemeIdentifier;
      } else if (savedThemeValue === 'default') { 
        localStorage.setItem(LOCAL_STORAGE_KEY_PREVIEW_THEME, defaultThemeId);
        return defaultThemeId;
      }
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_PREVIEW_THEME, defaultThemeId);
    return defaultThemeId;
  });

  const isProgrammaticallyScrollingEditor = useRef(false);
  const isProgrammaticallyScrollingPreview = useRef(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(LOCAL_STORAGE_KEY_API_KEY);
    // Fallback to process.env.API_KEY only if nothing is in localStorage
    const envKey = process.env.API_KEY; 
    const initialKey = storedKey || envKey;
  
    if (initialKey) {
      setApiKeyInput(initialKey);
      setPersistedApiKey(initialKey); // This will trigger AI initialization effect
    } else {
      setApiKeyStatusText("API 키가 설정되지 않았습니다. AI 기능을 사용하려면 키를 입력하세요.");
    }
  }, []); // Runs once on mount

  useEffect(() => {
    if (persistedApiKey) {
      setIsAiInitializing(true);
      setApiKeyStatusText("API 키 확인 중...");
      // Wrap in a timeout to ensure state updates before heavy operation
      const timer = setTimeout(() => {
        try {
          const newAiInstance = new GoogleGenAI({ apiKey: persistedApiKey });
          setAi(newAiInstance);
          setApiKeyStatusText("Gemini API 활성 상태");
          // Avoid toast on initial load if key comes from env/storage silently
          // if (isAiInitializing) addToast("Gemini API가 활성화되었습니다.", "success");
        } catch (error) {
          console.error("GoogleGenAI 초기화 실패:", error);
          setAi(null);
          setApiKeyStatusText("API 키가 유효하지 않습니다. 확인 후 다시 시도해주세요.");
          if (isAiInitializing) addToast("API 키 초기화에 실패했습니다. 키를 확인해주세요.", "error");
        } finally {
          setIsAiInitializing(false);
        }
      }, 0);
      return () => clearTimeout(timer);
    } else {
      setAi(null);
      // Status text for 'no key' is handled by load effect or save action
    }
  }, [persistedApiKey, addToast]);


  const handleSaveApiKey = useCallback(() => {
    const trimmedKey = apiKeyInput.trim();
    if (!trimmedKey) {
      localStorage.removeItem(LOCAL_STORAGE_KEY_API_KEY);
      setPersistedApiKey(null);
      setAi(null); // Explicitly set AI to null
      setApiKeyStatusText("API 키가 제거되었습니다. AI 기능이 비활성화됩니다.");
      addToast("API 키가 제거되었습니다.", "info");
      return;
    }
    localStorage.setItem(LOCAL_STORAGE_KEY_API_KEY, trimmedKey);
    setPersistedApiKey(trimmedKey); // This triggers the AI re-initialization effect
    addToast("API 키가 저장되었습니다. AI 초기화를 시도합니다.", "info");
  }, [apiKeyInput, addToast]);


  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_PREVIEW_THEME, currentPreviewThemeId);
    const theme = PREVIEW_THEMES.find(t => t.id === currentPreviewThemeId) || PREVIEW_THEMES[0];
    const styleElement = document.getElementById('dynamic-preview-theme-styles');
    if (styleElement && theme) {
      styleElement.innerHTML = theme.css;
    }
  }, [currentPreviewThemeId]);

  useEffect(() => {
    const savedMarkdown = localStorage.getItem(LOCAL_STORAGE_KEY_MARKDOWN);
    if (savedMarkdown && savedMarkdown !== INITIAL_MARKDOWN) {
      showConfirmDialog(
        "이전에 편집하던 내용이 있습니다. 불러오시겠습니까? '아니요'를 선택하면 기본 템플릿으로 시작합니다.",
        () => {
          setMarkdownText(savedMarkdown);
          addToast("이전 내용을 불러왔습니다.", "info");
        },
        () => {
          setMarkdownText(INITIAL_MARKDOWN);
        }
      );
    } else {
      setMarkdownText(INITIAL_MARKDOWN);
    }
  }, [addToast]); // addToast added to dependency array

  useEffect(() => {
    const handler = setTimeout(() => {
      if (markdownText && markdownText !== INITIAL_MARKDOWN) {
        localStorage.setItem(LOCAL_STORAGE_KEY_MARKDOWN, markdownText);
      }
    }, AUTOSAVE_DELAY);

    return () => {
      clearTimeout(handler);
    };
  }, [markdownText]);


  useEffect(() => {
    const editorElement = editorRef.current;
    const previewElement = previewScrollContainerRef.current;

    const localHandleEditorScroll = () => {
      if (isProgrammaticallyScrollingEditor.current) {
        isProgrammaticallyScrollingEditor.current = false;
        return;
      }
      if (!editorRef.current || !previewScrollContainerRef.current) return;
  
      const editor = editorRef.current;
      const preview = previewScrollContainerRef.current;
  
      const editorScrollableHeight = editor.scrollHeight - editor.clientHeight;
      if (editorScrollableHeight <= 0) { 
        preview.scrollTop = 0; 
        return;
      }
  
      const scrollPercentage = editor.scrollTop / editorScrollableHeight;
      
      const previewScrollableHeight = preview.scrollHeight - preview.clientHeight;
      if (previewScrollableHeight > 0) {
        isProgrammaticallyScrollingPreview.current = true;
        preview.scrollTop = Math.min(
            previewScrollableHeight, 
            Math.max(0, scrollPercentage * previewScrollableHeight)
        );
      }
    };

    const localHandlePreviewScroll = () => {
      if (isProgrammaticallyScrollingPreview.current) {
        isProgrammaticallyScrollingPreview.current = false;
        return;
      }
      if (!editorRef.current || !previewScrollContainerRef.current) return;
      
      const editor = editorRef.current;
      const preview = previewScrollContainerRef.current;
  
      const previewScrollableHeight = preview.scrollHeight - preview.clientHeight;
      if (previewScrollableHeight <= 0) {
        editor.scrollTop = 0; 
        return;
      }
  
      const scrollPercentage = preview.scrollTop / previewScrollableHeight;
  
      const editorScrollableHeight = editor.scrollHeight - editor.clientHeight;
      if (editorScrollableHeight > 0) {
        isProgrammaticallyScrollingEditor.current = true;
        editor.scrollTop = Math.min(
            editorScrollableHeight,
            Math.max(0, scrollPercentage * editorScrollableHeight)
        );
      }
    };

    if (viewMode === 'split' && editorElement && previewElement) {
      editorElement.addEventListener('scroll', localHandleEditorScroll, { passive: true });
      previewElement.addEventListener('scroll', localHandlePreviewScroll, { passive: true });

      return () => {
        if (editorElement) editorElement.removeEventListener('scroll', localHandleEditorScroll);
        if (previewElement) previewElement.removeEventListener('scroll', localHandlePreviewScroll);
      };
    }
  }, [viewMode]); 

  const handleMarkdownChange = useCallback((newText: string) => {
    setMarkdownText(newText);
  }, []);

  const applyFormatting = useCallback((action: FormattingAction, value?: string) => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let newText = '';
    let cursorPos = start;

    switch (action) {
      case 'bold':
        newText = `**${selectedText || '텍스트'}**`;
        cursorPos = selectedText ? start + newText.length : start + 2;
        break;
      case 'italic':
        newText = `*${selectedText || '텍스트'}*`;
        cursorPos = selectedText ? start + newText.length : start + 1;
        break;
      case 'strikethrough':
        newText = `~~${selectedText || '텍스트'}~~`;
        cursorPos = selectedText ? start + newText.length : start + 2;
        break;
      case 'link':
        const url = prompt("링크 URL을 입력하세요:", "https://"); 
        if (url) {
          newText = `[${selectedText || '링크 텍스트'}](${url})`;
          cursorPos = selectedText ? start + newText.length : start + 1;
        } else {
          return; 
        }
        break;
      case 'code':
        newText = `\`${selectedText || '코드'}\``;
        cursorPos = selectedText ? start + newText.length : start + 1;
        break;
      case 'code-block':
        newText = `\`\`\`\n${selectedText || '코드 내용을 여기에 입력하세요'}\n\`\`\``;
        cursorPos = selectedText ? start + newText.length : start + 4;
        break;
      case 'ul':
        newText = `* ${selectedText || '항목'}`;
        cursorPos = start + newText.length;
        break;
      case 'ol':
        newText = `1. ${selectedText || '항목'}`;
        cursorPos = start + newText.length;
        break;
      case 'quote':
        newText = `> ${selectedText || '인용문'}`;
        cursorPos = start + newText.length;
        break;
      case 'h1': case 'h2': case 'h3': case 'h4':
        const level = parseInt(action.charAt(1));
        newText = `${'#'.repeat(level)} ${selectedText || '제목'}`;
        cursorPos = start + newText.length;
        break;
    }
    
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    const updatedText = before + newText + after;
    setMarkdownText(updatedText);

    setTimeout(() => {
      textarea.focus();
       if (!selectedText && (action === 'bold' || action === 'italic' || action === 'strikethrough' || action === 'code')) {
         textarea.setSelectionRange(cursorPos - newText.length + (action === 'bold' || action === 'strikethrough' ? 2 : 1) , cursorPos - (action === 'bold' || action === 'strikethrough' ? 2 : 1));
       } else if (!selectedText && action === 'link') {
         textarea.setSelectionRange(start + 1, start + 1 + '링크 텍스트'.length);
       } else if (!selectedText && (action.startsWith('h') || action === 'ul' || action === 'ol' || action === 'quote')) {
         const placeholder = action.startsWith('h') ? '제목' : (action === 'ul' || action === 'ol' ? '항목' : '인용문');
         textarea.setSelectionRange(cursorPos - placeholder.length, cursorPos);
       } else if (!selectedText && action === 'code-block') {
         const placeholder = '코드 내용을 여기에 입력하세요';
         textarea.setSelectionRange(start + 4, start + 4 + placeholder.length);
       } else {
         textarea.setSelectionRange(cursorPos, cursorPos);
       }
    }, 0);
  }, []);

  const showConfirmDialog = (message: string, onConfirmCallback: () => void, onCancelCallback?: () => void) => {
    setConfirmModalMessage(message);

    const newAction: ConfirmActionType = () => {
      onConfirmCallback();
    };

    if (onCancelCallback) {
      newAction._customCancel = onCancelCallback;
    }

    setConfirmAction(() => newAction);
    setIsConfirmModalOpen(true);
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction();
    }
    setIsConfirmModalOpen(false);
    setConfirmAction(null); 
  };

  const handleCancel = () => {
    if (confirmAction && typeof confirmAction._customCancel === 'function') {
      confirmAction._customCancel();
    }
    setIsConfirmModalOpen(false);
    setConfirmAction(null);
  };

  const getThemedHtmlContent = (parsedMarkdown: string): string => {
    const selectedTheme = PREVIEW_THEMES.find(t => t.id === currentPreviewThemeId) || (PREVIEW_THEMES.length > 0 ? PREVIEW_THEMES[0] : {id:'github-light', name:'GitHub Light', css:''});
    const baseStylesElement = document.querySelector('style:not(#dynamic-preview-theme-styles)'); 
    const baseCss = baseStylesElement ? baseStylesElement.innerHTML : '';

    return `
      <!DOCTYPE html>
      <html lang="ko">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>마크다운 문서</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
          <style>
            body { margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
            .preview-content { padding: 20px; box-sizing: border-box; } 
            ${baseCss}
          </style>
          <style>
            ${selectedTheme.css}
          </style>
      </head>
      <body>
          <div class="preview-content">
              ${parsedMarkdown}
          </div>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
          <script>
            if (window.hljs) {
              document.querySelectorAll('pre code').forEach((block) => {
                window.hljs.highlightElement(block);
              });
            }
          </script>
      </body>
      </html>`;
  };

  const handleFileAction = useCallback((action: 'new' | 'download-md' | 'copy' | 'load' | 'download-html' | 'download-pdf') => {
    switch (action) {
      case 'new':
        showConfirmDialog("현재 내용을 지우고 새 파일을 만드시겠습니까? 저장하지 않은 변경사항은 사라집니다.", () => {
          setMarkdownText(INITIAL_MARKDOWN);
          localStorage.removeItem(LOCAL_STORAGE_KEY_MARKDOWN);
          addToast("새로운 문서가 시작되었습니다.", "info");
        });
        break;
      case 'load':
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.md,.markdown,.txt';
        fileInput.onchange = (e) => {
          const target = e.target as HTMLInputElement;
          const file = target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const fileContent = event.target?.result as string;
              if (markdownText === fileContent) {
                addToast("현재 내용과 동일한 파일입니다.", "info");
                return;
              }
              showConfirmDialog(
                "현재 내용을 선택한 파일의 내용으로 바꾸시겠습니까? 저장하지 않은 변경사항은 사라집니다.",
                () => {
                  setMarkdownText(fileContent);
                  addToast(`${file.name} 파일을 불러왔습니다.`, "success");
                }
              );
            };
            reader.onerror = () => {
              addToast("파일을 불러오는 데 실패했습니다.", "error");
            };
            reader.readAsText(file);
          }
          fileInput.remove();
        };
        fileInput.click();
        break;
      case 'download-md':
        const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
        const mdUrl = URL.createObjectURL(blob);
        const mdA = document.createElement('a');
        mdA.href = mdUrl;
        mdA.download = 'markdown-export.md';
        document.body.appendChild(mdA);
        mdA.click();
        document.body.removeChild(mdA);
        URL.revokeObjectURL(mdUrl);
        addToast("마크다운 파일이 다운로드되었습니다.", "success");
        break;
      case 'copy':
        navigator.clipboard.writeText(markdownText)
          .then(() => addToast("마크다운이 클립보드에 복사되었습니다!", "success"))
          .catch(err => {
            console.error("클립보드 복사 실패:", err);
            addToast("클립보드 복사에 실패했습니다.", "error");
          });
        break;
      case 'download-html':
        if (typeof window.marked?.parse !== 'function') {
          addToast("미리보기 라이브러리가 로드되지 않아 HTML을 내보낼 수 없습니다.", "error");
          return;
        }
        const parsedForHtml = window.marked.parse(markdownText, { gfm: true, breaks: false }) as string;
        const fullHtml = getThemedHtmlContent(parsedForHtml);
        const htmlBlob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
        const htmlUrl = URL.createObjectURL(htmlBlob);
        const htmlA = document.createElement('a');
        htmlA.href = htmlUrl;
        htmlA.download = 'markdown-export.html';
        document.body.appendChild(htmlA);
        htmlA.click();
        document.body.removeChild(htmlA);
        URL.revokeObjectURL(htmlUrl);
        addToast("HTML 파일이 다운로드되었습니다.", "success");
        break;
      case 'download-pdf':
        if (typeof window.marked?.parse !== 'function' || typeof window.html2pdf !== 'function') {
          addToast("필수 라이브러리가 로드되지 않아 PDF를 내보낼 수 없습니다. (marked/html2pdf)", "error");
          return;
        }
        const parsedForPdf = window.marked.parse(markdownText, { gfm: true, breaks: false }) as string;
        const fullHtmlForPdf = getThemedHtmlContent(parsedForPdf);
        
        const opt = {
          margin:       [10, 10, 10, 10], 
          filename:     'markdown-export.pdf',
          image:        { type: 'jpeg', quality: 0.98 },
          html2canvas:  { scale: 2, useCORS: true, logging: false },
          jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        
        addToast("PDF 생성 중... 잠시 기다려주세요.", "info");

        window.html2pdf().from(fullHtmlForPdf).set(opt).save()
          .then(() => {
            addToast("PDF 파일이 다운로드되었습니다.", "success");
          })
          .catch((err: Error) => {
            console.error("PDF 생성 오류:", err);
            addToast(`PDF 생성에 실패했습니다: ${err.message}`, "error");
          });
        break;
    }
  }, [markdownText, addToast, currentPreviewThemeId]);

  const isAiFunctionalityAvailable = !!ai && !isAiInitializing;

  const handleAiFormat = useCallback(async () => {
    if (!isAiFunctionalityAvailable) {
      addToast("AI 포맷팅 기능을 사용할 수 없습니다. API 키를 확인하거나 초기화를 기다려주세요.", "warning");
      return;
    }
    if (!markdownText.trim()) {
      addToast("포맷할 내용이 없습니다.", "info");
      return;
    }

    showConfirmDialog(
      "AI를 사용하여 현재 내용을 자동으로 다시 포맷하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
      async () => {
        setIsAiFormatting(true);
        try {
          const prompt = `You are an expert Markdown formatter. Your task is to take the following Markdown text and improve its formatting, clarity, and structure.
Ensure the output is valid Markdown.
Correct grammatical errors and typos if obvious.
Organize content logically. For example, use appropriate heading levels, and ensure lists are well-formed.
Do not add new content or change the meaning of the original text.
Only return the improved Markdown content.

Original Markdown:
${markdownText}`;

          const response: GenerateContentResponse = await ai.models.generateContent({ // ai is now from state
            model: 'gemini-2.5-flash',
            contents: prompt,
          });
          
          const formattedText = response.text;
          if (formattedText) {
            setMarkdownText(formattedText);
            addToast("AI 포맷팅이 완료되었습니다.", "success");
          } else {
            throw new Error("AI가 유효한 응답을 반환하지 않았습니다.");
          }
        } catch (error) {
          console.error("AI 포맷팅 오류:", error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          addToast(`AI 포맷팅에 실패했습니다: ${errorMessage}`, "error");
        } finally {
          setIsAiFormatting(false);
        }
      }
    );
  }, [markdownText, addToast, ai, isAiFunctionalityAvailable]);

  const handleAiAssist = useCallback(async (assistAction: AiAssistAction) => {
    if (!isAiFunctionalityAvailable) {
      addToast("AI 지원 기능을 사용할 수 없습니다. API 키를 확인하거나 초기화를 기다려주세요.", "warning");
      return;
    }
    const textarea = editorRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    if (!selectedText.trim()) {
      addToast("AI 지원 기능을 사용하려면 텍스트를 선택해주세요.", "info");
      return;
    }

    let prompt = "";
    let actionDescription = "";

    switch (assistAction) {
      case 'summarize':
        prompt = `다음 텍스트를 간결하게 요약해주세요. 핵심 내용을 중심으로 명확하게 정리해주세요:\n\n${selectedText}`;
        actionDescription = "AI 요약";
        break;
      case 'elaborate':
        prompt = `다음 텍스트에 대해 더 자세한 설명을 추가하여 내용을 풍부하게 만들어주세요. 원본 텍스트의 핵심 아이디어를 확장하고, 관련된 세부 정보나 예시를 포함시켜주세요. 새로운 주제를 도입하지는 마세요:\n\n${selectedText}`;
        actionDescription = "AI 내용 확장";
        break;
      case 'tone-professional':
        prompt = `다음 텍스트를 매우 전문적이고 공식적인 스타일로 수정해주세요. 격식 있는 어휘를 사용하고, 문장 구조를 명확하게 다듬어주세요:\n\n${selectedText}`;
        actionDescription = "AI 톤 변경 (전문적)";
        break;
      case 'tone-friendly':
        prompt = `다음 텍스트를 더 친근하고 다가가기 쉬운 스타일로 수정해주세요. 부드러운 어투와 일상적인 표현을 사용해주세요:\n\n${selectedText}`;
        actionDescription = "AI 톤 변경 (친근하게)";
        break;
      case 'tone-concise':
        prompt = `다음 텍스트를 핵심 내용만 남기고 최대한 간결하게 요약 및 수정해주세요. 불필요한 단어나 반복적인 표현을 제거해주세요:\n\n${selectedText}`;
        actionDescription = "AI 톤 변경 (간결하게)";
        break;
      default:
        return;
    }
    
    showConfirmDialog(
      `선택한 텍스트에 대해 '${actionDescription}' 기능을 실행하시겠습니까? 이 작업은 선택된 텍스트를 변경합니다.`,
      async () => {
        setIsAiSuggesting(true);
        try {
          const response: GenerateContentResponse = await ai.models.generateContent({ // ai is now from state
            model: 'gemini-2.5-flash',
            contents: prompt,
          });

          const suggestedText = response.text;
          if (suggestedText) {
            const before = textarea.value.substring(0, start);
            const after = textarea.value.substring(end);
            const updatedText = before + suggestedText + after;
            setMarkdownText(updatedText);

            setTimeout(() => {
              textarea.focus();
              textarea.setSelectionRange(start, start + suggestedText.length);
            }, 0);
            addToast(`${actionDescription}이(가) 적용되었습니다.`, "success");
          } else {
            throw new Error("AI가 유효한 응답을 반환하지 않았습니다.");
          }
        } catch (error) {
          console.error(`${actionDescription} 오류:`, error);
          const errorMessage = error instanceof Error ? error.message : String(error);
          addToast(`${actionDescription}에 실패했습니다: ${errorMessage}`, "error");
        } finally {
          setIsAiSuggesting(false);
        }
      }
    );
  }, [addToast, ai, isAiFunctionalityAvailable]);


  const handleInsertToc = useCallback(() => {
    const textarea = editorRef.current;
    if (!textarea) return;

    const lines = markdownText.split('\n');
    const tocEntries: { level: number; text: string; slug: string }[] = [];
    const existingSlugs: { [key: string]: number } = {};

    const generateSlug = (text: string): string => {
      let slug = text
        .toLowerCase()
        .replace(/\s+/g, '-') 
        .replace(/[^\wㄱ-ㅎㅏ-ㅣ가-힣-]+/g, '') 
        .replace(/--+/g, '-'); 
      
      if (slug === '') slug = 'header'; 

      let originalSlug = slug;
      let counter = 0;
      while (existingSlugs[slug] !== undefined) {
        counter++;
        slug = `${originalSlug}-${counter}`;
      }
      existingSlugs[slug] = 0; 
      return slug;
    };

    lines.forEach(line => {
      const match = line.match(/^(#{1,4})\s+(.*)/); 
      if (match) {
        const level = match[1].length;
        const text = match[2].trim();
        if (text) {
          const slug = generateSlug(text);
          tocEntries.push({ level, text, slug });
        }
      }
    });

    if (tocEntries.length === 0) {
      addToast("문서에 목차를 생성할 제목이 없습니다.", "info");
      return;
    }

    let tocMarkdown = "## 목차\n\n";
    tocEntries.forEach(entry => {
      const indentCount = Math.max(0, entry.level - tocEntries[0].level); 
      const indent = '  '.repeat(indentCount);
      tocMarkdown += `${indent}* [${entry.text}](#${entry.slug})\n`;
    });
    tocMarkdown += "\n"; 

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    
    const updatedText = before + tocMarkdown + after;
    setMarkdownText(updatedText);
    addToast("목차가 삽입되었습니다.", "success");

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + tocMarkdown.length, start + tocMarkdown.length);
    }, 0);

  }, [markdownText, addToast]);


  return (
    <div className="flex flex-col h-screen antialiased bg-slate-100">
      <ToastContainer />
      <Toolbar 
        onApplyFormat={applyFormatting} 
        onAiFormat={handleAiFormat}
        onAiAssist={handleAiAssist}
        onInsertToc={handleInsertToc}
        isAiFormatting={isAiFormatting}
        isAiSuggesting={isAiSuggesting}
        isAiAvailable={isAiFunctionalityAvailable}
      />
      <FileActions 
        onFileAction={handleFileAction} 
        viewMode={viewMode}
        onSetViewMode={setViewMode}
        availableThemes={PREVIEW_THEMES}
        currentThemeId={currentPreviewThemeId}
        onSetThemeId={setCurrentPreviewThemeId}
      />
      <ApiKeyManager
        apiKeyInput={apiKeyInput}
        onApiKeyInputChange={setApiKeyInput}
        onSaveApiKey={handleSaveApiKey}
        apiKeyStatusText={apiKeyStatusText}
        isAiInitializing={isAiInitializing}
      />
      <div className={`flex-grow min-h-0 ${viewMode === 'split' ? 'flex flex-col md:flex-row' : 'flex flex-col'}`}>
        { (viewMode === 'split' || viewMode === 'editor') && (
          <div className={`
            ${viewMode === 'split' ? 'w-full md:w-1/2 h-1/2 md:h-full' : 'w-full h-full flex-grow'}
            flex flex-col bg-slate-50 relative
          `}>
            <Editor ref={editorRef} value={markdownText} onChange={handleMarkdownChange} />
            {(viewMode === 'split' || viewMode === 'editor') && <StatsDisplay text={markdownText} />}
          </div>
        )}

        { viewMode === 'split' && (
          <>
            <div className="w-full h-1.5 bg-slate-300 md:hidden" aria-hidden="true"></div>
            <div className="w-1.5 h-full bg-slate-300 hidden md:block" aria-hidden="true"></div>
          </>
        )}

        { (viewMode === 'split' || viewMode === 'preview') && (
          <div className={`
            ${viewMode === 'split' ? 'w-full md:w-1/2 h-1/2 md:h-full' : 'w-full h-full flex-grow'}
            flex flex-col bg-white 
          `}>
            <Preview markdown={markdownText} scrollContainerRef={previewScrollContainerRef} />
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={isConfirmModalOpen}
        message={confirmModalMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default App;
