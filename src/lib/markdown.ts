// 경량 마크다운 → 안전 HTML (관리자 작성 본문용). 먼저 HTML 이스케이프 후 제한 문법만 변환. (XSS 방지, §22)
// 지원: ## h2, ### h3, > 인용, - 목록, 빈 줄 문단, [텍스트](url) 링크, **굵게**

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function inline(s: string): string {
  // 링크: 외부(http/https)는 새 창+nofollow, 내부(/로 시작)는 일반 내부 링크(SEO 내부링크)
  let out = esc(s).replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g,
    (_m, text: string, url: string) =>
      /^https?:/.test(url)
        ? `<a href="${url}" target="_blank" rel="noopener noreferrer nofollow">${text}</a>`
        : `<a href="${url}">${text}</a>`,
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  return out;
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let listOpen = false;
  const closeList = () => {
    if (listOpen) {
      html.push('</ul>');
      listOpen = false;
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^###\s+/.test(line)) {
      closeList();
      html.push(`<h3>${inline(line.replace(/^###\s+/, ''))}</h3>`);
    } else if (/^##\s+/.test(line)) {
      closeList();
      html.push(`<h2>${inline(line.replace(/^##\s+/, ''))}</h2>`);
    } else if (/^>\s?/.test(line)) {
      closeList();
      html.push(`<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`);
    } else if (/^-\s+/.test(line)) {
      if (!listOpen) {
        html.push('<ul>');
        listOpen = true;
      }
      html.push(`<li>${inline(line.replace(/^-\s+/, ''))}</li>`);
    } else if (line.trim() === '') {
      closeList();
    } else {
      closeList();
      html.push(`<p>${inline(line)}</p>`);
    }
  }
  closeList();
  return html.join('\n');
}
