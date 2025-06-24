

import { PreviewTheme } from './types';

export const INITIAL_MARKDOWN = `
# 코어 마크다운 편집기에 오신 것을 환영합니다!

이것은 React와 Tailwind CSS로 구축된 간단하면서도 우아한 마크다운 편집기입니다.

## 주요 기능

- **실시간 미리보기**: 렌더링된 HTML이 실시간으로 업데이트되는 것을 확인하세요.
- **반응형 디자인**: 
  - 데스크톱: 편집기와 미리보기 화면을 나란히 배치합니다.
  - 모바일: 편집기를 상단에, 미리보기 화면을 하단에 배치합니다.
- **깔끔한 인터페이스**: 콘텐츠에 집중할 수 있도록 미니멀한 디자인을 제공합니다.
- **스타일이 적용된 미리보기**: 일반적인 마크다운 요소에 가독성을 위한 스타일이 적용됩니다.
- **AI 기반 지원**: Gemini AI를 활용하여 마크다운 포맷팅, 내용 요약, 확장, 톤 변경 등 스마트한 기능을 제공합니다.

---

## 마크다운 문법 빠른 안내

### 텍스트 서식
*   *기울임꼴 텍스트* 또는 _기울임꼴 텍스트_
*   **굵은 텍스트** 또는 __굵은 텍스트__
*   \`인라인 코드\`는 \`this.variable\`처럼 보입니다.
*   ~~취소선 텍스트~~

### 제목
# 제목 1
## 제목 2
### 제목 3
#### 제목 4

### 목록
순서 없는 목록:
*   빨강
*   초록
*   파랑
    *   진한 파랑
    *   밝은 파랑

순서 있는 목록:
1.  사과
2.  바나나
3.  체리

### 링크
[마크다운 가이드 방문하기](https://www.markdownguide.org)
[OpenAI](https://openai.com "OpenAI 홈페이지")

### 인용문
> "창의성은 재미있게 노는 지능이다."
> - 알버트 아인슈타인

### 코드 블록
\`\`\`javascript
// JavaScript 예제
function greet(name) {
  console.log(\`안녕하세요, \${name}님! 마크다운 편집기가 작동 중입니다.\`);
}

greet('개발자');
\`\`\`

\`\`\`python
# Python 예제
def main():
    print("마크다운의 파이썬 코드 블록입니다!")

if __name__ == "__main__":
    main()
\`\`\`

### 수평선
---

### 표 (예제)
| 기능            | 상태        | 우선순위 |
|-----------------|-------------|----------|
| 실시간 미리보기 | 구현됨      | 높음     |
| 반응형 레이아웃 | 구현됨      | 높음     |
| AI 기반 포맷팅  | 구현됨      | 높음     |
| 구문 강조       | 예정 (CSS)  | 중간     |

<br/>

편집기 창에 마크다운 내용을 입력하거나 붙여넣으세요!
`;

