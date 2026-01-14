import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterSettings from './CharacterSettings';
import type { Character } from '../types';

// Mock ImageUploader since it has complex file handling
vi.mock('./ImageUploader', () => ({
  default: ({ onImageChange, onImageRemove, currentImage }: {
    onImageChange: (base64: string) => void;
    onImageRemove: () => void;
    currentImage: string | null;
  }) => (
    <div data-testid="image-uploader">
      {currentImage && <span>画像あり</span>}
      <button onClick={() => onImageChange('test-base64')}>画像追加</button>
      <button onClick={onImageRemove}>画像削除</button>
    </div>
  )
}));

// Mock window.confirm
const originalConfirm = window.confirm;
beforeEach(() => {
  window.confirm = vi.fn();
});
afterEach(() => {
  window.confirm = originalConfirm;
});

const createMockCharacter = (overrides: Partial<Character> = {}): Character => ({
  id: 'normal',
  name: 'ノーマル',
  avatars: {
    default: null,
    correct: null,
    incorrect: null
  },
  speechPattern: 'polite',
  dialogs: {
    questionIntro: ['問題です。'],
    correct: ['正解です!'],
    incorrect: ['不正解です。'],
    timeout: ['時間切れです。'],
    quizStart: ['学習を始めましょう!'],
    quizComplete: {
      excellent: ['素晴らしい!'],
      good: ['頑張りました!'],
      needsWork: ['もう少し頑張りましょう。']
    }
  },
  isPreset: true,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  ...overrides
});

const mockCharacters = [
  createMockCharacter(),
  createMockCharacter({
    id: 'vegeta',
    name: 'ベジータ',
    speechPattern: 'oresama',
    dialogs: {
      questionIntro: ['問題だ!'],
      correct: ['当然だ!'],
      incorrect: ['愚かな!'],
      timeout: ['遅い!'],
      quizStart: ['始めるぞ!'],
      quizComplete: {
        excellent: ['見事だ!'],
        good: ['まあまあだ'],
        needsWork: ['修行が足りん']
      }
    }
  }),
  createMockCharacter({
    id: 'custom_1',
    name: 'カスタムキャラ',
    isPreset: false
  })
];

