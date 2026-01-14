import { useState, useEffect } from 'react';

const defaultOptions = {
  count: 5,        // 問題数
  shuffle: false,  // 選択肢シャッフル
  timer: null      // 制限時間（秒）、nullは無制限
};

export function useQuizOptions() {
  const [options, setOptions] = useState(() => {
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

  function updateOption(key, value) {
    setOptions(prev => ({ ...prev, [key]: value }));
  }

  function resetOptions() {
    setOptions(defaultOptions);
    localStorage.removeItem('quizOptions');
  }

  return { options, setOptions, updateOption, resetOptions };
}