export const PREVIEW_THEMES: PreviewTheme[] = [
  {
    id: 'github-light',
    name: 'GitHub Light',
    css: `
/* GitHub Light Theme - Scoped to .preview-content */
.preview-content {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  color: #24292f;
  background-color: #ffffff;
  line-height: 1.6;
  word-wrap: break-word;
}
.preview-content > *:first-child { margin-top: 0 !important; }
.preview-content h1, .preview-content h2, .preview-content h3, .preview-content h4, .preview-content h5, .preview-content h6 {
  margin-top: 24px;
  margin-bottom: 16px;
  font-weight: 600;
  line-height: 1.25;
}
.preview-content h1 { font-size: 2em; padding-bottom: .3em; border-bottom: 1px solid #d0d7de; }
.preview-content h2 { font-size: 1.5em; padding-bottom: .3em; border-bottom: 1px solid #d0d7de; }
.preview-content h3 { font-size: 1.25em; }
.preview-content h4 { font-size: 1em; }
.preview-content h5 { font-size: .875em; }
.preview-content h6 { font-size: .85em; color: #57606a; }
.preview-content p { margin-bottom: 16px; }
.preview-content a { color: #0969da; text-decoration: none; }
.preview-content a:hover { text-decoration: underline; }
.preview-content ul, .preview-content ol { margin-bottom: 16px; padding-left: 2em; }
.preview-content blockquote {
  margin-left: 0; margin-right: 0; margin-bottom: 16px;
  padding: 0 1em;
  color: #57606a;
  border-left: .25em solid #d0d7de;
}
.preview-content hr { height: .25em; padding: 0; margin: 24px 0; background-color: #d0d7de; border: 0; }
.preview-content code:not(pre code) {
  padding: .2em .4em;
  margin: 0;
  font-size: 85%;
  background-color: rgba(210,215,222,0.4); /* #d2d7de40 */
  border-radius: 6px;
  font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
}
.preview-content pre {
  margin-bottom: 16px;
  padding: 16px;
  overflow: auto;
  font-size: 85%;
  line-height: 1.45;
  background-color: #f6f8fa;
  border-radius: 6px;
  word-wrap: normal; /* Override from .preview-content */
}
.preview-content pre code.hljs { /* Uses atom-one-dark from index.html, GitHub light's own hljs is different */
  padding: 0; /* hljs already has padding when applied to pre code */
  background: transparent !important; /* Ensure pre background shows */
}
.preview-content table {
  display: block;
  width: max-content;
  max-width: 100%;
  overflow: auto;
  margin-bottom: 16px;
  border-spacing: 0;
  border-collapse: collapse;
}
.preview-content table th, .preview-content table td {
  padding: 6px 13px;
  border: 1px solid #d0d7de;
}
.preview-content table th { font-weight: 600; }
.preview-content table tr { background-color: #ffffff; border-top: 1px solid #c6cbd1; }
.preview-content table tr:nth-child(2n) { background-color: #f6f8fa; }
.preview-content img { max-width: 100%; box-sizing: content-box; background-color: #ffffff; }
`
  },
  {
    id: 'academic',
    name: '학술 논문 스타일',
    css: `
/* Academic Paper Theme - Scoped to .preview-content */
.preview-content {
  font-family: 'Georgia', 'Times New Roman', Times, serif;
  color: #333333;
  line-height: 1.75;
  background-color: #fdfdfd;
}
.preview-content h1, .preview-content h2, .preview-content h3, .preview-content h4 {
  font-family: 'Helvetica Neue', Arial, sans-serif;
  color: #1a1a1a;
  margin-top: 1.8em;
  margin-bottom: 0.6em;
  font-weight: bold;
}
.preview-content h1 { font-size: 2.2em; border-bottom: 2px solid #dedede; padding-bottom: 0.2em;}
.preview-content h2 { font-size: 1.8em; border-bottom: 1px solid #e5e5e5; padding-bottom: 0.2em;}
.preview-content h3 { font-size: 1.4em; }
.preview-content h4 { font-size: 1.1em; font-style: italic; }
.preview-content p { margin-bottom: 1.2em; text-align: justify; }
.preview-content a { color: #0056b3; text-decoration: none; }
.preview-content a:hover { text-decoration: underline; }
.preview-content ul, .preview-content ol { margin-bottom: 1.2em; padding-left: 2.5em; }
.preview-content blockquote {
  margin: 1.5em 0;
  padding: 0.5em 1.5em;
  color: #555555;
  border-left: 3px solid #cccccc;
  background-color: #f9f9f9;
  font-style: italic;
}
.preview-content hr { border: 0; border-top: 1px dashed #cccccc; margin: 2.5em 0; }
.preview-content code:not(pre code) {
  font-family: 'Menlo', 'Monaco', 'Consolas', monospace;
  background-color: #f0f0f0;
  padding: 0.15em 0.3em;
  border-radius: 3px;
  font-size: 0.9em;
}
.preview-content pre {
  margin-bottom: 1.5em;
  background-color: #2d2d2d; /* Matches atom-one-dark well */
  color: #abb2bf; /* Default light text color for pre blocks */
  border-radius: 4px;
  font-size: 0.9em;
  line-height: 1.5;
  padding: 1em; /* Added padding for consistency with other themes */
  overflow: auto; /* Added overflow for consistency */
  word-wrap: normal; /* Override from .preview-content if inherited */
}
.preview-content pre code.hljs { /* atom-one-dark is used */
    background: transparent !important; /* Ensure pre's background shows */
    /* color property will be inherited from 'pre' or set by specific hljs token styles */
}
.preview-content table {
  width: 100%;
  margin-bottom: 1.5em;
  border-collapse: collapse;
  border: 1px solid #dddddd;
}
.preview-content table th, .preview-content table td {
  padding: 0.75em;
  border: 1px solid #dddddd;
  text-align: left;
}
.preview-content table th { background-color: #f2f2f2; font-weight: bold; }
.preview-content img { display: block; margin: 1.5em auto; max-width: 90%; border: 1px solid #cccccc; padding: 5px; box-shadow: 2px 2px 5px rgba(0,0,0,0.1); }
`
  }
];
