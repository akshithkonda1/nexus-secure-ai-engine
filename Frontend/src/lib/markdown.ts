import { marked } from "marked";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import python from "highlight.js/lib/languages/python";
import xml from "highlight.js/lib/languages/xml";
import yaml from "highlight.js/lib/languages/yaml";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("python", python);
hljs.registerLanguage("xml", xml);
hljs.registerLanguage("yaml", yaml);

const renderer = new marked.Renderer();

function escapeHtml(input: string) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

renderer.code = (code, infoString) => {
  const language = (infoString || "").trim().split(/\s+/)[0];
  let highlighted = code;

  if (language && hljs.getLanguage(language)) {
    highlighted = hljs.highlight(code, { language }).value;
  } else {
    highlighted = hljs.highlightAuto(code).value;
  }

  const langClass = language ? `language-${language}` : "";
  return `\n<pre class="markdown-code-block"><code class="hljs ${langClass}">${highlighted}</code></pre>\n`;
};

renderer.codespan = (code) => {
  return `<code class="markdown-inline-code">${escapeHtml(code)}</code>`;
};

renderer.link = (href, title, text) => {
  const sanitizedHref = href ? escapeHtml(href) : "";
  const linkTitle = title ? ` title="${escapeHtml(title)}"` : "";
  return `<a class="markdown-link" href="${sanitizedHref}"${linkTitle} target="_blank" rel="noopener noreferrer">${text}</a>`;
};

marked.use({
  gfm: true,
  breaks: true,
  renderer,
  highlight(code, language) {
    if (language && hljs.getLanguage(language)) {
      return hljs.highlight(code, { language }).value;
    }
    return hljs.highlightAuto(code).value;
  }
});

export function renderMarkdown(content: string) {
  return marked.parse(content ?? "");
}
