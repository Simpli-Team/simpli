import { useEffect, useState } from 'react';
import { PREDEFINED_FONTS, useFont } from './hooks';
import type { FontConfig } from './types';

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
                            className={`w-full text-left px-4 py-2 text-sm hoverable ${currentFont === key ? 'bg-accent-soft text-accent' : ''
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
