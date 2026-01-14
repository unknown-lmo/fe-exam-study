import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PresenterDialog from './PresenterDialog';
import type { Character } from '../types';

const mockCharacter: Character = {
  id: 'test',
  name: 'テストキャラ',
  avatars: {
    default: 'default-avatar-url',
    correct: 'correct-avatar-url',
    incorrect: 'incorrect-avatar-url'
  },
  speechPattern: 'polite',
  dialogs: {
    questionIntro: ['問題です'],
    correct: ['正解!'],
    incorrect: ['不正解'],
    timeout: ['時間切れ'],
    quizStart: ['開始!'],
    quizComplete: {
      excellent: ['素晴らしい'],
      good: ['よくできました'],
      needsWork: ['頑張りましょう']
    }
  },
  isPreset: false,
  createdAt: '',
  updatedAt: ''
};

describe('PresenterDialog', () => {
  describe('empty message', () => {
    it('should return null when message is empty', () => {
      const { container } = render(
        <PresenterDialog message="" presenter="normal" type="intro" />
      );

      expect(container.firstChild).toBeNull();
    });
  });

  describe('message display', () => {
    it('should display the message', () => {
      render(
        <PresenterDialog message="テストメッセージ" presenter="normal" type="intro" />
      );

      expect(screen.getByText('テストメッセージ')).toBeInTheDocument();
    });
  });

  describe('presenter mode', () => {
    it('should apply normal class for normal mode', () => {
      render(
        <PresenterDialog message="メッセージ" presenter="normal" type="intro" />
      );

      const dialog = screen.getByText('メッセージ').closest('.presenter-dialog');
      expect(dialog).toHaveClass('normal');
    });

    it('should apply vegeta class for vegeta mode', () => {
      render(
        <PresenterDialog message="メッセージ" presenter="vegeta" type="intro" />
      );

      const dialog = screen.getByText('メッセージ').closest('.presenter-dialog');
      expect(dialog).toHaveClass('vegeta');
    });

    it('should show vegeta avatar div for vegeta mode without custom avatar', () => {
      render(
        <PresenterDialog message="メッセージ" presenter="vegeta" type="intro" />
      );

      const avatar = document.querySelector('.vegeta-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('dialog type classes', () => {
    it('should apply intro class', () => {
      render(
        <PresenterDialog message="メッセージ" presenter="normal" type="intro" />
      );

      const dialog = screen.getByText('メッセージ').closest('.presenter-dialog');
      expect(dialog).toHaveClass('intro');
    });

    it('should apply correct class', () => {
      render(
        <PresenterDialog message="メッセージ" presenter="normal" type="correct" />
      );

      const dialog = screen.getByText('メッセージ').closest('.presenter-dialog');
      expect(dialog).toHaveClass('correct');
    });

    it('should apply incorrect class', () => {
      render(
        <PresenterDialog message="メッセージ" presenter="normal" type="incorrect" />
      );

      const dialog = screen.getByText('メッセージ').closest('.presenter-dialog');
      expect(dialog).toHaveClass('incorrect');
    });

    it('should apply complete class', () => {
      render(
        <PresenterDialog message="メッセージ" presenter="normal" type="complete" />
      );

      const dialog = screen.getByText('メッセージ').closest('.presenter-dialog');
      expect(dialog).toHaveClass('complete');
    });
  });

  describe('custom character avatar', () => {
    it('should display character name', () => {
      render(
        <PresenterDialog
          message="メッセージ"
          presenter="normal"
          type="intro"
          activeCharacter={mockCharacter}
        />
      );

      expect(screen.getByText('テストキャラ')).toBeInTheDocument();
    });

    it('should display default avatar for intro type', () => {
      render(
        <PresenterDialog
          message="メッセージ"
          presenter="normal"
          type="intro"
          activeCharacter={mockCharacter}
        />
      );

      const avatar = screen.getByAltText('テストキャラ');
      expect(avatar).toHaveAttribute('src', 'default-avatar-url');
    });

    it('should display correct avatar for correct type', () => {
      render(
        <PresenterDialog
          message="メッセージ"
          presenter="normal"
          type="correct"
          activeCharacter={mockCharacter}
        />
      );

      const avatar = screen.getByAltText('テストキャラ');
      expect(avatar).toHaveAttribute('src', 'correct-avatar-url');
    });

    it('should display incorrect avatar for incorrect type', () => {
      render(
        <PresenterDialog
          message="メッセージ"
          presenter="normal"
          type="incorrect"
          activeCharacter={mockCharacter}
        />
      );

      const avatar = screen.getByAltText('テストキャラ');
      expect(avatar).toHaveAttribute('src', 'incorrect-avatar-url');
    });

    it('should display default avatar for complete type', () => {
      render(
        <PresenterDialog
          message="メッセージ"
          presenter="normal"
          type="complete"
          activeCharacter={mockCharacter}
        />
      );

      const avatar = screen.getByAltText('テストキャラ');
      expect(avatar).toHaveAttribute('src', 'default-avatar-url');
    });

    it('should fallback to default avatar when specific type avatar is missing', () => {
      const characterWithoutCorrectAvatar: Character = {
        ...mockCharacter,
        avatars: {
          default: 'default-url',
          correct: null,
          incorrect: null
        }
      };

      render(
        <PresenterDialog
          message="メッセージ"
          presenter="normal"
          type="correct"
          activeCharacter={characterWithoutCorrectAvatar}
        />
      );

      const avatar = screen.getByAltText('テストキャラ');
      expect(avatar).toHaveAttribute('src', 'default-url');
    });
  });
});
