"use client";

import React, { useMemo, memo } from "react";
import { marked } from "marked";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function MarkdownRendererComponent({ content, className = "" }: MarkdownRendererProps) {
  const htmlContent = useMemo(() => {
    // Configure marked options
    marked.setOptions({
      breaks: true, // Convert \n to <br>
      gfm: true, // Enable GitHub Flavored Markdown
    });

    // Parse markdown to HTML
    let rawHtml = marked.parse(content) as string;

    // Wrap tables in a scrollable container
    rawHtml = rawHtml.replace(/<table/g, '<div class="table-wrapper"><table').replace(/<\/table>/g, '</table></div>');

    // Sanitize HTML to prevent XSS attacks
    // DOMPurify is only available in the browser, so we need to handle SSR
    if (typeof window !== "undefined") {
      // Dynamic import for DOMPurify to avoid SSR issues
      const DOMPurify = require("dompurify");
      return DOMPurify.sanitize(rawHtml);
    }

    // Return raw HTML during SSR (it's safe since it's server-rendered)
    return rawHtml;
  }, [content]);

  return (
    <div
      className={`markdown-content prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-headings:scroll-m-20 ${className}`}
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

export const MarkdownRenderer = memo(MarkdownRendererComponent);
