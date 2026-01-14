import { useState, useEffect } from 'react';
import type { QuizOptions } from '../types';
import { STORAGE_KEYS, DEFAULT_QUIZ_OPTIONS } from '../constants';

const defaultOptions: QuizOptions = { ...DEFAULT_QUIZ_OPTIONS };

export interface UseQuizOptionsReturn {
  options: QuizOptions;
  setOptions: React.Dispatch<React.SetStateAction<QuizOptions>>;
  updateOption: <K extends keyof QuizOptions>(key: K, value: QuizOptions[K]) => void;
  resetOptions: () => void;
}

export function useQuizOptions(): UseQuizOptionsReturn {
  const [options, setOptions] = useState<QuizOptions>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_OPTIONS);
      return stored ? { ...defaultOptions, ...JSON.parse(stored) } : defaultOptions;
    } catch {
      return defaultOptions;
    }
  });

  // 変更時にlocalStorageに保存
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.QUIZ_OPTIONS, JSON.stringify(options));
  }, [options]);

  function updateOption<K extends keyof QuizOptions>(key: K, value: QuizOptions[K]) {
    setOptions(prev => ({ ...prev, [key]: value }));
  }

  function resetOptions() {
    setOptions(defaultOptions);
    localStorage.removeItem(STORAGE_KEYS.QUIZ_OPTIONS);
  }

  return { options, setOptions, updateOption, resetOptions };
}
