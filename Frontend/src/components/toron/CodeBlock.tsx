/**
 * CodeBlock Component
 * Professional code syntax highlighting with copy functionality
 *
 * Features:
 * - Syntax highlighting for 100+ languages
 * - One-click copy
 * - Dark/light mode support
 * - Line numbers
 * - Language indicator
 */

import { memo, useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import {
  vscDarkPlus,
  vs,
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check, Terminal } from 'lucide-react';
import { cn } from '../../utils/theme';

// ============================================================================
// TYPES
// ============================================================================

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  className?: string;
}

// ============================================================================
// LANGUAGE MAPPING
// ============================================================================

// Map common language aliases to Prism language names
const LANGUAGE_MAP: Record<string, string> = {
  js: 'javascript',
  ts: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  py: 'python',
  rb: 'ruby',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash',
  yml: 'yaml',
  md: 'markdown',
  rs: 'rust',
  go: 'go',
  java: 'java',
  cpp: 'cpp',
  'c++': 'cpp',
  c: 'c',
  cs: 'csharp',
  'c#': 'csharp',
  php: 'php',
  sql: 'sql',
  html: 'html',
  css: 'css',
  scss: 'scss',
  sass: 'sass',
  less: 'less',
  json: 'json',
  xml: 'xml',
  graphql: 'graphql',
  gql: 'graphql',
  docker: 'docker',
  dockerfile: 'docker',
  makefile: 'makefile',
  make: 'makefile',
  swift: 'swift',
  kotlin: 'kotlin',
  scala: 'scala',
  r: 'r',
  matlab: 'matlab',
  perl: 'perl',
  lua: 'lua',
  vim: 'vim',
  diff: 'diff',
  nginx: 'nginx',
  apache: 'apacheconf',
  toml: 'toml',
  ini: 'ini',
  env: 'bash',
  prisma: 'prisma',
};

// Language display names
const LANGUAGE_DISPLAY: Record<string, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  python: 'Python',
  ruby: 'Ruby',
  bash: 'Bash',
  yaml: 'YAML',
  markdown: 'Markdown',
  rust: 'Rust',
  go: 'Go',
  java: 'Java',
  cpp: 'C++',
  c: 'C',
  csharp: 'C#',
  php: 'PHP',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  json: 'JSON',
  xml: 'XML',
  graphql: 'GraphQL',
  docker: 'Dockerfile',
  makefile: 'Makefile',
  swift: 'Swift',
  kotlin: 'Kotlin',
  scala: 'Scala',
  prisma: 'Prisma',
};

// ============================================================================
// COMPONENT
// ============================================================================

const CodeBlock = memo(function CodeBlock({
  code,
  language = 'text',
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Handle copy
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [code]);

  // Normalize language
  const normalizedLang = LANGUAGE_MAP[language.toLowerCase()] || language.toLowerCase();
  const displayLang = LANGUAGE_DISPLAY[normalizedLang] || language.toUpperCase();

  // Detect dark mode
  const isDark = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Custom style overrides
  const customStyle: React.CSSProperties = {
    margin: 0,
    padding: '1rem',
    background: 'transparent',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Monaco, Consolas, monospace',
  };

  return (
    <div
      className={cn(
        'group relative my-4 overflow-hidden rounded-xl',
        'border',
        isDark ? 'border-slate-700 bg-slate-900' : 'border-gray-200 bg-gray-50',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-2',
          'border-b',
          isDark ? 'border-slate-700 bg-slate-800/50' : 'border-gray-200 bg-gray-100/50'
        )}
      >
        {/* Language Badge */}
        <div className="flex items-center gap-2">
          <Terminal
            className={cn(
              'h-4 w-4',
              isDark ? 'text-slate-400' : 'text-gray-500'
            )}
          />
          <span
            className={cn(
              'text-xs font-semibold tracking-wide',
              isDark ? 'text-slate-400' : 'text-gray-600'
            )}
          >
            {displayLang}
          </span>
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium',
            'transition-all duration-150',
            isDark
              ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-300'
              : 'hover:bg-gray-200 text-gray-500 hover:text-gray-700',
            copied && (isDark ? 'bg-green-900/30 text-green-400' : 'bg-green-100 text-green-600')
          )}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={normalizedLang}
          style={isDark ? vscDarkPlus : vs}
          customStyle={customStyle}
          showLineNumbers={showLineNumbers && code.split('\n').length > 1}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: isDark ? '#4a5568' : '#a0aec0',
            fontSize: '0.75rem',
            userSelect: 'none',
          }}
          wrapLines
          wrapLongLines={false}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
});

export default CodeBlock;
