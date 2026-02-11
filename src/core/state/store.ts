// ============================================================================
// Simpli Framework - Zustand State Store
// ============================================================================
// Central state management using Zustand 5.
// Benefits over React Context:
//   - No re-render cascade (components only update when their slice changes)
//   - Simpler API (no Provider wrapper needed)
//   - Built-in persistence middleware
//   - DevTools integration
//   - Framework-agnostic (works outside React)
//
// State is organized into slices for separation of concerns.
// Each slice uses prefixed property names to avoid collisions.
// ============================================================================

import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

// ---------------------------------------------------------------------------
// State Types
// ---------------------------------------------------------------------------

export type ColorMode = 'light' | 'dark';
export type ColorModePreference = 'light' | 'dark' | 'system';

export interface TOCHeading {
    id: string;
    text: string;
    level: number;
}

export interface SimpliStore {
    // ---- Theme ----
    colorMode: ColorMode;
    preference: ColorModePreference;
    setColorMode: (mode: ColorModePreference) => void;
    toggleColorMode: () => void;

    // ---- Sidebar ----
    sidebarOpen: boolean;
    sidebarCollapsed: boolean;
    sidebarWidth: number;
    activeDocId: string | null;
    expandedCategories: Set<string>;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    setSidebarCollapsed: (collapsed: boolean) => void;
    setSidebarWidth: (width: number) => void;
    setActiveDocId: (id: string | null) => void;
    toggleCategory: (categoryId: string) => void;
    expandCategory: (categoryId: string) => void;
    collapseCategory: (categoryId: string) => void;

    // ---- Search ----
    searchOpen: boolean;
    searchQuery: string;
    recentSearches: string[];
    openSearch: () => void;
    closeSearch: () => void;
    toggleSearch: () => void;
    setSearchQuery: (query: string) => void;
    addRecentSearch: (query: string) => void;
    clearRecentSearches: () => void;

    // ---- TOC ----
    activeHeadingId: string | null;
    headings: TOCHeading[];
    setActiveHeadingId: (id: string | null) => void;
    setHeadings: (headings: TOCHeading[]) => void;

    // ---- UI ----
    announcementDismissed: boolean;
    mobileMenuOpen: boolean;
    dismissAnnouncement: () => void;
    setMobileMenuOpen: (open: boolean) => void;
}

// ---------------------------------------------------------------------------
// System color mode detection
// ---------------------------------------------------------------------------

