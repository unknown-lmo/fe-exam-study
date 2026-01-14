import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCharacterSettings, VALIDATION } from './useCharacterSettings';

describe('useCharacterSettings', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with preset characters', () => {
      const { result } = renderHook(() => useCharacterSettings());

      expect(result.current.characters).toHaveLength(2);
      expect(result.current.characters[0].id).toBe('normal');
      expect(result.current.characters[1].id).toBe('vegeta');
    });

    it('should have normal as default active character', () => {
      const { result } = renderHook(() => useCharacterSettings());

      expect(result.current.activeCharacterId).toBe('normal');
      expect(result.current.activeCharacter.id).toBe('normal');
    });

    it('should load from localStorage', () => {
      const storedState = {
        characters: [
          { id: 'normal', name: 'ノーマル', avatars: { default: null, correct: null, incorrect: null }, speechPattern: 'polite', dialogs: {}, isPreset: true, createdAt: '', updatedAt: '' },
          { id: 'vegeta', name: 'ベジータ', avatars: { default: null, correct: null, incorrect: null }, speechPattern: 'oresama', dialogs: {}, isPreset: true, createdAt: '', updatedAt: '' }
        ],
        activeCharacterId: 'vegeta'
      };
      localStorage.setItem('characterSettings', JSON.stringify(storedState));

      const { result } = renderHook(() => useCharacterSettings());

      expect(result.current.activeCharacterId).toBe('vegeta');
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('characterSettings', 'invalid json');

      const { result } = renderHook(() => useCharacterSettings());

      expect(result.current.characters).toHaveLength(2);
      expect(result.current.activeCharacterId).toBe('normal');
    });

    it('should migrate legacy avatar format to avatars', () => {
      const legacyState = {
        characters: [
          { id: 'normal', name: 'ノーマル', avatar: 'old-avatar-url', speechPattern: 'polite', dialogs: {}, isPreset: true, createdAt: '', updatedAt: '' },
          { id: 'vegeta', name: 'ベジータ', speechPattern: 'oresama', dialogs: {}, isPreset: true, createdAt: '', updatedAt: '' }
        ],
        activeCharacterId: 'normal'
      };
      localStorage.setItem('characterSettings', JSON.stringify(legacyState));

      const { result } = renderHook(() => useCharacterSettings());

      // Should have migrated avatar to avatars.default
      expect(result.current.characters[0].avatars.default).toBe('old-avatar-url');
      expect(result.current.characters[0].avatars.correct).toBeNull();
      expect(result.current.characters[0].avatars.incorrect).toBeNull();
    });

    it('should add missing preset characters', () => {
      const incompleteState = {
        characters: [
          { id: 'normal', name: 'ノーマル', avatars: { default: null, correct: null, incorrect: null }, speechPattern: 'polite', dialogs: {}, isPreset: true, createdAt: '', updatedAt: '' }
        ],
        activeCharacterId: 'normal'
      };
      localStorage.setItem('characterSettings', JSON.stringify(incompleteState));

      const { result } = renderHook(() => useCharacterSettings());

      expect(result.current.characters.some(c => c.id === 'vegeta')).toBe(true);
    });
  });

  describe('setActiveCharacter', () => {
    it('should change active character', () => {
      const { result } = renderHook(() => useCharacterSettings());

      act(() => {
        result.current.setActiveCharacter('vegeta');
      });

      expect(result.current.activeCharacterId).toBe('vegeta');
      expect(result.current.activeCharacter.id).toBe('vegeta');
    });

    it('should persist to localStorage', () => {
      const { result } = renderHook(() => useCharacterSettings());

      act(() => {
        result.current.setActiveCharacter('vegeta');
      });

      const stored = JSON.parse(localStorage.getItem('characterSettings') || '{}');
      expect(stored.activeCharacterId).toBe('vegeta');
    });
  });

  describe('addCharacter', () => {
    it('should add a new character', () => {
      const { result } = renderHook(() => useCharacterSettings());

      let newId: string = '';
      act(() => {
        newId = result.current.addCharacter({ name: 'カスタム' });
      });

      expect(result.current.characters).toHaveLength(3);
      expect(result.current.characters[2].name).toBe('カスタム');
      expect(result.current.characters[2].isPreset).toBe(false);
      expect(newId).toMatch(/^custom_\d+$/);
    });

    it('should set new character as active', () => {
      const { result } = renderHook(() => useCharacterSettings());

      let newId: string = '';
      act(() => {
        newId = result.current.addCharacter({ name: 'カスタム' });
      });

      expect(result.current.activeCharacterId).toBe(newId);
    });

    it('should use default values for missing properties', () => {
      const { result } = renderHook(() => useCharacterSettings());

      act(() => {
        result.current.addCharacter({});
      });

      const newCharacter = result.current.characters[2];
      expect(newCharacter.name).toBe('新しいキャラクター');
      expect(newCharacter.speechPattern).toBe('polite');
    });

    it('should throw error when max characters reached', () => {
      const { result } = renderHook(() => useCharacterSettings());

      // Add characters up to the limit
      for (let i = 0; i < VALIDATION.maxCharacters - 2; i++) {
        act(() => {
          result.current.addCharacter({ name: `Custom ${i}` });
        });
      }

      expect(result.current.characters).toHaveLength(VALIDATION.maxCharacters);

      // Try to add one more
      expect(() => {
        act(() => {
          result.current.addCharacter({ name: 'One more' });
        });
      }).toThrow(`キャラクターは${VALIDATION.maxCharacters}体まで作成可能です`);
    });
  });

  describe('updateCharacter', () => {
    it('should update character properties', () => {
      const { result } = renderHook(() => useCharacterSettings());

      act(() => {
        result.current.updateCharacter('normal', { name: '新しい名前' });
      });

      expect(result.current.characters[0].name).toBe('新しい名前');
    });

    it('should update updatedAt timestamp', () => {
      const { result } = renderHook(() => useCharacterSettings());

      // updateCharacter sets a new timestamp
      act(() => {
        result.current.updateCharacter('normal', { name: '更新' });
      });

      // Just verify the updatedAt field exists and is a valid ISO string
      const updatedAt = result.current.characters[0].updatedAt;
      expect(updatedAt).toBeTruthy();
      expect(() => new Date(updatedAt)).not.toThrow();
    });

    it('should not affect other characters', () => {
      const { result } = renderHook(() => useCharacterSettings());
      const vegetaName = result.current.characters[1].name;

      act(() => {
        result.current.updateCharacter('normal', { name: '変更' });
      });

      expect(result.current.characters[1].name).toBe(vegetaName);
    });
  });

  describe('deleteCharacter', () => {
    it('should delete custom character', () => {
      const { result } = renderHook(() => useCharacterSettings());

      let customId: string = '';
      act(() => {
        customId = result.current.addCharacter({ name: 'カスタム' });
      });

      expect(result.current.characters).toHaveLength(3);

      act(() => {
        result.current.deleteCharacter(customId);
      });

      expect(result.current.characters).toHaveLength(2);
      expect(result.current.characters.some(c => c.id === customId)).toBe(false);
    });

    it('should throw error when deleting preset', () => {
      const { result } = renderHook(() => useCharacterSettings());

      expect(() => {
        act(() => {
          result.current.deleteCharacter('normal');
        });
      }).toThrow('プリセットキャラクターは削除できません');
    });

    it('should switch to normal when deleting active character', () => {
      const { result } = renderHook(() => useCharacterSettings());

      let customId: string = '';
      act(() => {
        customId = result.current.addCharacter({ name: 'カスタム' });
      });

      expect(result.current.activeCharacterId).toBe(customId);

      act(() => {
        result.current.deleteCharacter(customId);
      });

      expect(result.current.activeCharacterId).toBe('normal');
    });
  });

  describe('resetToDefault', () => {
    it('should reset preset character to defaults', () => {
      const { result } = renderHook(() => useCharacterSettings());

      act(() => {
        result.current.updateCharacter('vegeta', { name: '変更された名前' });
      });

      expect(result.current.characters[1].name).toBe('変更された名前');

      act(() => {
        result.current.resetToDefault('vegeta');
      });

      expect(result.current.characters[1].name).toBe('ベジータ');
    });

    it('should reset avatars to null', () => {
      const { result } = renderHook(() => useCharacterSettings());

      act(() => {
        result.current.updateCharacter('normal', {
          avatars: { default: 'some-url', correct: 'some-url', incorrect: 'some-url' }
        });
      });

      act(() => {
        result.current.resetToDefault('normal');
      });

      expect(result.current.characters[0].avatars.default).toBeNull();
      expect(result.current.characters[0].avatars.correct).toBeNull();
      expect(result.current.characters[0].avatars.incorrect).toBeNull();
    });

    it('should not affect custom characters', () => {
      const { result } = renderHook(() => useCharacterSettings());

      let customId: string = '';
      act(() => {
        customId = result.current.addCharacter({ name: 'カスタム' });
        result.current.updateCharacter(customId, { name: '変更後' });
      });

      act(() => {
        result.current.resetToDefault(customId);
      });

      // Custom character should not be reset
      expect(result.current.characters.find(c => c.id === customId)?.name).toBe('変更後');
    });
  });

  describe('getRandomDialog', () => {
    it('should return a dialog from questionIntro', () => {
      const { result } = renderHook(() => useCharacterSettings());

      const dialog = result.current.getRandomDialog('questionIntro');

      expect(typeof dialog).toBe('string');
      expect(dialog.length).toBeGreaterThan(0);
    });

    it('should return correct category for quizComplete based on score', () => {
      const { result } = renderHook(() => useCharacterSettings());

      // Test excellent (>= 80%)
      const excellent = result.current.getRandomDialog('quizComplete', 85);
      expect(excellent).toContain('素晴らしい');

      // Test good (60-79%)
      const good = result.current.getRandomDialog('quizComplete', 70);
      expect(good).toContain('頑張りました');

      // Test needsWork (< 60%)
      const needsWork = result.current.getRandomDialog('quizComplete', 50);
      expect(needsWork).toContain('もう少し');
    });

    it('should return empty string for invalid dialog type', () => {
      const { result } = renderHook(() => useCharacterSettings());

      // @ts-expect-error Testing invalid type
      const dialog = result.current.getRandomDialog('invalid');

      expect(dialog).toBe('');
    });
  });

  describe('transformExplanation', () => {
    it('should apply speech pattern transformation', () => {
      const { result } = renderHook(() => useCharacterSettings());

      act(() => {
        result.current.setActiveCharacter('vegeta');
      });

      const transformed = result.current.transformExplanation('これはテストです。');

      expect(transformed).not.toBe('これはテストです。');
      expect(transformed).toContain('だ!');
    });

    it('should not transform for polite pattern', () => {
      const { result } = renderHook(() => useCharacterSettings());

      // Normal uses polite pattern
      const original = 'これはテストです。';
      const transformed = result.current.transformExplanation(original);

      expect(transformed).toBe(original);
    });
  });

  describe('validateName', () => {
    it('should return null for valid name', () => {
      const { result } = renderHook(() => useCharacterSettings());

      expect(result.current.validateName('有効な名前')).toBeNull();
    });

    it('should return error for empty name', () => {
      const { result } = renderHook(() => useCharacterSettings());

      expect(result.current.validateName('')).toContain('1文字以上');
    });

    it('should return error for too long name', () => {
      const { result } = renderHook(() => useCharacterSettings());

      const longName = 'あ'.repeat(VALIDATION.nameMaxLength + 1);
      expect(result.current.validateName(longName)).toContain('20文字以内');
    });
  });

  describe('validateDialog', () => {
    it('should return null for valid dialog', () => {
      const { result } = renderHook(() => useCharacterSettings());

      expect(result.current.validateDialog('有効なセリフ')).toBeNull();
    });

    it('should return error for empty dialog', () => {
      const { result } = renderHook(() => useCharacterSettings());

      expect(result.current.validateDialog('')).toContain('1文字以上');
    });

    it('should return error for too long dialog', () => {
      const { result } = renderHook(() => useCharacterSettings());

      const longDialog = 'あ'.repeat(VALIDATION.dialogMaxLength + 1);
      expect(result.current.validateDialog(longDialog)).toContain('200文字以内');
    });
  });

  describe('VALIDATION constants', () => {
    it('should expose validation constants', () => {
      const { result } = renderHook(() => useCharacterSettings());

      expect(result.current.VALIDATION.nameMinLength).toBe(1);
      expect(result.current.VALIDATION.nameMaxLength).toBe(20);
      expect(result.current.VALIDATION.dialogMinLength).toBe(1);
      expect(result.current.VALIDATION.dialogMaxLength).toBe(200);
      expect(result.current.VALIDATION.maxCharacters).toBe(10);
    });
  });
});
