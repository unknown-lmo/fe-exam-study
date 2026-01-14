import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuizOptions } from './useQuizOptions';

describe('useQuizOptions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should use default options when localStorage is empty', () => {
      const { result } = renderHook(() => useQuizOptions());

      expect(result.current.options).toEqual({
        count: 5,
        shuffle: false,
        timer: null
      });
    });

    it('should load options from localStorage', () => {
      localStorage.setItem('quizOptions', JSON.stringify({
        count: 10,
        shuffle: true,
        timer: 30
      }));

      const { result } = renderHook(() => useQuizOptions());

      expect(result.current.options).toEqual({
        count: 10,
        shuffle: true,
        timer: 30
      });
    });

    it('should merge stored options with defaults', () => {
      // Only count is stored
      localStorage.setItem('quizOptions', JSON.stringify({ count: 20 }));

      const { result } = renderHook(() => useQuizOptions());

      expect(result.current.options).toEqual({
        count: 20,
        shuffle: false,
        timer: null
      });
    });

    it('should use defaults when localStorage has invalid JSON', () => {
      localStorage.setItem('quizOptions', 'invalid json');

      const { result } = renderHook(() => useQuizOptions());

      expect(result.current.options).toEqual({
        count: 5,
        shuffle: false,
        timer: null
      });
    });
  });

  describe('updateOption', () => {
    it('should update count option', () => {
      const { result } = renderHook(() => useQuizOptions());

      act(() => {
        result.current.updateOption('count', 10);
      });

      expect(result.current.options.count).toBe(10);
    });

    it('should update shuffle option', () => {
      const { result } = renderHook(() => useQuizOptions());

      act(() => {
        result.current.updateOption('shuffle', true);
      });

      expect(result.current.options.shuffle).toBe(true);
    });

    it('should update timer option', () => {
      const { result } = renderHook(() => useQuizOptions());

      act(() => {
        result.current.updateOption('timer', 60);
      });

      expect(result.current.options.timer).toBe(60);
    });

    it('should persist options to localStorage', () => {
      const { result } = renderHook(() => useQuizOptions());

      act(() => {
        result.current.updateOption('count', 15);
      });

      const stored = JSON.parse(localStorage.getItem('quizOptions') || '{}');
      expect(stored.count).toBe(15);
    });
  });

  describe('setOptions', () => {
    it('should replace all options', () => {
      const { result } = renderHook(() => useQuizOptions());

      act(() => {
        result.current.setOptions({
          count: 20,
          shuffle: true,
          timer: 90
        });
      });

      expect(result.current.options).toEqual({
        count: 20,
        shuffle: true,
        timer: 90
      });
    });

    it('should accept function updater', () => {
      const { result } = renderHook(() => useQuizOptions());

      act(() => {
        result.current.setOptions(prev => ({
          ...prev,
          count: prev.count + 5
        }));
      });

      expect(result.current.options.count).toBe(10);
    });
  });

  describe('resetOptions', () => {
    it('should reset to default options', () => {
      const { result } = renderHook(() => useQuizOptions());

      act(() => {
        result.current.updateOption('count', 20);
        result.current.updateOption('shuffle', true);
        result.current.updateOption('timer', 60);
      });

      expect(result.current.options).toEqual({
        count: 20,
        shuffle: true,
        timer: 60
      });

      act(() => {
        result.current.resetOptions();
      });

      expect(result.current.options).toEqual({
        count: 5,
        shuffle: false,
        timer: null
      });
    });

    it('should reset localStorage to default values', () => {
      const { result } = renderHook(() => useQuizOptions());

      act(() => {
        result.current.updateOption('count', 20);
      });

      const storedBefore = JSON.parse(localStorage.getItem('quizOptions') || '{}');
      expect(storedBefore.count).toBe(20);

      act(() => {
        result.current.resetOptions();
      });

      // After reset, the useEffect saves default options back to localStorage
      const storedAfter = JSON.parse(localStorage.getItem('quizOptions') || '{}');
      expect(storedAfter.count).toBe(5);
      expect(storedAfter.shuffle).toBe(false);
      expect(storedAfter.timer).toBeNull();
    });
  });
});
