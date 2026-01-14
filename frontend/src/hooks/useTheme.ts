import { useState, useEffect } from 'react';

const THEME_KEY = 'theme';

type Theme = 'light' | 'dark';

const THEMES: Record<Theme, Theme> = {
  light: 'light',
  dark: 'dark'
};

export interface UseThemeReturn {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  isDark: boolean;
  THEMES: typeof THEMES;
}

export function useTheme(): UseThemeReturn {
  const [theme, setTheme] = useState<Theme>(() => {
    // localStorage から読み込み、なければシステム設定を確認
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && (stored === 'light' || stored === 'dark')) {
      return stored;
    }
    // システムのダークモード設定を確認
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return THEMES.dark;
    }
    return THEMES.light;
  });

  useEffect(() => {
    // テーマをdocumentに適用
    document.documentElement.setAttribute('data-theme', theme);
    // localStorageに保存
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  // システム設定の変更を監視
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      // localStorageに明示的な設定がない場合のみシステム設定に追従
      if (!localStorage.getItem(THEME_KEY)) {
        setTheme(e.matches ? THEMES.dark : THEMES.light);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === THEMES.light ? THEMES.dark : THEMES.light);
  };

  const isDark = theme === THEMES.dark;

  return { theme, setTheme, toggleTheme, isDark, THEMES };
}
