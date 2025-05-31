
import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface KaTeXProps {
  children: string;
  block?: boolean;
}

export function KaTeX({ children, block = false }: KaTeXProps) {
  const htmlContent = React.useMemo(() => {
    try {
      return processText(children);
    } catch (error) {
      console.error("KaTeX error:", error);
      return children;
    }
  }, [children]);

  return (
    <span dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}

// Process text and render LaTeX expressions inside it
function processText(text: string): string {
  // Simple regex to find LaTeX expressions between $ signs
  const pattern = /\$(.*?)\$/g;
  
  return text.replace(pattern, (match, formula) => {
    try {
      return katex.renderToString(formula, {
        throwOnError: false,
        displayMode: false
      });
    } catch (error) {
      console.error("KaTeX rendering error:", error);
      return match; // Return the original text if there's an error
    }
  });
}