describe('CharacterSettings', () => {
  const mockOnClose = vi.fn();
  const mockOnSave = vi.fn();
  const mockOnAddCharacter = vi.fn(() => 'custom_new');
  const mockOnDeleteCharacter = vi.fn();
  const mockOnResetToDefault = vi.fn();
  const mockValidateName = vi.fn(() => null);
  const mockValidateDialog = vi.fn(() => null);

  const defaultProps = {
    characters: mockCharacters,
    activeCharacter: mockCharacters[0],
    onClose: mockOnClose,
    onSave: mockOnSave,
    onAddCharacter: mockOnAddCharacter,
    onDeleteCharacter: mockOnDeleteCharacter,
    onResetToDefault: mockOnResetToDefault,
    validateName: mockValidateName,
    validateDialog: mockValidateDialog
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should display settings header', () => {
      render(<CharacterSettings {...defaultProps} />);

      expect(screen.getByText('キャラクター設定')).toBeInTheDocument();
    });

    it('should display character selector', () => {
      render(<CharacterSettings {...defaultProps} />);

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(1);
      // First select is character selector
      expect(selects[0]).toHaveValue('normal');
    });

    it('should display basic settings section', () => {
      render(<CharacterSettings {...defaultProps} />);

      expect(screen.getByText('基本設定')).toBeInTheDocument();
      expect(screen.getByText('キャラクター名')).toBeInTheDocument();
      expect(screen.getByText('口調')).toBeInTheDocument();
    });

    it('should display avatar section', () => {
      render(<CharacterSettings {...defaultProps} />);

      expect(screen.getByText('アバター画像')).toBeInTheDocument();
      // These labels appear in the avatar grid
      const avatarLabels = screen.getAllByText(/通常|正解時|不正解時/);
      expect(avatarLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('should display dialog tabs', () => {
      render(<CharacterSettings {...defaultProps} />);

      // Dialog tabs are buttons, check they exist
      const dialogTabs = document.querySelectorAll('.dialog-tab');
      expect(dialogTabs.length).toBe(6); // 出題時, 正解時, 不正解時, タイムアウト, 開始時, 結果発表
    });

    it('should display preview section', () => {
      render(<CharacterSettings {...defaultProps} />);

      expect(screen.getByText('プレビュー')).toBeInTheDocument();
    });

    it('should display action buttons', () => {
      render(<CharacterSettings {...defaultProps} />);

      expect(screen.getByText('キャンセル')).toBeInTheDocument();
      expect(screen.getByText('保存')).toBeInTheDocument();
    });
  });

  describe('character selection', () => {
    it('should switch character when selected', () => {
      render(<CharacterSettings {...defaultProps} />);

      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'vegeta' } });

      // Character name input should update
      const nameInput = screen.getByDisplayValue('ベジータ');
      expect(nameInput).toBeInTheDocument();
    });
  });

  describe('name editing', () => {
    it('should update name when typed', () => {
      render(<CharacterSettings {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('ノーマル');
      fireEvent.change(nameInput, { target: { value: '新しい名前' } });

      expect(screen.getByDisplayValue('新しい名前')).toBeInTheDocument();
    });

    it('should validate name on change', () => {
      render(<CharacterSettings {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('ノーマル');
      fireEvent.change(nameInput, { target: { value: '新しい名前' } });

      expect(mockValidateName).toHaveBeenCalledWith('新しい名前');
    });

    it('should display name error', () => {
      mockValidateName.mockReturnValueOnce('名前が長すぎます');
      render(<CharacterSettings {...defaultProps} />);

      const nameInput = screen.getByDisplayValue('ノーマル');
      fireEvent.change(nameInput, { target: { value: 'とても長い名前' } });

      expect(screen.getByText('名前が長すぎます')).toBeInTheDocument();
    });
  });

  describe('speech pattern', () => {
    it('should display speech pattern options', () => {
      render(<CharacterSettings {...defaultProps} />);

      // Find the speech pattern select (second select in the form)
      const selects = screen.getAllByRole('combobox');
      const speechPatternSelect = selects[1];

      expect(speechPatternSelect).toBeInTheDocument();
    });
  });

  describe('dialog editing', () => {
    it('should display current dialogs', () => {
      render(<CharacterSettings {...defaultProps} />);

      // Dialog text appears in the dialog editor
      const dialogTexts = document.querySelectorAll('.dialog-text');
      expect(dialogTexts.length).toBeGreaterThan(0);
    });

    it('should switch dialog tabs', () => {
      render(<CharacterSettings {...defaultProps} />);

      // Find the correct tab button for "正解時" within dialog-tabs
      const correctTab = document.querySelectorAll('.dialog-tab')[1]; // Second tab
      fireEvent.click(correctTab);

      // After switching, should show different dialogs
      const dialogTexts = document.querySelectorAll('.dialog-text');
      expect(dialogTexts.length).toBeGreaterThan(0);
    });

    it('should add new dialog when add button clicked', () => {
      render(<CharacterSettings {...defaultProps} />);

      const addButtons = screen.getAllByText('+ セリフを追加');
      fireEvent.click(addButtons[0]);

      // Should now have the original dialog plus "新しいセリフ"
      expect(screen.getByText('新しいセリフ')).toBeInTheDocument();
    });

    it('should start editing dialog when edit button clicked', () => {
      render(<CharacterSettings {...defaultProps} />);

      // Find edit buttons within dialog-actions
      const editButtons = document.querySelectorAll('.dialog-actions button');
      fireEvent.click(editButtons[0]); // First edit button

      // Should show input field for editing
      const editForm = document.querySelector('.dialog-edit-form');
      expect(editForm).toBeInTheDocument();
    });

    it('should show quiz complete categories', () => {
      render(<CharacterSettings {...defaultProps} />);

      // Click on "結果発表" tab (last tab)
      const resultTab = document.querySelectorAll('.dialog-tab')[5];
      fireEvent.click(resultTab);

      expect(screen.getByText('80%以上')).toBeInTheDocument();
      expect(screen.getByText('60-79%')).toBeInTheDocument();
      expect(screen.getByText('60%未満')).toBeInTheDocument();
    });
  });

  describe('new character creation', () => {
    it('should call onAddCharacter when new button clicked', () => {
      render(<CharacterSettings {...defaultProps} />);

      fireEvent.click(screen.getByText('+ 新規作成'));

      expect(mockOnAddCharacter).toHaveBeenCalledTimes(1);
      expect(mockOnAddCharacter).toHaveBeenCalledWith(expect.objectContaining({
        name: '新しいキャラクター'
      }));
    });
  });

  describe('preset character actions', () => {
    it('should show reset button for preset characters', () => {
      render(<CharacterSettings {...defaultProps} />);

      expect(screen.getByText('デフォルトに戻す')).toBeInTheDocument();
    });

    it('should call onResetToDefault when confirmed', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      render(<CharacterSettings {...defaultProps} />);

      fireEvent.click(screen.getByText('デフォルトに戻す'));

      expect(mockOnResetToDefault).toHaveBeenCalledWith('normal');
    });

    it('should not call onResetToDefault when cancelled', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(false);
      render(<CharacterSettings {...defaultProps} />);

      fireEvent.click(screen.getByText('デフォルトに戻す'));

      expect(mockOnResetToDefault).not.toHaveBeenCalled();
    });
  });

  describe('custom character actions', () => {
    it('should show delete button for custom characters', () => {
      const customCharacter = mockCharacters[2];
      render(
        <CharacterSettings
          {...defaultProps}
          activeCharacter={customCharacter}
        />
      );

      // Select the custom character
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'custom_1' } });

      expect(screen.getByText('キャラクターを削除')).toBeInTheDocument();
    });

    it('should call onDeleteCharacter when confirmed', () => {
      vi.spyOn(window, 'confirm').mockReturnValue(true);
      const customCharacter = mockCharacters[2];
      render(
        <CharacterSettings
          {...defaultProps}
          activeCharacter={customCharacter}
        />
      );

      // Select the custom character
      const selects = screen.getAllByRole('combobox');
      fireEvent.change(selects[0], { target: { value: 'custom_1' } });

      fireEvent.click(screen.getByText('キャラクターを削除'));

      expect(mockOnDeleteCharacter).toHaveBeenCalledWith('custom_1');
    });
  });

  describe('save and close', () => {
    it('should call onClose when cancel clicked', () => {
      render(<CharacterSettings {...defaultProps} />);

      fireEvent.click(screen.getByText('キャンセル'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when X button clicked', () => {
      render(<CharacterSettings {...defaultProps} />);

      fireEvent.click(screen.getByText('×'));

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onSave when save clicked with valid data', () => {
      render(<CharacterSettings {...defaultProps} />);

      fireEvent.click(screen.getByText('保存'));

      expect(mockOnSave).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not save when name validation fails', () => {
      mockValidateName.mockReturnValue('エラー');
      render(<CharacterSettings {...defaultProps} />);

      fireEvent.click(screen.getByText('保存'));

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });
});
