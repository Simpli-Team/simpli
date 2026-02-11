import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export interface CodeBlockProps {
  children: string;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const language = className?.replace('language-', '') || 'text';
  const code = typeof children === 'string' ? children.trim() : '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative group my-6 overflow-hidden"
      style={{
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        background: '#0d1117',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.35)' }}>
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-md transition-all hover:bg-white/10"
          style={{ color: copied ? '#34d399' : 'rgba(255,255,255,0.4)' }}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Code */}
      <pre className="p-4 overflow-x-auto">
        <code
          className="text-sm leading-relaxed"
          style={{
            fontFamily: 'var(--font-mono)',
            color: '#e6edf3',
          }}
        >
          {code}
        </code>
      </pre>
    </div>
  );
}
