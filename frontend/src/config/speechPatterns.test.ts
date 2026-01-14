import { describe, it, expect } from 'vitest';
import {
  SPEECH_PATTERNS,
  DEFAULT_SPEECH_PATTERN,
  getSpeechPatternList,
  transformWithPattern
} from './speechPatterns';

describe('speechPatterns', () => {
  describe('SPEECH_PATTERNS', () => {
    it('should have 8 speech patterns', () => {
      expect(Object.keys(SPEECH_PATTERNS)).toHaveLength(8);
    });

    it('should have all required pattern IDs', () => {
      const expectedIds = ['polite', 'oresama', 'ojousama', 'hakase', 'gyaru', 'genki1', 'genki2', 'ojisan'];
      expectedIds.forEach(id => {
        expect(SPEECH_PATTERNS).toHaveProperty(id);
      });
    });

    it('each pattern should have required properties', () => {
      Object.values(SPEECH_PATTERNS).forEach(pattern => {
        expect(pattern).toHaveProperty('id');
        expect(pattern).toHaveProperty('name');
        expect(pattern).toHaveProperty('description');
        expect(pattern).toHaveProperty('transform');
        expect(typeof pattern.transform).toBe('function');
      });
    });
  });

  describe('DEFAULT_SPEECH_PATTERN', () => {
    it('should be polite', () => {
      expect(DEFAULT_SPEECH_PATTERN).toBe('polite');
    });
  });

  describe('getSpeechPatternList', () => {
    it('should return array of 8 patterns', () => {
      const list = getSpeechPatternList();
      expect(list).toHaveLength(8);
    });

    it('should return patterns with id, name, description only (no transform)', () => {
      const list = getSpeechPatternList();
      list.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('description');
        expect(item).not.toHaveProperty('transform');
      });
    });
  });

  describe('transformWithPattern', () => {
    it('should return original text for unknown pattern', () => {
      const text = 'テストです。';
      // @ts-expect-error Testing invalid pattern
      expect(transformWithPattern('unknown', text)).toBe(text);
    });

    it('should call the correct pattern transform', () => {
      const text = 'これはテストです。';
      const result = transformWithPattern('oresama', text);
      expect(result).not.toBe(text);
    });
  });

  describe('polite pattern', () => {
    const transform = SPEECH_PATTERNS.polite.transform;

    it('should not transform text', () => {
      expect(transform('これはテストです。')).toBe('これはテストです。');
      expect(transform('覚えよう!')).toBe('覚えよう!');
    });
  });

  describe('oresama pattern', () => {
    const transform = SPEECH_PATTERNS.oresama.transform;

    it('should convert です。 to だ!', () => {
      expect(transform('これはテストです。')).toContain('だ!');
    });

    it('should convert ます。 to るぞ!', () => {
      expect(transform('勉強します。')).toContain('るぞ!');
    });

    it('should convert 覚えよう to 覚えろ!', () => {
      expect(transform('覚えよう。')).toContain('覚えろ!');
    });

    it('should convert しよう to しろ!', () => {
      expect(transform('しよう!')).toBe('しろ!');
    });

    it('should convert ください to しろ', () => {
      expect(transform('覚えてください')).toContain('しろ');
    });

    it('should convert full width ! to half width', () => {
      // ！ is converted to ! first, then the text without 。 is not further transformed
      expect(transform('テスト！')).toBe('テスト!');
    });
  });

  describe('ojousama pattern', () => {
    const transform = SPEECH_PATTERNS.ojousama.transform;

    it('should convert です。 to ですわ。 and add ending ですわ。', () => {
      // です。 -> ですわ。 then 。$ -> ですわ。
      expect(transform('これはテストです。')).toBe('これはテストですわですわ。');
    });

    it('should convert ます。 to ますわ。 and add ending ですわ。', () => {
      // ます。 -> ますわ。 then 。$ -> ですわ。
      expect(transform('勉強します。')).toBe('勉強しますわですわ。');
    });

    it('should convert ください to くださいませ。', () => {
      expect(transform('覚えてください。')).toContain('くださいませ');
    });
  });

  describe('hakase pattern', () => {
    const transform = SPEECH_PATTERNS.hakase.transform;

    it('should convert です。 to じゃ。', () => {
      expect(transform('これはテストです。')).toBe('これはテストじゃ。');
    });

    it('should convert ます。 to るのじゃ。', () => {
      // します。 -> し + るのじゃ。 (ます。 is replaced)
      expect(transform('勉強します。')).toBe('勉強しるのじゃ。');
    });

    it('should convert でしょう to であろう', () => {
      expect(transform('そうでしょう')).toBe('そうであろう');
    });
  });

  describe('gyaru pattern', () => {
    const transform = SPEECH_PATTERNS.gyaru.transform;

    it('should convert です。 to じゃん。', () => {
      expect(transform('これはテストです。')).toBe('これはテストじゃん。');
    });

    it('should convert ます。 to るっしょ。', () => {
      // します。 -> し + るっしょ。 (ます。 is replaced)
      expect(transform('勉強します。')).toBe('勉強しるっしょ。');
    });

    it('should add マジ to 重要', () => {
      expect(transform('これは重要です。')).toContain('マジ重要');
    });

    it('should add マジ to すごい', () => {
      expect(transform('すごいですね')).toContain('マジやばい');
    });
  });

  describe('genki1 pattern', () => {
    const transform = SPEECH_PATTERNS.genki1.transform;

    it('should convert です。 to だよ!', () => {
      expect(transform('これはテストです。')).toBe('これはテストだよ!');
    });

    it('should convert ます。 to るよ!', () => {
      // します。 -> し + るよ! (ます。 is replaced)
      expect(transform('勉強します。')).toBe('勉強しるよ!');
    });

    it('should convert ください to してね!', () => {
      expect(transform('覚えてください')).toContain('してね!');
    });
  });

  describe('genki2 pattern', () => {
    const transform = SPEECH_PATTERNS.genki2.transform;

    it('should convert 。 to !', () => {
      expect(transform('これはテストです。')).toBe('これはテストです!');
    });

    it('should keep です! as is', () => {
      expect(transform('すごいです!')).toBe('すごいです!');
    });

    it('should convert 覚えよう to 覚えましょう!', () => {
      expect(transform('覚えよう')).toBe('覚えましょう!');
    });
  });

  describe('ojisan pattern', () => {
    const transform = SPEECH_PATTERNS.ojisan.transform;

    it('should add emoji to です。', () => {
      const result = transform('これはテストです。');
      expect(result).toContain('ネ');
      // Should contain one of the emojis
      expect(result).toMatch(/[😊😄🤔😅✨💪👍🎉😁🙆]/);
    });

    it('should convert ? to ❓', () => {
      const result = transform('本当ですか?');
      expect(result).toContain('❓');
    });

    it('should convert ください to クダサイ🙏', () => {
      expect(transform('覚えてください')).toContain('クダサイ🙏');
    });

    it('should convert でしょう to カナ❓🤔', () => {
      expect(transform('そうでしょう')).toContain('カナ❓🤔');
    });
  });
});
