import { useState, useEffect } from 'react';
import type { QuizOptions } from '../types';

const defaultOptions: QuizOptions = {
  count: 5,        // 問題数
  shuffle: false,  // 選択肢シャッフル
  timer: null      // 制限時間（秒）、nullは無制限
};

export interface UseQuizOptionsReturn {
  options: QuizOptions;
  setOptions: React.Dispatch<React.SetStateAction<QuizOptions>>;
  updateOption: <K extends keyof QuizOptions>(key: K, value: QuizOptions[K]) => void;
  resetOptions: () => void;
}

export function useQuizOptions(): UseQuizOptionsReturn {
  const [options, setOptions] = useState<QuizOptions>(() => {
    try {
      const stored = localStorage.getItem('quizOptions');
      return stored ? { ...defaultOptions, ...JSON.parse(stored) } : defaultOptions;
    } catch {
      return defaultOptions;
    }
  });

  // 変更時にlocalStorageに保存
  useEffect(() => {
    localStorage.setItem('quizOptions', JSON.stringify(options));
  }, [options]);

  function updateOption<K extends keyof QuizOptions>(key: K, value: QuizOptions[K]) {
    setOptions(prev => ({ ...prev, [key]: value }));
  }

  function resetOptions() {
    setOptions(defaultOptions);
    localStorage.removeItem('quizOptions');
  }

  return { options, setOptions, updateOption, resetOptions };
}
