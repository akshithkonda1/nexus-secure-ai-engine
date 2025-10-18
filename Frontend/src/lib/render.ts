import DOMPurify from "dompurify";
import { marked } from "marked";
import type { Tokens } from "marked";
import hljs from "highlight.js";

const renderer = new marked.Renderer();

renderer.code = ({ text, lang }: Tokens.Code) => {
  const language = (lang || "").trim();
  let highlighted = text;

  try {
    highlighted = language
      ? hljs.highlight(text, { language }).value
      : hljs.highlightAuto(text).value;
  } catch {
    highlighted = text;
  }

  const langClass = language ? `language-${language}` : "";
  return `<pre><code class="${langClass}">${highlighted}</code></pre>`;
};

marked.setOptions({ renderer });

export function renderMarkdown(md: string): string {
  const html = marked.parse(md || "");
  return DOMPurify.sanitize(html as string);
}
