import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Glossary from './Glossary';
import * as api from '../api';

// Mock the API
vi.mock('../api', () => ({
  fetchGlossary: vi.fn()
}));

const mockTerms = [
  {
    id: 'term1',
    term: 'CPU',
    fullName: 'Central Processing Unit',
    meaning: 'コンピュータの中央処理装置',
    category: 'technology' as const,
    subcategory: 'ハードウェア',
    description: 'コンピュータの頭脳にあたる部分です。',
    examples: ['演算処理', 'データ転送'],
    tips: 'Central=中央、Processing=処理、Unit=装置',
    relatedTerms: ['メモリ', 'キャッシュ']
  },
  {
    id: 'term2',
    term: 'RAM',
    fullName: 'Random Access Memory',
    meaning: '主記憶装置',
    category: 'technology' as const,
    subcategory: 'ハードウェア',
    description: '一時的にデータを保存するメモリです。',
    examples: [],
    tips: null,
    relatedTerms: []
  },
  {
    id: 'term3',
    term: 'ERP',
    fullName: 'Enterprise Resource Planning',
    meaning: '企業資源計画',
    category: 'strategy' as const,
    subcategory: '経営戦略',
    description: '企業全体の経営資源を統合管理するシステム',
    examples: ['SAP', 'Oracle'],
    tips: null,
    relatedTerms: ['基幹システム']
  }
];

