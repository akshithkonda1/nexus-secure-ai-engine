import DOMPurify from "dompurify";
import { marked } from "marked";
import hljs from "highlight.js";

marked.setOptions({ breaks: true });

marked.use({
  renderer: {
    code(code: string, infostring: string | undefined) {
      const lang = (infostring || "").trim().split(/\s+/)[0];
      let highlighted = code;
      if (lang) {
        try {
          highlighted = hljs.highlight(code, { language: lang }).value;
        } catch {
          try { highlighted = hljs.highlightAuto(code).value; }
          catch { highlighted = code; }
        }
      } else {
        try { highlighted = hljs.highlightAuto(code).value; }
        catch { highlighted = code; }
      }
      const languageClass = lang ? ` class="language-${lang}"` : "";
      return `<pre><code${languageClass}>${highlighted}</code></pre>`;
    }
  }
});

export function mdToHtml(md: string) {
  const raw = marked.parse(md || "");
  return DOMPurify.sanitize(String(raw));
}
