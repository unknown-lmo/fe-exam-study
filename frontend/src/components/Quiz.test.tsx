import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Quiz from './Quiz';
import * as api from '../api';

// Mock the API
vi.mock('../api', () => ({
  fetchRandomQuestions: vi.fn(),
  fetchWeakQuestions: vi.fn(),
  fetchQuestionById: vi.fn(),
  submitAnswer: vi.fn()
}));

const mockQuestions = [
  {
    id: 'q1',
    category: 'technology',
    categoryName: 'テクノロジ系',
    subcategory: 'ハードウェア',
    question: 'CPUの役割は何ですか？',
    choices: ['演算処理', 'データ保存', 'ネットワーク通信', '画面表示'] as [string, string, string, string],
    correctAnswer: 0,
    difficulty: 'easy' as const
  },
  {
    id: 'q2',
    category: 'technology',
    categoryName: 'テクノロジ系',
    subcategory: 'データベース',
    question: 'SQLの正式名称は？',
    choices: ['Simple Query Language', 'Structured Query Language', 'Standard Query Language', 'System Query Language'] as [string, string, string, string],
    correctAnswer: 1,
    difficulty: 'medium' as const
  }
];

const mockQuestionWithImage = {
  id: 'q3',
  category: 'technology',
  categoryName: 'テクノロジ系',
  subcategory: '基礎理論',
  question: '次の2分探索木に関する問題です。',
  choices: ['選択肢ア', '選択肢イ', '選択肢ウ', '選択肢エ'] as [string, string, string, string],
  correctAnswer: 0,
  difficulty: 'medium' as const,
  image: '/images/questions/r07_003.png'
};

const mockAnswerCorrect = {
  isCorrect: true,
  correctAnswer: 0,
  explanation: '正解です。CPUは演算処理を行います。',
  relatedTerms: []
};

const mockAnswerIncorrect = {
  isCorrect: false,
  correctAnswer: 0,
  explanation: '不正解です。CPUは演算処理を行います。',
  relatedTerms: []
};

