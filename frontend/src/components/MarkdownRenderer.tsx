import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        skipHtml={true}
        components={{
          // Custom styling for code blocks
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <pre className="code-block">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="inline-code" {...props}>
                {children}
              </code>
            );
          },
          // Custom styling for blockquotes
          blockquote({ children, ...props }) {
            return (
              <blockquote className="markdown-blockquote" {...props}>
                {children}
              </blockquote>
            );
          },
          // Custom styling for tables
          table({ children, ...props }) {
            return (
              <div className="markdown-table-wrapper">
                <table className="markdown-table" {...props}>
                  {children}
                </table>
              </div>
            );
          },
          // Custom styling for links with security
          a({ children, href, ...props }) {
            // Sanitize href to prevent javascript: and data: URLs
            const sanitizedHref = href && (
              href.startsWith('http://') || 
              href.startsWith('https://') || 
              href.startsWith('mailto:') || 
              href.startsWith('tel:')
            ) ? href : '#';
            
            return (
              <a 
                href={sanitizedHref} 
                target="_blank" 
                rel="noopener noreferrer nofollow"
                className="markdown-link"
                {...props}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
