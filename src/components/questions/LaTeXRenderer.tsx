
import React from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';

interface LaTeXRendererProps {
  content: string;
  inline?: boolean;
  className?: string;
}

export function LaTeXRenderer({ content, inline = false, className = "" }: LaTeXRendererProps) {
  // Check if content contains LaTeX
  const hasLaTeX = /\$.*?\$|\\\(.*?\\\)|\\\[.*?\\\]/.test(content);
  
  if (!hasLaTeX) {
    return <span className={className}>{content}</span>;
  }

  // Parse and render LaTeX expressions
  const parts = content.split(/(\$.*?\$|\\\(.*?\\\)|\\\[.*?\\\])/);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          return <InlineMath key={index} math={math} />;
        } else if (part.startsWith('\\(') && part.endsWith('\\)')) {
          const math = part.slice(2, -2);
          return <InlineMath key={index} math={math} />;
        } else if (part.startsWith('\\[') && part.endsWith('\\]')) {
          const math = part.slice(2, -2);
          return <BlockMath key={index} math={math} />;
        }
        return part;
      })}
    </span>
  );
}
