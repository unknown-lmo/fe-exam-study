import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Progress from './Progress';
import * as api from '../api';

// Mock the API
vi.mock('../api', () => ({
  fetchProgress: vi.fn(),
  resetProgress: vi.fn()
}));

// Mock window.confirm for happy-dom
const originalConfirm = window.confirm;
beforeEach(() => {
  window.confirm = vi.fn();
});
afterEach(() => {
  window.confirm = originalConfirm;
});

const mockProgressData = {
  overallCorrectRate: 75,
  totalCorrect: 15,
  totalAttempts: 20,
  weakQuestionsCount: 3,
  categoryStats: {
    technology: { totalAttempts: 10, correctCount: 8, lastStudiedAt: '2024-01-15T10:00:00Z' },
    management: { totalAttempts: 10, correctCount: 7 },
    strategy: { totalAttempts: 5, correctCount: 3 }
  }
};

describe('Progress', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading message initially', () => {
      vi.mocked(api.fetchProgress).mockImplementation(() => new Promise(() => {}));

      render(<Progress onBack={mockOnBack} />);

      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });
  });

  describe('error state', () => {
    it('should show error message when fetch fails', async () => {
      vi.mocked(api.fetchProgress).mockRejectedValueOnce(new Error('Network error'));

      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('進捗データの取得に失敗しました')).toBeInTheDocument();
      });
    });
  });

  describe('success state', () => {
    beforeEach(() => {
      vi.mocked(api.fetchProgress).mockResolvedValue(mockProgressData as never);
    });

    it('should display overall correct rate', async () => {
      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('75%')).toBeInTheDocument();
      });
    });

    it('should display total correct and attempts', async () => {
      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('15 / 20 問正解')).toBeInTheDocument();
      });
    });

    it('should display weak questions count', async () => {
      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('3')).toBeInTheDocument();
      });
    });

    it('should display category names', async () => {
      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('テクノロジ系')).toBeInTheDocument();
        expect(screen.getByText('マネジメント系')).toBeInTheDocument();
        expect(screen.getByText('ストラテジ系')).toBeInTheDocument();
      });
    });

    it('should display category rates', async () => {
      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        // technology: 8/10 = 80%
        expect(screen.getByText('80%')).toBeInTheDocument();
        // management: 7/10 = 70%
        expect(screen.getByText('70%')).toBeInTheDocument();
        // strategy: 3/5 = 60%
        expect(screen.getByText('60%')).toBeInTheDocument();
      });
    });

    it('should display last studied date when available', async () => {
      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText(/最終学習:/)).toBeInTheDocument();
      });
    });
  });

  describe('back button', () => {
    it('should call onBack when back button clicked', async () => {
      vi.mocked(api.fetchProgress).mockResolvedValue(mockProgressData as never);

      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('戻る')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('戻る'));

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });

  describe('reset progress', () => {
    beforeEach(() => {
      vi.mocked(api.fetchProgress).mockResolvedValue(mockProgressData as never);
      vi.mocked(api.resetProgress).mockResolvedValue({ success: true } as never);
    });

    it('should show confirm dialog when reset button clicked', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('進捗をリセット')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('進捗をリセット'));

      expect(confirmSpy).toHaveBeenCalledWith('本当に進捗をリセットしますか？この操作は取り消せません。');
    });

    it('should call resetProgress when confirmed', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('進捗をリセット')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('進捗をリセット'));

      expect(api.resetProgress).toHaveBeenCalledTimes(1);
    });

    it('should not call resetProgress when cancelled', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);

      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('進捗をリセット')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('進捗をリセット'));

      expect(api.resetProgress).not.toHaveBeenCalled();
    });

    it('should reload progress after reset', async () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(<Progress onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('進捗をリセット')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('進捗をリセット'));

      await waitFor(() => {
        // fetchProgress called once on mount, once after reset
        expect(api.fetchProgress).toHaveBeenCalledTimes(2);
      });
    });
  });
});
