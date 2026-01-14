import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import History from './History';
import * as api from '../api';

// Mock the API
vi.mock('../api', () => ({
  fetchHistory: vi.fn()
}));

const mockHistoryWithQuestions = [
  {
    questionId: 'q1',
    isCorrect: true,
    answeredAt: '2024-01-15T10:30:00Z',
    question: {
      categoryName: 'テクノロジ系',
      subcategory: 'ハードウェア',
      questionText: 'CPUの役割は何ですか？'
    }
  },
  {
    questionId: 'q2',
    isCorrect: false,
    answeredAt: '2024-01-15T10:25:00Z',
    question: {
      categoryName: 'マネジメント系',
      subcategory: 'プロジェクト管理',
      questionText: 'WBSとは何ですか？'
    }
  }
];

const mockHistoryWithoutQuestions = [
  {
    questionId: 'q3',
    isCorrect: true,
    answeredAt: '2024-01-15T10:20:00Z'
  }
];

describe('History', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading message initially', () => {
      vi.mocked(api.fetchHistory).mockImplementation(() => new Promise(() => {}));

      render(<History onBack={mockOnBack} />);

      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no history', async () => {
      vi.mocked(api.fetchHistory).mockResolvedValue([]);

      render(<History onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('まだ学習履歴がありません')).toBeInTheDocument();
      });
    });
  });

  describe('success state', () => {
    beforeEach(() => {
      vi.mocked(api.fetchHistory).mockResolvedValue(mockHistoryWithQuestions);
    });

    it('should display history items', async () => {
      render(<History onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPUの役割は何ですか？')).toBeInTheDocument();
        expect(screen.getByText('WBSとは何ですか？')).toBeInTheDocument();
      });
    });

    it('should display correct/incorrect icons', async () => {
      render(<History onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('○')).toBeInTheDocument();
        expect(screen.getByText('×')).toBeInTheDocument();
      });
    });

    it('should display category info', async () => {
      render(<History onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('テクノロジ系 / ハードウェア')).toBeInTheDocument();
        expect(screen.getByText('マネジメント系 / プロジェクト管理')).toBeInTheDocument();
      });
    });

    it('should display formatted date', async () => {
      render(<History onBack={mockOnBack} />);

      await waitFor(() => {
        // Date formatting depends on locale, just check some date appears
        const historyItems = screen.getAllByText(/2024/);
        expect(historyItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe('fallback for missing question info', () => {
    it('should show question ID when question info is missing', async () => {
      vi.mocked(api.fetchHistory).mockResolvedValue(mockHistoryWithoutQuestions);

      render(<History onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('問題ID: q3')).toBeInTheDocument();
      });
    });
  });

  describe('API call', () => {
    it('should fetch history with limit 50', async () => {
      vi.mocked(api.fetchHistory).mockResolvedValue([]);

      render(<History onBack={mockOnBack} />);

      await waitFor(() => {
        expect(api.fetchHistory).toHaveBeenCalledWith(50);
      });
    });
  });

  describe('back button', () => {
    beforeEach(() => {
      vi.mocked(api.fetchHistory).mockResolvedValue(mockHistoryWithQuestions);
    });

    it('should call onBack when clicked', async () => {
      render(<History onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('戻る')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('戻る'));

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });
});
