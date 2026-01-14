import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import QuestionList from './QuestionList';
import * as api from '../api';

// Mock the API
vi.mock('../api', () => ({
  fetchQuestionsList: vi.fn(),
  fetchCategories: vi.fn()
}));

const mockCategories = [
  { id: 'technology', name: 'テクノロジ系', subcategories: [] },
  { id: 'management', name: 'マネジメント系', subcategories: [] },
  { id: 'strategy', name: 'ストラテジ系', subcategories: [] }
];

const mockQuestions = [
  {
    id: 'q1',
    question: 'CPUの役割は何ですか？',
    subcategory: 'ハードウェア',
    difficulty: 'easy' as const,
    status: 'correct' as const
  },
  {
    id: 'q2',
    question: 'データベースの正規化について説明してください。',
    subcategory: 'データベース',
    difficulty: 'medium' as const,
    status: 'incorrect' as const
  },
  {
    id: 'q3',
    question: 'ネットワークセキュリティの基本原則は？',
    subcategory: 'セキュリティ',
    difficulty: 'hard' as const,
    status: 'unanswered' as const
  }
];

describe('QuestionList', () => {
  const mockOnSelectQuestion = vi.fn();
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.fetchCategories).mockResolvedValue(mockCategories);
  });

  describe('loading state', () => {
    it('should show loading message initially', () => {
      vi.mocked(api.fetchQuestionsList).mockImplementation(() => new Promise(() => {}));

      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });
  });

  describe('success state', () => {
    beforeEach(() => {
      vi.mocked(api.fetchQuestionsList).mockResolvedValue(mockQuestions);
    });

    it('should display questions list', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPUの役割は何ですか？')).toBeInTheDocument();
        expect(screen.getByText('データベースの正規化について説明してください。')).toBeInTheDocument();
        expect(screen.getByText('ネットワークセキュリティの基本原則は？')).toBeInTheDocument();
      });
    });

    it('should display question IDs', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('q1')).toBeInTheDocument();
        expect(screen.getByText('q2')).toBeInTheDocument();
        expect(screen.getByText('q3')).toBeInTheDocument();
      });
    });

    it('should display subcategories', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('ハードウェア')).toBeInTheDocument();
        expect(screen.getByText('データベース')).toBeInTheDocument();
        expect(screen.getByText('セキュリティ')).toBeInTheDocument();
      });
    });

    it('should display difficulty badges', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        // Each difficulty appears twice: once in filter buttons, once in question badges
        const easyElements = screen.getAllByText('易');
        const mediumElements = screen.getAllByText('中');
        const hardElements = screen.getAllByText('難');

        // Filter button + question badge = 2 each
        expect(easyElements.length).toBeGreaterThanOrEqual(2);
        expect(mediumElements.length).toBeGreaterThanOrEqual(2);
        expect(hardElements.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('should display status icons', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('○')).toBeInTheDocument();
        expect(screen.getByText('×')).toBeInTheDocument();
        expect(screen.getByText('●')).toBeInTheDocument();
      });
    });
  });

  describe('statistics', () => {
    beforeEach(() => {
      vi.mocked(api.fetchQuestionsList).mockResolvedValue(mockQuestions);
    });

    it('should display total count', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('全3問')).toBeInTheDocument();
      });
    });

    it('should display correct/incorrect/unanswered counts', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('○1')).toBeInTheDocument();
        expect(screen.getByText('×1')).toBeInTheDocument();
        expect(screen.getByText('●1')).toBeInTheDocument();
      });
    });
  });

  describe('category filter', () => {
    beforeEach(() => {
      vi.mocked(api.fetchQuestionsList).mockResolvedValue(mockQuestions);
    });

    it('should display category filter buttons', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('テクノロジ系')).toBeInTheDocument();
        expect(screen.getByText('マネジメント系')).toBeInTheDocument();
        expect(screen.getByText('ストラテジ系')).toBeInTheDocument();
      });
    });

    it('should filter by category when clicked', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('テクノロジ系')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('テクノロジ系'));

      await waitFor(() => {
        expect(api.fetchQuestionsList).toHaveBeenCalledWith('technology', null, null);
      });
    });

    it('should toggle category filter off when clicked again', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('テクノロジ系')).toBeInTheDocument();
      });

      // Click to enable filter
      fireEvent.click(screen.getByText('テクノロジ系'));

      await waitFor(() => {
        expect(api.fetchQuestionsList).toHaveBeenCalledWith('technology', null, null);
      });

      // Click again to disable filter
      fireEvent.click(screen.getByText('テクノロジ系'));

      await waitFor(() => {
        expect(api.fetchQuestionsList).toHaveBeenLastCalledWith(null, null, null);
      });
    });
  });

  describe('difficulty filter', () => {
    beforeEach(() => {
      vi.mocked(api.fetchQuestionsList).mockResolvedValue(mockQuestions);
    });

    it('should display difficulty filter buttons', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        // Find within filter-buttons context
        const difficultyLabel = screen.getByText('難易度:');
        expect(difficultyLabel).toBeInTheDocument();
      });
    });

    it('should filter by difficulty when clicked', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('問題一覧')).toBeInTheDocument();
      });

      // Find the difficulty filter button for "hard"
      const hardButtons = screen.getAllByText('難');
      // The first one should be in the filter section
      fireEvent.click(hardButtons[0]);

      await waitFor(() => {
        expect(api.fetchQuestionsList).toHaveBeenCalledWith(null, 'hard', null);
      });
    });
  });

  describe('search filter', () => {
    beforeEach(() => {
      vi.mocked(api.fetchQuestionsList).mockResolvedValue(mockQuestions);
    });

    it('should display search input', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('キーワードで検索...')).toBeInTheDocument();
      });
    });

    it('should filter questions by search text', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPUの役割は何ですか？')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('キーワードで検索...');
      fireEvent.change(searchInput, { target: { value: 'CPU' } });

      expect(screen.getByText('CPUの役割は何ですか？')).toBeInTheDocument();
      expect(screen.queryByText('データベースの正規化について説明してください。')).not.toBeInTheDocument();
    });

    it('should search by subcategory', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPUの役割は何ですか？')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('キーワードで検索...');
      fireEvent.change(searchInput, { target: { value: 'セキュリティ' } });

      expect(screen.queryByText('CPUの役割は何ですか？')).not.toBeInTheDocument();
      expect(screen.getByText('ネットワークセキュリティの基本原則は？')).toBeInTheDocument();
    });

    it('should show empty message when no results', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPUの役割は何ですか？')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('キーワードで検索...');
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      expect(screen.getByText('該当する問題がありません')).toBeInTheDocument();
    });
  });

  describe('question selection', () => {
    beforeEach(() => {
      vi.mocked(api.fetchQuestionsList).mockResolvedValue(mockQuestions);
    });

    it('should call onSelectQuestion when question is clicked', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPUの役割は何ですか？')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('CPUの役割は何ですか？'));

      expect(mockOnSelectQuestion).toHaveBeenCalledWith('q1');
    });
  });

  describe('back button', () => {
    beforeEach(() => {
      vi.mocked(api.fetchQuestionsList).mockResolvedValue(mockQuestions);
    });

    it('should call onBack when clicked', async () => {
      render(<QuestionList onSelectQuestion={mockOnSelectQuestion} onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('メニューに戻る')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('メニューに戻る'));

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });
  });
});
