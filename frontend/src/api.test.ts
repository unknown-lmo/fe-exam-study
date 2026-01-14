import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchCategories,
  fetchQuestions,
  fetchRandomQuestions,
  fetchWeakQuestions,
  submitAnswer,
  fetchProgress,
  fetchHistory,
  resetProgress,
  fetchGlossary,
  fetchGlossaryTerm,
  fetchQuestionsList,
  fetchQuestionById
} from './api';

const API_BASE = 'http://localhost:3001/api';

describe('API', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  function mockFetch(data: unknown) {
    (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      json: () => Promise.resolve(data)
    } as Response);
  }

  describe('fetchCategories', () => {
    it('should fetch categories from correct endpoint', async () => {
      const mockData = [{ id: 'technology', name: 'テクノロジ系', subcategories: [] }];
      mockFetch(mockData);

      const result = await fetchCategories();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/categories`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchQuestions', () => {
    it('should fetch all questions when no category', async () => {
      const mockData = [{ id: 'q1', question: 'Test' }];
      mockFetch(mockData);

      await fetchQuestions();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/questions`);
    });

    it('should fetch questions by category', async () => {
      const mockData = [{ id: 'q1', question: 'Test' }];
      mockFetch(mockData);

      await fetchQuestions('technology');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/questions?category=technology`);
    });
  });

  describe('fetchRandomQuestions', () => {
    it('should fetch random questions with default count', async () => {
      const mockData = [{ id: 'q1' }];
      mockFetch(mockData);

      await fetchRandomQuestions();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/questions/random?count=5`);
    });

    it('should fetch random questions with custom count', async () => {
      const mockData = [{ id: 'q1' }];
      mockFetch(mockData);

      await fetchRandomQuestions(null, 10);

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/questions/random?count=10`);
    });

    it('should fetch random questions by category', async () => {
      const mockData = [{ id: 'q1' }];
      mockFetch(mockData);

      await fetchRandomQuestions('technology', 5);

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/questions/random?count=5&category=technology`);
    });
  });

  describe('fetchWeakQuestions', () => {
    it('should fetch weak questions', async () => {
      const mockData = [{ id: 'q1' }];
      mockFetch(mockData);

      await fetchWeakQuestions();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/questions/weak`);
    });
  });

  describe('submitAnswer', () => {
    it('should submit answer with POST', async () => {
      const mockData = { isCorrect: true, correctAnswer: 0, explanation: 'Test' };
      mockFetch(mockData);

      const result = await submitAnswer('q1', 0);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/answer`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ questionId: 'q1', selectedAnswer: 0 })
        }
      );
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchProgress', () => {
    it('should fetch progress', async () => {
      const mockData = { totalAttempts: 10, correctAttempts: 8 };
      mockFetch(mockData);

      await fetchProgress();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/progress`);
    });
  });

  describe('fetchHistory', () => {
    it('should fetch history with default limit', async () => {
      const mockData = [{ questionId: 'q1', isCorrect: true }];
      mockFetch(mockData);

      await fetchHistory();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/history?limit=20`);
    });

    it('should fetch history with custom limit', async () => {
      const mockData = [{ questionId: 'q1', isCorrect: true }];
      mockFetch(mockData);

      await fetchHistory(50);

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/history?limit=50`);
    });
  });

  describe('resetProgress', () => {
    it('should reset progress with POST', async () => {
      const mockData = { success: true };
      mockFetch(mockData);

      const result = await resetProgress();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/progress/reset`, { method: 'POST' });
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchGlossary', () => {
    it('should fetch all glossary terms when no params', async () => {
      const mockData = [{ id: 'term1', term: 'Test' }];
      mockFetch(mockData);

      await fetchGlossary();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/glossary`);
    });

    it('should fetch glossary with category filter', async () => {
      const mockData = [{ id: 'term1', term: 'Test' }];
      mockFetch(mockData);

      await fetchGlossary('technology');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/glossary?category=technology`);
    });

    it('should fetch glossary with search filter', async () => {
      const mockData = [{ id: 'term1', term: 'Test' }];
      mockFetch(mockData);

      await fetchGlossary(null, 'CPU');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/glossary?search=CPU`);
    });

    it('should fetch glossary with both filters', async () => {
      const mockData = [{ id: 'term1', term: 'Test' }];
      mockFetch(mockData);

      await fetchGlossary('technology', 'CPU');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/glossary?category=technology&search=CPU`);
    });
  });

  describe('fetchGlossaryTerm', () => {
    it('should fetch single glossary term', async () => {
      const mockData = { id: 'term1', term: 'Test', meaning: 'Test meaning' };
      mockFetch(mockData);

      const result = await fetchGlossaryTerm('term1');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/glossary/term1`);
      expect(result).toEqual(mockData);
    });
  });

  describe('fetchQuestionsList', () => {
    it('should fetch questions list without params', async () => {
      const mockData = [{ id: 'q1' }];
      mockFetch(mockData);

      await fetchQuestionsList();

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/questions/list`);
    });

    it('should fetch questions list with category', async () => {
      const mockData = [{ id: 'q1' }];
      mockFetch(mockData);

      await fetchQuestionsList('technology');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/questions/list?category=technology`);
    });

    it('should fetch questions list with difficulty', async () => {
      const mockData = [{ id: 'q1' }];
      mockFetch(mockData);

      await fetchQuestionsList(null, 'hard');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/questions/list?difficulty=hard`);
    });

    it('should fetch questions list with search', async () => {
      const mockData = [{ id: 'q1' }];
      mockFetch(mockData);

      await fetchQuestionsList(null, null, 'test');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/questions/list?search=test`);
    });

    it('should fetch questions list with all params', async () => {
      const mockData = [{ id: 'q1' }];
      mockFetch(mockData);

      await fetchQuestionsList('technology', 'medium', 'CPU');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE}/questions/list?category=technology&difficulty=medium&search=CPU`
      );
    });
  });

  describe('fetchQuestionById', () => {
    it('should fetch question by id', async () => {
      const mockData = { id: 'q1', question: 'Test', choices: [] };
      mockFetch(mockData);

      const result = await fetchQuestionById('q1');

      expect(global.fetch).toHaveBeenCalledWith(`${API_BASE}/questions/q1`);
      expect(result).toEqual(mockData);
    });
  });
});