describe('Glossary', () => {
  const mockOnBack = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading message initially', () => {
      vi.mocked(api.fetchGlossary).mockImplementation(() => new Promise(() => {}));

      render(<Glossary onBack={mockOnBack} />);

      expect(screen.getByText('読み込み中...')).toBeInTheDocument();
    });
  });

  describe('success state', () => {
    beforeEach(() => {
      vi.mocked(api.fetchGlossary).mockResolvedValue(mockTerms);
    });

    it('should display terms', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPU')).toBeInTheDocument();
        expect(screen.getByText('RAM')).toBeInTheDocument();
        expect(screen.getByText('ERP')).toBeInTheDocument();
      });
    });

    it('should display term meanings', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('コンピュータの中央処理装置')).toBeInTheDocument();
        expect(screen.getByText('主記憶装置')).toBeInTheDocument();
      });
    });

    it('should display full names', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('(Central Processing Unit)')).toBeInTheDocument();
        expect(screen.getByText('(Random Access Memory)')).toBeInTheDocument();
      });
    });
  });

  describe('category filter', () => {
    beforeEach(() => {
      vi.mocked(api.fetchGlossary).mockResolvedValue(mockTerms);
    });

    it('should display category filter buttons', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('すべて')).toBeInTheDocument();
        expect(screen.getByText('テクノロジ系')).toBeInTheDocument();
        expect(screen.getByText('マネジメント系')).toBeInTheDocument();
        expect(screen.getByText('ストラテジ系')).toBeInTheDocument();
      });
    });

    it('should filter by category when clicked', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('テクノロジ系')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('テクノロジ系'));

      await waitFor(() => {
        expect(api.fetchGlossary).toHaveBeenCalledWith('technology', null);
      });
    });

    it('should show all terms when "すべて" is clicked', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('テクノロジ系')).toBeInTheDocument();
      });

      // Click category first
      fireEvent.click(screen.getByText('テクノロジ系'));

      await waitFor(() => {
        expect(api.fetchGlossary).toHaveBeenCalledWith('technology', null);
      });

      // Then click "すべて"
      fireEvent.click(screen.getByText('すべて'));

      await waitFor(() => {
        expect(api.fetchGlossary).toHaveBeenCalledWith(null, null);
      });
    });
  });

  describe('search filter', () => {
    beforeEach(() => {
      vi.mocked(api.fetchGlossary).mockResolvedValue(mockTerms);
    });

    it('should display search input', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('用語を検索...')).toBeInTheDocument();
      });
    });

    it('should filter terms by search text', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPU')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('用語を検索...');
      fireEvent.change(searchInput, { target: { value: 'CPU' } });

      expect(screen.getByText('CPU')).toBeInTheDocument();
      expect(screen.queryByText('RAM')).not.toBeInTheDocument();
      expect(screen.queryByText('ERP')).not.toBeInTheDocument();
    });

    it('should search in term meaning', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPU')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('用語を検索...');
      fireEvent.change(searchInput, { target: { value: '主記憶' } });

      expect(screen.queryByText('CPU')).not.toBeInTheDocument();
      expect(screen.getByText('RAM')).toBeInTheDocument();
    });

    it('should show empty message when no results', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPU')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('用語を検索...');
      fireEvent.change(searchInput, { target: { value: 'NONEXISTENT' } });

      expect(screen.getByText('該当する用語がありません')).toBeInTheDocument();
    });

    it('should use initialSearch prop', async () => {
      render(<Glossary onBack={mockOnBack} initialSearch="ERP" />);

      await waitFor(() => {
        expect(screen.getByText('ERP')).toBeInTheDocument();
      });

      expect(screen.queryByText('CPU')).not.toBeInTheDocument();
    });
  });

  describe('term expansion', () => {
    beforeEach(() => {
      vi.mocked(api.fetchGlossary).mockResolvedValue(mockTerms);
    });

    it('should expand term details when clicked', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPU')).toBeInTheDocument();
      });

      // Detail sections should not be visible initially
      expect(screen.queryByText('コンピュータの頭脳にあたる部分です。')).not.toBeInTheDocument();

      // Click to expand
      fireEvent.click(screen.getByText('コンピュータの中央処理装置'));

      // Detail sections should now be visible
      expect(screen.getByText('コンピュータの頭脳にあたる部分です。')).toBeInTheDocument();
      expect(screen.getByText('Central=中央、Processing=処理、Unit=装置')).toBeInTheDocument();
    });

    it('should show examples when available', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPU')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('コンピュータの中央処理装置'));

      expect(screen.getByText('演算処理')).toBeInTheDocument();
      expect(screen.getByText('データ転送')).toBeInTheDocument();
    });

    it('should show related terms when available', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPU')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('コンピュータの中央処理装置'));

      expect(screen.getByText('メモリ')).toBeInTheDocument();
      expect(screen.getByText('キャッシュ')).toBeInTheDocument();
    });

    it('should collapse when clicked again', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('CPU')).toBeInTheDocument();
      });

      // Expand
      fireEvent.click(screen.getByText('コンピュータの中央処理装置'));
      expect(screen.getByText('コンピュータの頭脳にあたる部分です。')).toBeInTheDocument();

      // Collapse
      fireEvent.click(screen.getByText('コンピュータの中央処理装置'));
      expect(screen.queryByText('コンピュータの頭脳にあたる部分です。')).not.toBeInTheDocument();
    });
  });

  describe('back button', () => {
    beforeEach(() => {
      vi.mocked(api.fetchGlossary).mockResolvedValue(mockTerms);
    });

    it('should call onBack when clicked', async () => {
      render(<Glossary onBack={mockOnBack} />);

      await waitFor(() => {
        expect(screen.getByText('戻る')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('戻る'));

      expect(mockOnBack).toHaveBeenCalledTimes(1);
    });

    it('should use custom backLabel', async () => {
      render(<Glossary onBack={mockOnBack} backLabel="クイズに戻る" />);

      await waitFor(() => {
        expect(screen.getByText('クイズに戻る')).toBeInTheDocument();
      });
    });
  });

  describe('transformExplanation', () => {
    beforeEach(() => {
      vi.mocked(api.fetchGlossary).mockResolvedValue(mockTerms);
    });

    it('should apply transformExplanation to descriptions', async () => {
      const mockTransform = vi.fn((text: string) => `[変換済み]${text}`);

      render(<Glossary onBack={mockOnBack} transformExplanation={mockTransform} />);

      await waitFor(() => {
        expect(screen.getByText('CPU')).toBeInTheDocument();
      });

      // Expand a term
      fireEvent.click(screen.getByText('コンピュータの中央処理装置'));

      expect(screen.getByText('[変換済み]コンピュータの頭脳にあたる部分です。')).toBeInTheDocument();
    });
  });
});
