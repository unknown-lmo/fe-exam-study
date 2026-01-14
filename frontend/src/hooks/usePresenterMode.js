import { useState, useEffect, useCallback } from 'react';
import { PRESENTERS, DEFAULT_PRESENTER } from '../config/presenters';

const STORAGE_KEY = 'quiz-presenter-mode';

export function usePresenterMode() {
  const [presenterMode, setPresenterMode] = useState(() => {
    // localStorageから初期値を取得
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && PRESENTERS[stored]) {
        return stored;
      }
    }
    return DEFAULT_PRESENTER;
  });

  // presenterModeが変更されたらlocalStorageに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, presenterMode);
  }, [presenterMode]);

  // モードを切り替える関数
  const togglePresenterMode = useCallback(() => {
    setPresenterMode(prev => prev === 'normal' ? 'vegeta' : 'normal');
  }, []);

  // 現在のプレゼンター設定を取得
  const presenter = PRESENTERS[presenterMode];

  return {
    presenterMode,
    setPresenterMode,
    togglePresenterMode,
    presenter,
    isVegetaMode: presenterMode === 'vegeta'
  };
}
