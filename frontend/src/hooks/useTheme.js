import { useState, useEffect } from 'react';

const THEME_KEY = 'theme';
const THEMES = {
  light: 'light',
  dark: 'dark'
};

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // localStorage から読み込み、なければシステム設定を確認
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && Object.values(THEMES).includes(stored)) {
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
    const handleChange = (e) => {
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
