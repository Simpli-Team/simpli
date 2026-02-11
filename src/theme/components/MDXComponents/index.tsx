import { CodeBlock } from '../CodeBlock';
import { Admonition } from '../Admonition';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../Tabs';
import { Details } from '../Details';
import { Card } from '../Card';

// MDX component mapping
// eslint-disable-next-line react-refresh/only-export-components
export const MDXComponents = {
  // Typography
  h1: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 text-[var(--simpli-text)]" {...props} />
  ),
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-2xl font-semibold mt-8 mb-4 pb-2 border-b border-[var(--simpli-border)] text-[var(--simpli-text)]" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-xl font-semibold mt-6 mb-3 text-[var(--simpli-text)]" {...props} />
  ),
  h4: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="text-lg font-semibold mt-4 mb-2 text-[var(--simpli-text)]" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="my-4 leading-7 text-[var(--simpli-text)]" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    const isExternal = props.href?.startsWith('http');
    return (
      <a 
        className="text-[var(--simpli-primary-600)] hover:text-[var(--simpli-primary-700)] underline underline-offset-2 transition-colors"
        {...props}
        {...(isExternal && { target: '_blank', rel: 'noopener noreferrer' })}
      />
    );
  },
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="my-4 ml-6 list-disc text-[var(--simpli-text)]" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="my-4 ml-6 list-decimal text-[var(--simpli-text)]" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="mt-1 mb-1" {...props} />
  ),
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-[var(--simpli-text)]" {...props} />
  ),
  em: (props: React.HTMLAttributes<HTMLElement>) => (
    <em className="italic" {...props} />
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    <code 
      className="px-1.5 py-0.5 text-sm font-mono bg-[var(--simpli-bg-tertiary)] rounded text-[var(--simpli-primary-600)]"
      {...props} 
    />
  ),
  pre: (props: { children?: React.ReactNode } & Record<string, unknown>) => {
    // Extract code from pre > code structure
    const childEl = props.children as React.ReactElement<{ children?: string; className?: string }> | undefined;
    const code = childEl?.props?.children ?? '';
    const className = childEl?.props?.className ?? '';
    
    return (
      <CodeBlock className={className}>{code}</CodeBlock>
    );
  },
  blockquote: (props: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote 
      className="my-4 pl-4 border-l-4 border-[var(--simpli-primary-500)] text-[var(--simpli-text-secondary)] italic"
      {...props} 
    />
  ),
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    <thead className="bg-[var(--simpli-bg-secondary)]" {...props} />
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th className="px-4 py-3 text-left font-semibold border border-[var(--simpli-border)]" {...props} />
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td className="px-4 py-3 border border-[var(--simpli-border)]" {...props} />
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className="even:bg-[var(--simpli-bg-secondary)]/50" {...props} />
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-8 border-[var(--simpli-border)]" {...props} />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img className="max-w-full h-auto rounded-lg my-4" {...props} />
  ),
  
  // Custom components
  Admonition,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Details,
  Card,
};

// Re-export for convenience
export { CodeBlock, Admonition, Tabs, TabsList, TabsTrigger, TabsContent, Details, Card };
