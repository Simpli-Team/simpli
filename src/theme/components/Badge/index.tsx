export type BadgeVariant = 'default' | 'new' | 'beta' | 'deprecated' | 'experimental';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-[var(--simpli-bg-secondary)] text-[var(--simpli-text-secondary)]',
  new: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  beta: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  deprecated: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  experimental: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5 rounded text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
