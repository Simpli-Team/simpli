import { Info, Lightbulb, AlertTriangle, AlertOctagon, CheckCircle, AlertCircle } from 'lucide-react';

export type AdmonitionType = 'note' | 'tip' | 'info' | 'warning' | 'danger' | 'caution' | 'success' | 'important';

export interface AdmonitionProps {
  type?: AdmonitionType;
  title?: string;
  children: React.ReactNode;
}

const typeConfig: Record<AdmonitionType, {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  colorVar: string;
  bgVar: string;
  borderVar: string;
  defaultTitle: string;
}> = {
  note: {
    icon: Info,
    colorVar: 'var(--info)',
    bgVar: 'var(--info-soft)',
    borderVar: 'var(--info-border)',
    defaultTitle: 'Note',
  },
  info: {
    icon: Info,
    colorVar: 'var(--info)',
    bgVar: 'var(--info-soft)',
    borderVar: 'var(--info-border)',
    defaultTitle: 'Info',
  },
  tip: {
    icon: Lightbulb,
    colorVar: 'var(--tip)',
    bgVar: 'var(--tip-soft)',
    borderVar: 'var(--tip-border)',
    defaultTitle: 'Tip',
  },
  warning: {
    icon: AlertTriangle,
    colorVar: 'var(--warning)',
    bgVar: 'var(--warning-soft)',
    borderVar: 'var(--warning-border)',
    defaultTitle: 'Warning',
  },
  caution: {
    icon: AlertTriangle,
    colorVar: 'var(--caution)',
    bgVar: 'var(--caution-soft)',
    borderVar: 'var(--caution-border)',
    defaultTitle: 'Caution',
  },
  danger: {
    icon: AlertOctagon,
    colorVar: 'var(--danger)',
    bgVar: 'var(--danger-soft)',
    borderVar: 'var(--danger-border)',
    defaultTitle: 'Danger',
  },
  success: {
    icon: CheckCircle,
    colorVar: 'var(--success)',
    bgVar: 'var(--success-soft)',
    borderVar: 'var(--success-border)',
    defaultTitle: 'Success',
  },
  important: {
    icon: AlertCircle,
    colorVar: 'var(--accent)',
    bgVar: 'var(--accent-soft)',
    borderVar: 'var(--accent-muted)',
    defaultTitle: 'Important',
  },
};

export function Admonition({
  type = 'note',
  title,
  children,
}: AdmonitionProps) {
  const config = typeConfig[type];
  const Icon = config.icon;
  const displayTitle = title ?? config.defaultTitle;

  return (
    <div
      className="my-6 p-4"
      style={{
        borderRadius: 'var(--radius-lg)',
        background: config.bgVar,
        borderLeft: `3px solid ${config.colorVar}`,
        border: `1px solid ${config.borderVar}`,
        borderLeftWidth: '3px',
        borderLeftColor: config.colorVar,
      }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5" style={{ color: config.colorVar }} />
        <span className="font-semibold text-sm" style={{ color: config.colorVar }}>
          {displayTitle}
        </span>
      </div>
      <div className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        {children}
      </div>
    </div>
  );
}
