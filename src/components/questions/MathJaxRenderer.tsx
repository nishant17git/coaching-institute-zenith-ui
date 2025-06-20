
import React, { useEffect, useRef } from 'react';

// Declare MathJax on the global window object
declare global {
  interface Window {
    MathJax: any;
  }
}

interface MathJaxRendererProps {
  content: string;
  inline?: boolean;
  className?: string;
}

export function MathJaxRenderer({ content, inline = false, className = "" }: MathJaxRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load MathJax if not already loaded
    if (!window.MathJax) {
      const script = document.createElement('script');
      script.src = 'https://polyfill.io/v3/polyfill.min.js?features=es6';
      script.onload = () => {
        const mathJaxScript = document.createElement('script');
        mathJaxScript.id = 'MathJax-script';
        mathJaxScript.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
        mathJaxScript.onload = () => {
          window.MathJax = {
            tex: {
              inlineMath: [['$', '$'], ['\\(', '\\)']],
              displayMath: [['$$', '$$'], ['\\[', '\\]']],
              processEscapes: true,
              processEnvironments: true,
              packages: ['base', 'newcommand', 'ams', 'mathtools'],
              tags: 'ams'
            },
            options: {
              ignoreHtmlClass: 'tex2jax_ignore',
              processHtmlClass: 'tex2jax_process'
            },
            startup: {
              ready: () => {
                window.MathJax.startup.defaultReady();
                renderMath();
              }
            }
          };
        };
        document.head.appendChild(mathJaxScript);
      };
      document.head.appendChild(script);
    } else {
      renderMath();
    }
  }, [content]);

  const renderMath = () => {
    if (window.MathJax && containerRef.current) {
      // Enhanced LaTeX detection and processing
      let processedContent = content;
      
      // Convert common LaTeX patterns to proper MathJax format
      processedContent = processedContent
        // Handle square roots
        .replace(/\\sqrt\{([^}]+)\}/g, '$\\sqrt{$1}$')
        // Handle fractions
        .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$\\frac{$1}{$2}$')
        // Handle superscripts
        .replace(/\^(\w+)/g, '$^{$1}$')
        .replace(/\^(\d+)/g, '$^{$1}$')
        // Handle subscripts
        .replace(/_(\w+)/g, '$_{$1}$')
        .replace(/_(\d+)/g, '$_{$1}$')
        // Handle common math symbols
        .replace(/\\alpha/g, '$\\alpha$')
        .replace(/\\beta/g, '$\\beta$')
        .replace(/\\gamma/g, '$\\gamma$')
        .replace(/\\delta/g, '$\\delta$')
        .replace(/\\theta/g, '$\\theta$')
        .replace(/\\pi/g, '$\\pi$')
        .replace(/\\sigma/g, '$\\sigma$')
        .replace(/\\omega/g, '$\\omega$')
        // Handle operators
        .replace(/\\times/g, '$\\times$')
        .replace(/\\div/g, '$\\div$')
        .replace(/\\pm/g, '$\\pm$')
        .replace(/\\mp/g, '$\\mp$')
        // Handle functions
        .replace(/\\sin/g, '$\\sin$')
        .replace(/\\cos/g, '$\\cos$')
        .replace(/\\tan/g, '$\\tan$')
        .replace(/\\log/g, '$\\log$')
        .replace(/\\ln/g, '$\\ln$')
        // Handle inequalities
        .replace(/\\leq/g, '$\\leq$')
        .replace(/\\geq/g, '$\\geq$')
        .replace(/\\neq/g, '$\\neq$')
        // Handle sets
        .replace(/\\in/g, '$\\in$')
        .replace(/\\subset/g, '$\\subset$')
        .replace(/\\cup/g, '$\\cup$')
        .replace(/\\cap/g, '$\\cap$')
        // Handle arrows
        .replace(/\\rightarrow/g, '$\\rightarrow$')
        .replace(/\\leftarrow/g, '$\\leftarrow$')
        // Handle limits and integrals
        .replace(/\\lim/g, '$\\lim$')
        .replace(/\\int/g, '$\\int$')
        .replace(/\\sum/g, '$\\sum$')
        .replace(/\\prod/g, '$\\prod$')
        // Clean up multiple consecutive $ signs
        .replace(/\$+/g, '$');

      // Clear the container and set processed content
      containerRef.current.innerHTML = processedContent;
      
      // Process the math with MathJax
      window.MathJax.typesetPromise([containerRef.current]).then(() => {
        // Math rendering complete
      }).catch((err: any) => {
        console.error('MathJax rendering error:', err);
        // Fallback to original content if rendering fails
        if (containerRef.current) {
          containerRef.current.innerHTML = content;
        }
      });
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`tex2jax_process ${className}`}
      style={{ 
        display: inline ? 'inline' : 'block',
        lineHeight: '1.6',
        fontSize: 'inherit'
      }}
    >
      {content}
    </div>
  );
}
