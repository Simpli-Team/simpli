import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export interface CopyButtonProps {
  text: string;
  className?: string;
}

export function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className={`
        p-1.5 rounded-md transition-all duration-200
        ${copied 
          ? 'text-green-500 bg-green-500/10' 
          : 'text-[var(--simpli-text-tertiary)] hover:text-[var(--simpli-text)] hover:bg-[var(--simpli-bg-secondary)]'}
        ${className}
      `}
      aria-label={copied ? 'Copied!' : 'Copy to clipboard'}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      {copied ? (
        <Check className="w-4 h-4" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  );
}