describe('Quiz', () => {
  const mockOnComplete = vi.fn();
  const mockGetRandomDialog = vi.fn((type: string) => {
    switch (type) {
      case 'questionIntro': return '問題だ';
      case 'correct': return '正解だ！';
      case 'incorrect': return '不正解だ！';
      case 'quizComplete': return '終わりだ！';
      default: return '';
    }
  });
  const mockTransformExplanation = vi.fn((text: string) => text);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading message initially', () => {
      vi.mocked(api.fetchRandomQuestions).mockImplementation(() => new Promise(() => {}));

      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      expect(screen.getByText('問題を読み込み中...')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty message when no questions', async () => {
      vi.mocked(api.fetchRandomQuestions).mockResolvedValue([]);

      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('問題がありません')).toBeInTheDocument();
      });
    });

    it('should show specific message for weak mode with no questions', async () => {
      vi.mocked(api.fetchWeakQuestions).mockResolvedValue([]);

      render(
        <Quiz
          mode="weak"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('苦手問題がありません')).toBeInTheDocument();
      });
    });
  });

  describe('question display', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRandomQuestions).mockResolvedValue(mockQuestions);
    });

    it('should display question text', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('CPUの役割は何ですか？')).toBeInTheDocument();
      });
    });

    it('should display choices', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('演算処理')).toBeInTheDocument();
        expect(screen.getByText('データ保存')).toBeInTheDocument();
        expect(screen.getByText('ネットワーク通信')).toBeInTheDocument();
        expect(screen.getByText('画面表示')).toBeInTheDocument();
      });
    });

    it('should display progress', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('問題 1 / 2')).toBeInTheDocument();
      });
    });

    it('should display category info', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('テクノロジ系')).toBeInTheDocument();
        expect(screen.getByText('ハードウェア')).toBeInTheDocument();
      });
    });

    it('should display difficulty badge', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('易')).toBeInTheDocument();
      });
    });

    it('should not display image when question has no image field', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('CPUの役割は何ですか？')).toBeInTheDocument();
      });

      // 画像要素が存在しないことを確認
      expect(screen.queryByRole('img', { name: '問題の図' })).not.toBeInTheDocument();
    });

    it('should display image when question has image field', async () => {
      vi.mocked(api.fetchRandomQuestions).mockResolvedValue([mockQuestionWithImage]);

      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('次の2分探索木に関する問題です。')).toBeInTheDocument();
      });

      // 画像要素が存在することを確認
      const image = screen.getByRole('img', { name: '問題の図' });
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', '/images/questions/r07_003.png');
    });
  });

  describe('answer selection', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRandomQuestions).mockResolvedValue(mockQuestions);
    });

    it('should select answer when clicked', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('演算処理')).toBeInTheDocument();
      });

      const choiceButton = screen.getByText('演算処理').closest('button');
      fireEvent.click(choiceButton!);

      expect(choiceButton).toHaveClass('selected');
    });

    it('should enable submit button when answer selected', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('回答する')).toBeInTheDocument();
      });

      const submitButton = screen.getByText('回答する');
      expect(submitButton).toBeDisabled();

      fireEvent.click(screen.getByText('演算処理').closest('button')!);

      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('answer submission', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRandomQuestions).mockResolvedValue(mockQuestions);
    });

    it('should show correct feedback for correct answer', async () => {
      vi.mocked(api.submitAnswer).mockResolvedValue(mockAnswerCorrect);

      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('演算処理')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('演算処理').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('正解!')).toBeInTheDocument();
      });
    });

    it('should show incorrect feedback for wrong answer', async () => {
      vi.mocked(api.submitAnswer).mockResolvedValue(mockAnswerIncorrect);

      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('データ保存')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('データ保存').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('不正解')).toBeInTheDocument();
      });
    });

    it('should display explanation after submission', async () => {
      vi.mocked(api.submitAnswer).mockResolvedValue(mockAnswerCorrect);

      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('演算処理')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('演算処理').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('正解です。CPUは演算処理を行います。')).toBeInTheDocument();
      });
    });
  });

  describe('navigation', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRandomQuestions).mockResolvedValue(mockQuestions);
      vi.mocked(api.submitAnswer).mockResolvedValue(mockAnswerCorrect);
    });

    it('should show next question button after answering', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('演算処理')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('演算処理').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('次の問題')).toBeInTheDocument();
      });
    });

    it('should navigate to next question', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('問題 1 / 2')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('演算処理').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('次の問題')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('次の問題'));

      await waitFor(() => {
        expect(screen.getByText('問題 2 / 2')).toBeInTheDocument();
        expect(screen.getByText('SQLの正式名称は？')).toBeInTheDocument();
      });
    });

    it('should show "結果を見る" button on last question', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('演算処理')).toBeInTheDocument();
      });

      // Answer first question
      fireEvent.click(screen.getByText('演算処理').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('次の問題')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('次の問題'));

      // Answer second question
      await waitFor(() => {
        expect(screen.getByText('Structured Query Language')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Structured Query Language').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('結果を見る')).toBeInTheDocument();
      });
    });
  });

  describe('score tracking', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRandomQuestions).mockResolvedValue(mockQuestions);
    });

    it('should update score after correct answer', async () => {
      vi.mocked(api.submitAnswer).mockResolvedValue(mockAnswerCorrect);

      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('現在のスコア: 0 / 0')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('演算処理').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('現在のスコア: 1 / 1')).toBeInTheDocument();
      });
    });

    it('should update score after incorrect answer', async () => {
      vi.mocked(api.submitAnswer).mockResolvedValue(mockAnswerIncorrect);

      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('現在のスコア: 0 / 0')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('データ保存').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('現在のスコア: 0 / 1')).toBeInTheDocument();
      });
    });
  });

  describe('finished state', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRandomQuestions).mockResolvedValue([mockQuestions[0]]);
      vi.mocked(api.submitAnswer).mockResolvedValue(mockAnswerCorrect);
    });

    it('should show results after completing quiz', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('演算処理')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('演算処理').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('結果を見る')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('結果を見る'));

      await waitFor(() => {
        expect(screen.getByText('結果発表')).toBeInTheDocument();
        expect(screen.getByText('100%')).toBeInTheDocument();
      });
    });

    it('should show restart button in results', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('演算処理')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('演算処理').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('結果を見る')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('結果を見る'));

      await waitFor(() => {
        expect(screen.getByText('もう一度')).toBeInTheDocument();
        expect(screen.getByText('メニューに戻る')).toBeInTheDocument();
      });
    });

    it('should call onComplete when menu button clicked', async () => {
      render(
        <Quiz
          mode="random"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('演算処理')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('演算処理').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('結果を見る')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('結果を見る'));

      await waitFor(() => {
        expect(screen.getByText('メニューに戻る')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('メニューに戻る'));

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe('single mode', () => {
    beforeEach(() => {
      vi.mocked(api.fetchQuestionById).mockResolvedValue(mockQuestions[0]);
      vi.mocked(api.submitAnswer).mockResolvedValue(mockAnswerCorrect);
    });

    it('should fetch single question by ID', async () => {
      render(
        <Quiz
          mode="single"
          questionId="q1"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(api.fetchQuestionById).toHaveBeenCalledWith('q1');
      });
    });

    it('should show back to list button in single mode', async () => {
      const mockOnBackToList = vi.fn();

      render(
        <Quiz
          mode="single"
          questionId="q1"
          onComplete={mockOnComplete}
          onBackToList={mockOnBackToList}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('演算処理')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('演算処理').closest('button')!);
      fireEvent.click(screen.getByText('回答する'));

      await waitFor(() => {
        expect(screen.getByText('一覧に戻る')).toBeInTheDocument();
      });
    });
  });

  describe('weak mode', () => {
    beforeEach(() => {
      vi.mocked(api.fetchWeakQuestions).mockResolvedValue(mockQuestions);
    });

    it('should fetch weak questions', async () => {
      render(
        <Quiz
          mode="weak"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(api.fetchWeakQuestions).toHaveBeenCalled();
      });
    });
  });

  describe('category filter', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRandomQuestions).mockResolvedValue(mockQuestions);
    });

    it('should fetch questions by category', async () => {
      render(
        <Quiz
          mode="random"
          category="technology"
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(api.fetchRandomQuestions).toHaveBeenCalledWith('technology', 5);
      });
    });
  });

  describe('options', () => {
    beforeEach(() => {
      vi.mocked(api.fetchRandomQuestions).mockResolvedValue(mockQuestions);
    });

    it('should use custom count', async () => {
      render(
        <Quiz
          mode="random"
          options={{ count: 10, shuffle: false, timer: null }}
          onComplete={mockOnComplete}
          getRandomDialog={mockGetRandomDialog}
          transformExplanation={mockTransformExplanation}
        />
      );

      await waitFor(() => {
        expect(api.fetchRandomQuestions).toHaveBeenCalledWith(null, 10);
      });
    });
  });
});
