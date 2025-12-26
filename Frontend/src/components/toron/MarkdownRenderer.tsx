/**
 * MarkdownRenderer Component
 * World-class markdown rendering with streaming support
 *
 * Features:
 * - Full GFM (GitHub Flavored Markdown) support
 * - Code blocks with syntax highlighting
 * - Tables, lists, blockquotes
 * - Links open in new tabs
 * - Streaming cursor animation
 * - Dark mode support
 */

import { memo, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Components } from 'react-markdown';
import { cn } from '../../utils/theme';
import CodeBlock from './CodeBlock';

// ============================================================================
// TYPES
// ============================================================================

interface MarkdownRendererProps {
  content: string;
  isStreaming?: boolean;
  className?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  isStreaming = false,
  className,
}: MarkdownRendererProps) {
  // Memoize components to prevent re-renders
  const components: Components = useMemo(
    () => ({
      // Code blocks and inline code
      code({ node, className: codeClassName, children, ...props }) {
        const match = /language-(\w+)/.exec(codeClassName || '');
        const language = match ? match[1] : '';
        const codeString = String(children).replace(/\n$/, '');

        // Check if it's a code block (has language) or inline code
        // Also check if it's multiline
        const isCodeBlock = language || codeString.includes('\n');

        if (isCodeBlock) {
          return (
            <CodeBlock
              code={codeString}
              language={language || 'text'}
            />
          );
        }

        // Inline code
        return (
          <code
            className={cn(
              'rounded-md px-1.5 py-0.5 text-sm font-mono',
              'bg-gray-100 text-gray-800',
              'dark:bg-slate-800 dark:text-slate-200'
            )}
            {...props}
          >
            {children}
          </code>
        );
      },

      // Pre element - just render children (CodeBlock handles its own wrapper)
      pre({ children }) {
        return <>{children}</>;
      },

      // Links
      a({ node, children, href, ...props }) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'font-medium underline decoration-1 underline-offset-2',
              'text-blue-600 hover:text-blue-700',
              'dark:text-blue-400 dark:hover:text-blue-300',
              'transition-colors'
            )}
            {...props}
          >
            {children}
          </a>
        );
      },

      // Tables
      table({ node, children, ...props }) {
        return (
          <div className="my-4 overflow-x-auto rounded-lg border border-gray-200 dark:border-slate-700">
            <table
              className="min-w-full divide-y divide-gray-200 dark:divide-slate-700"
              {...props}
            >
              {children}
            </table>
          </div>
        );
      },

      thead({ node, children, ...props }) {
        return (
          <thead
            className="bg-gray-50 dark:bg-slate-800"
            {...props}
          >
            {children}
          </thead>
        );
      },

      th({ node, children, ...props }) {
        return (
          <th
            className={cn(
              'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider',
              'text-gray-600 dark:text-slate-300'
            )}
            {...props}
          >
            {children}
          </th>
        );
      },

      td({ node, children, ...props }) {
        return (
          <td
            className={cn(
              'px-4 py-3 text-sm',
              'text-gray-700 dark:text-slate-300',
              'border-t border-gray-200 dark:border-slate-700'
            )}
            {...props}
          >
            {children}
          </td>
        );
      },

      // Unordered lists
      ul({ node, children, ...props }) {
        return (
          <ul
            className={cn(
              'my-4 ml-6 list-disc space-y-2',
              '[&_ul]:my-2 [&_ul]:ml-4'
            )}
            {...props}
          >
            {children}
          </ul>
        );
      },

      // Ordered lists
      ol({ node, children, ...props }) {
        return (
          <ol
            className={cn(
              'my-4 ml-6 list-decimal space-y-2',
              '[&_ol]:my-2 [&_ol]:ml-4'
            )}
            {...props}
          >
            {children}
          </ol>
        );
      },

      // List items
      li({ node, children, ...props }) {
        return (
          <li
            className="leading-relaxed"
            {...props}
          >
            {children}
          </li>
        );
      },

      // Blockquotes
      blockquote({ node, children, ...props }) {
        return (
          <blockquote
            className={cn(
              'my-4 border-l-4 pl-4 italic',
              'border-blue-500 text-gray-700',
              'dark:border-blue-400 dark:text-slate-300'
            )}
            {...props}
          >
            {children}
          </blockquote>
        );
      },

      // Headings
      h1({ node, children, ...props }) {
        return (
          <h1
            className={cn(
              'mt-8 mb-4 text-2xl font-bold',
              'text-gray-900 dark:text-white',
              'first:mt-0'
            )}
            {...props}
          >
            {children}
          </h1>
        );
      },

      h2({ node, children, ...props }) {
        return (
          <h2
            className={cn(
              'mt-6 mb-3 text-xl font-bold',
              'text-gray-900 dark:text-white',
              'first:mt-0'
            )}
            {...props}
          >
            {children}
          </h2>
        );
      },

      h3({ node, children, ...props }) {
        return (
          <h3
            className={cn(
              'mt-5 mb-2 text-lg font-semibold',
              'text-gray-900 dark:text-white',
              'first:mt-0'
            )}
            {...props}
          >
            {children}
          </h3>
        );
      },

      h4({ node, children, ...props }) {
        return (
          <h4
            className={cn(
              'mt-4 mb-2 text-base font-semibold',
              'text-gray-900 dark:text-white',
              'first:mt-0'
            )}
            {...props}
          >
            {children}
          </h4>
        );
      },

      // Paragraphs
      p({ node, children, ...props }) {
        return (
          <p
            className="my-3 leading-relaxed first:mt-0 last:mb-0"
            {...props}
          >
            {children}
          </p>
        );
      },

      // Strong/bold
      strong({ node, children, ...props }) {
        return (
          <strong className="font-semibold" {...props}>
            {children}
          </strong>
        );
      },

      // Emphasis/italic
      em({ node, children, ...props }) {
        return (
          <em className="italic" {...props}>
            {children}
          </em>
        );
      },

      // Strikethrough
      del({ node, children, ...props }) {
        return (
          <del className="line-through opacity-70" {...props}>
            {children}
          </del>
        );
      },

      // Horizontal rule
      hr({ node, ...props }) {
        return (
          <hr
            className="my-6 border-gray-200 dark:border-slate-700"
            {...props}
          />
        );
      },

      // Images
      img({ node, src, alt, ...props }) {
        return (
          <img
            src={src}
            alt={alt || ''}
            className={cn(
              'my-4 max-w-full rounded-lg',
              'border border-gray-200 dark:border-slate-700'
            )}
            loading="lazy"
            {...props}
          />
        );
      },
    }),
    []
  );

  return (
    <div
      className={cn(
        'markdown-content',
        'text-gray-800 dark:text-slate-200',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>

      {/* Streaming Cursor */}
      {isStreaming && (
        <span
          className={cn(
            'ml-0.5 inline-block h-5 w-[3px] animate-pulse',
            'bg-blue-500 dark:bg-blue-400',
            'rounded-full'
          )}
          aria-label="Generating response..."
        />
      )}
    </div>
  );
});

export default MarkdownRenderer;
