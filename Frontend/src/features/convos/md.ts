import DOMPurify from "dompurify";
import { marked } from "marked";
import hljs from "highlight.js";

marked.setOptions({
  highlight(code: string, lang?: string) {
    try {
      return lang
        ? hljs.highlight(code, { language: lang }).value
        : hljs.highlightAuto(code).value;
    } catch {
      return code;
    }
  },
  breaks: true
} as any);

export function mdToHtml(md: string) {
  const raw = marked.parse(md || "");
  return DOMPurify.sanitize(String(raw));
}
