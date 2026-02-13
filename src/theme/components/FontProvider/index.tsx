import { useEffect, useState } from 'react';

// Predefined font configurations
const PREDEFINED_FONTS: Record<string, { name: string; url: string; family: string }> = {
  'noto-sans-thai': {
    name: 'Noto Sans Thai',
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&family=Noto+Sans+Thai:wght@100..900&display=swap',
    family: '"Noto Sans Thai", "Noto Sans", sans-serif',
  },
  'inter': {
    name: 'Inter',
    url: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=JetBrains+Mono:wght@100..800&display=swap',
    family: '"Inter", ui-sans-serif, system-ui, sans-serif',
  },
  'prompt': {
    name: 'Prompt',
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&family=Prompt:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
    family: '"Prompt", "Noto Sans Thai", sans-serif',
  },
  'sarabun': {
    name: 'Sarabun',
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&family=Sarabun:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap',
    family: '"Sarabun", "Noto Sans Thai", sans-serif',
  },
  'kanit': {
    name: 'Kanit',
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&family=Kanit:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap',
    family: '"Kanit", "Noto Sans Thai", sans-serif',
  },
};

export interface FontConfig {
  family?: string;
  googleFontUrl?: string;
  customFontFamily?: string;
  weights?: number[];
  thaiOptimized?: boolean;
}

interface FontProviderProps {
  config?: FontConfig;
}

export function FontProvider({ config }: FontProviderProps) {
  useEffect(() => {
    if (!config) return;

    let fontUrl: string | null = null;
    let fontFamily: string | null = null;

    // Check if it's a predefined font
    if (config.family && PREDEFINED_FONTS[config.family]) {
      const predefined = PREDEFINED_FONTS[config.family];
      fontUrl = predefined.url;
      fontFamily = predefined.family;
    } 
    // Check if custom Google Font URL is provided
    else if (config.googleFontUrl) {
      fontUrl = config.googleFontUrl;
      fontFamily = config.customFontFamily || 'Custom Font';
    }

    if (fontUrl && fontFamily) {
      // Save to localStorage for persistence
      localStorage.setItem('simpli-font', JSON.stringify({
        family: config.family,
        url: fontUrl,
        fontFamily,
      }));

      // Check if font link already exists
      const existingLink = document.getElementById('simpli-font-link');
      if (existingLink) {
        existingLink.remove();
      }

      // Create new link element
      const link = document.createElement('link');
      link.id = 'simpli-font-link';
      link.rel = 'stylesheet';
      link.href = fontUrl;
      link.onload = () => {
        // Apply font family to root
        document.documentElement.style.setProperty('--font-sans', fontFamily);
      };

      document.head.appendChild(link);
    }
  }, [config]);

  return null;
}

// Hook for font management
export function useFont() {
  const [currentFont, setCurrentFont] = useState<string>('noto-sans-thai');

  useEffect(() => {
    // Load saved font preference
    const saved = localStorage.getItem('simpli-font');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.family) {
          setCurrentFont(parsed.family);
        }
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  const setFont = (family: string) => {
    setCurrentFont(family);
    // FontProvider will handle the actual loading
    window.location.reload(); // Reload to apply new font
  };

  const getAvailableFonts = () => Object.keys(PREDEFINED_FONTS);

  const getFontInfo = (family: string) => PREDEFINED_FONTS[family];

  return {
    currentFont,
    setFont,
    getAvailableFonts,
    getFontInfo,
    fonts: PREDEFINED_FONTS,
  };
}

// Font selector component
export function FontSelector() {
  const { currentFont, setFont, fonts } = useFont();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg btn-soft"
      >
        <span>Font: {fonts[currentFont]?.name || 'Custom'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-48 py-2 rounded-lg shadow-lg z-50"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
        >
          {Object.entries(fonts).map(([key, font]) => (
            <button
              key={key}
              onClick={() => {
                setFont(key);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm hoverable ${
                currentFont === key ? 'bg-accent-soft text-accent' : ''
              }`}
            >
              {font.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
