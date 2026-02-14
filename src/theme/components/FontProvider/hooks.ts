import { useState } from 'react';

// Predefined font configurations
export const PREDEFINED_FONTS: Record<string, { name: string; url: string; family: string }> = {
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

// Hook for font management
export function useFont() {
    const [currentFont, setCurrentFont] = useState<string>(() => {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('simpli-font');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.family) return parsed.family;
                } catch {
                    // Ignore parse errors
                }
            }
        }
        return 'noto-sans-thai';
    });

    const setFont = (family: string) => {
        setCurrentFont(family);
        // Apply font immediately using CSS custom property
        const fontConfig = PREDEFINED_FONTS[family];
        if (fontConfig && typeof document !== 'undefined') {
            document.documentElement.style.setProperty('--font-sans', fontConfig.family);
            // Save preference to localStorage
            localStorage.setItem('simpli-font', JSON.stringify({
                family,
                url: fontConfig.url,
                fontFamily: fontConfig.family,
            }));
        }
    };

    return {
        currentFont,
        setFont,
        fonts: PREDEFINED_FONTS,
    };
}