function getSystemColorMode(): ColorMode {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

function resolveColorMode(preference: ColorModePreference): ColorMode {
    if (preference === 'system') return getSystemColorMode();
    return preference;
}

// ---------------------------------------------------------------------------
// Store creation
// ---------------------------------------------------------------------------

export const useStore = create<SimpliStore>()(
    devtools(
        persist(
            (set, get) => ({
                // ---- Theme ----
                colorMode: resolveColorMode('system'),
                preference: 'system' as ColorModePreference,

                setColorMode: (mode) => {
                    set({
                        preference: mode,
                        colorMode: resolveColorMode(mode),
                    });
                    applyColorMode(resolveColorMode(mode));
                },

                toggleColorMode: () => {
                    const { preference } = get();
                    const next: ColorModePreference =
                        preference === 'light'
                            ? 'dark'
                            : preference === 'dark'
                                ? 'system'
                                : 'light';
                    get().setColorMode(next);
                },

                // ---- Sidebar ----
                sidebarOpen: true,
                sidebarCollapsed: false,
                sidebarWidth: 280,
                activeDocId: null,
                expandedCategories: new Set<string>(),

                toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
                setSidebarOpen: (open) => set({ sidebarOpen: open }),
                setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
                setSidebarWidth: (width) =>
                    set({ sidebarWidth: Math.max(200, Math.min(500, width)) }),
                setActiveDocId: (id) => set({ activeDocId: id }),

                toggleCategory: (categoryId) =>
                    set((state) => {
                        const next = new Set(state.expandedCategories);
                        if (next.has(categoryId)) {
                            next.delete(categoryId);
                        } else {
                            next.add(categoryId);
                        }
                        return { expandedCategories: next };
                    }),

                expandCategory: (categoryId) =>
                    set((state) => {
                        const next = new Set(state.expandedCategories);
                        next.add(categoryId);
                        return { expandedCategories: next };
                    }),

                collapseCategory: (categoryId) =>
                    set((state) => {
                        const next = new Set(state.expandedCategories);
                        next.delete(categoryId);
                        return { expandedCategories: next };
                    }),

                // ---- Search ----
                searchOpen: false,
                searchQuery: '',
                recentSearches: [],

                openSearch: () => set({ searchOpen: true }),
                closeSearch: () => set({ searchOpen: false, searchQuery: '' }),
                toggleSearch: () =>
                    set((s) => ({
                        searchOpen: !s.searchOpen,
                        searchQuery: s.searchOpen ? '' : s.searchQuery,
                    })),

                setSearchQuery: (query) => set({ searchQuery: query }),

                addRecentSearch: (query) =>
                    set((state) => {
                        const filtered = state.recentSearches.filter((q) => q !== query);
                        return {
                            recentSearches: [query, ...filtered].slice(0, 10),
                        };
                    }),

                clearRecentSearches: () => set({ recentSearches: [] }),

                // ---- TOC ----
                activeHeadingId: null,
                headings: [],

                setActiveHeadingId: (id) => set({ activeHeadingId: id }),
                setHeadings: (headings) => set({ headings }),

                // ---- UI ----
                announcementDismissed: false,
                mobileMenuOpen: false,

                dismissAnnouncement: () => set({ announcementDismissed: true }),
                setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
            }),
            {
                name: 'simpli-store',
                partialize: (state) => ({
                    preference: state.preference,
                    sidebarWidth: state.sidebarWidth,
                    recentSearches: state.recentSearches,
                    announcementDismissed: state.announcementDismissed,
                }),
            },
        ),
        { name: 'SimpliStore' },
    ),
);

// ---------------------------------------------------------------------------
// Side effects
// ---------------------------------------------------------------------------

function applyColorMode(mode: ColorMode): void {
    if (typeof document === 'undefined') return;

    if (mode === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-theme', mode);
}

// ---------------------------------------------------------------------------
// Selectors (memoized via Zustand's shallow comparison)
// ---------------------------------------------------------------------------

export const useTheme = () =>
    useStore((s) => ({
        colorMode: s.colorMode,
        preference: s.preference,
        setColorMode: s.setColorMode,
        toggleColorMode: s.toggleColorMode,
    }));

export const useSidebar = () =>
    useStore((s) => ({
        isOpen: s.sidebarOpen,
        collapsed: s.sidebarCollapsed,
        width: s.sidebarWidth,
        activeDocId: s.activeDocId,
        expandedCategories: s.expandedCategories,
        toggleSidebar: s.toggleSidebar,
        setSidebarOpen: s.setSidebarOpen,
        setCollapsed: s.setSidebarCollapsed,
        setWidth: s.setSidebarWidth,
        setActiveDocId: s.setActiveDocId,
        toggleCategory: s.toggleCategory,
        expandCategory: s.expandCategory,
        collapseCategory: s.collapseCategory,
    }));

export const useSearch = () =>
    useStore((s) => ({
        isOpen: s.searchOpen,
        query: s.searchQuery,
        recentSearches: s.recentSearches,
        openSearch: s.openSearch,
        closeSearch: s.closeSearch,
        toggleSearch: s.toggleSearch,
        setQuery: s.setSearchQuery,
        addRecentSearch: s.addRecentSearch,
        clearRecentSearches: s.clearRecentSearches,
    }));

export const useToc = () =>
    useStore((s) => ({
        activeHeadingId: s.activeHeadingId,
        headings: s.headings,
        setActiveHeadingId: s.setActiveHeadingId,
        setHeadings: s.setHeadings,
    }));

// ---------------------------------------------------------------------------
// Initialize: Listen for system color scheme changes
// ---------------------------------------------------------------------------

if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
        const { preference } = useStore.getState();
        if (preference === 'system') {
            const newMode = getSystemColorMode();
            useStore.setState({ colorMode: newMode });
            applyColorMode(newMode);
        }
    });

    // Apply initial color mode
    const { colorMode } = useStore.getState();
    applyColorMode(colorMode);
}
