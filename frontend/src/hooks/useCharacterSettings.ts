import { useState, useEffect, useCallback } from 'react';
import { transformWithPattern } from '../config/speechPatterns';
import { STORAGE_KEYS } from '../constants';
import type {
  Character,
  CharacterSettingsState,
  CharacterDialogs,
  CharacterAvatars,
  DialogType,
  ScoreCategory,
  SpeechPatternId
} from '../types';

// プリセットキャラクターのデフォルトセリフ
const PRESET_DIALOGS: Record<'normal' | 'vegeta', CharacterDialogs> = {
  normal: {
    questionIntro: [
      '問題です。',
      '次の問題に答えてください。',
      'さあ、考えてみましょう。'
    ],
    correct: [
      '正解です!',
      'よくできました!',
      'すばらしい!'
    ],
    incorrect: [
      '不正解です。',
      '残念、次は頑張りましょう。',
      '惜しい! もう一度確認しましょう。'
    ],
    timeout: [
      '時間切れです。',
      '時間内に回答できませんでした。',
      '制限時間オーバーです。'
    ],
    quizStart: [
      '学習を始めましょう!'
    ],
    quizComplete: {
      excellent: ['素晴らしい成績です! この調子で頑張りましょう!'],
      good: ['よく頑張りました! あと少しで完璧です!'],
      needsWork: ['もう少し頑張りましょう。復習が大切です!']
    }
  },
  vegeta: {
    questionIntro: [
      'フン、この程度の問題が解けるか見せてみろ!',
      'さあ、貴様の実力を見せてもらおうか!',
      '下級戦士でも解ける問題だ! できないとは言わせんぞ!',
      'この俺様が出題してやる。光栄に思え!'
    ],
    correct: [
      'フン、当然だ。これくらいできて当たり前だ!',
      '悪くない...だがこの程度で慢心するなよ!',
      'まあいいだろう。少しは見込みがあるようだな!',
      'ほう...カカロットより使えるかもしれんな!'
    ],
    incorrect: [
      'なんだと!? この程度もできんのか!',
      'クズめ...もう一度よく考えろ!',
      'たわけが! 修行が足りん!',
      '情けない! サイヤ人の誇りはどこへ行った!'
    ],
    timeout: [
      'ぐずぐずしおって! 時間切れだ!',
      '何をモタモタしている! 戦場では死んでいるぞ!',
      '遅い! サイヤ人の戦士失格だ!',
      'カカロット! この程度の判断に時間をかけるな!'
    ],
    quizStart: [
      'さあ、訓練開始だ! 覚悟はいいか、カカロット!?'
    ],
    quizComplete: {
      excellent: ['フン...認めてやろう、貴様は戦士だ! だが俺様には及ばん!'],
      good: ['まあまあだな...だが油断するな! 修行を怠るなよ!'],
      needsWork: ['情けない! このままでは地球を守れんぞ! もっと修行しろ!']
    }
  }
};

// デフォルトのavatars構造
const createDefaultAvatars = (): CharacterAvatars => ({
  default: null,
  correct: null,
  incorrect: null
});

// プリセットキャラクターの初期データ
const createPresetCharacters = (): Character[] => [
  {
    id: 'normal',
    name: 'ノーマル',
    avatars: createDefaultAvatars(),
    speechPattern: 'polite',
    dialogs: { ...PRESET_DIALOGS.normal },
    isPreset: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'vegeta',
    name: 'ベジータ',
    avatars: createDefaultAvatars(),
    speechPattern: 'oresama',
    dialogs: { ...PRESET_DIALOGS.vegeta },
    isPreset: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// 初期状態
const createInitialState = (): CharacterSettingsState => ({
  characters: createPresetCharacters(),
  activeCharacterId: 'normal'
});

// バリデーション
export const VALIDATION = {
  nameMinLength: 1,
  nameMaxLength: 20,
  dialogMinLength: 1,
  dialogMaxLength: 200,
  maxCharacters: 10
} as const;

// 古いavatar形式から新しいavatars形式に移行
interface LegacyCharacter extends Omit<Character, 'avatars'> {
  avatar?: string | null;
  avatars?: CharacterAvatars;
}

const migrateCharacter = (character: LegacyCharacter): Character => {
  // 既にavatars形式の場合はそのまま
  if (character.avatars) {
    return character as Character;
  }
  // 古いavatar形式からの移行
  return {
    ...character,
    avatars: {
      default: character.avatar || null,
      correct: null,
      incorrect: null
    }
  } as Character;
};

export interface UseCharacterSettingsReturn {
  // 状態
  characters: Character[];
  activeCharacter: Character;
  activeCharacterId: string;

  // アクション
  setActiveCharacter: (characterId: string) => void;
  addCharacter: (character: Partial<Character>) => string;
  updateCharacter: (characterId: string, updates: Partial<Character>) => void;
  deleteCharacter: (characterId: string) => void;
  resetToDefault: (characterId: string) => void;

  // ヘルパー
  getRandomDialog: (dialogType: DialogType, scorePercentage?: number | null) => string;
  transformExplanation: (text: string) => string;

  // バリデーション
  validateName: (name: string) => string | null;
  validateDialog: (dialog: string) => string | null;
  VALIDATION: typeof VALIDATION;
}

export function useCharacterSettings(): UseCharacterSettingsReturn {
  const [state, setState] = useState<CharacterSettingsState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CHARACTER_SETTINGS);
      if (stored) {
        const parsed = JSON.parse(stored) as CharacterSettingsState & { characters: LegacyCharacter[] };
        // プリセットキャラクターが存在するか確認、なければ追加
        const presets = createPresetCharacters();
        const hasNormal = parsed.characters.some(c => c.id === 'normal');
        const hasVegeta = parsed.characters.some(c => c.id === 'vegeta');

        if (!hasNormal) {
          parsed.characters.unshift(presets[0]);
        }
        if (!hasVegeta) {
          parsed.characters.splice(1, 0, presets[1]);
        }

        // avatars形式に移行
        const migratedCharacters = parsed.characters.map(migrateCharacter);

        return {
          ...parsed,
          characters: migratedCharacters
        };
      }
    } catch (e) {
      console.error('Failed to load character settings:', e);
    }
    return createInitialState();
  });

  // usePresenterModeからの移行処理
  useEffect(() => {
    const oldPresenterMode = localStorage.getItem('presenterMode');
    if (oldPresenterMode && !localStorage.getItem(STORAGE_KEYS.CHARACTER_SETTINGS)) {
      // 古い設定を新しい形式に移行
      const newActiveId = oldPresenterMode === 'vegeta' ? 'vegeta' : 'normal';
      setState(prev => ({
        ...prev,
        activeCharacterId: newActiveId
      }));
      // 古いキーを削除
      localStorage.removeItem('presenterMode');
    }
  }, []);

  // localStorageに保存
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CHARACTER_SETTINGS, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save character settings:', e);
    }
  }, [state]);

  // アクティブなキャラクターを取得
  const activeCharacter = state.characters.find(
    c => c.id === state.activeCharacterId
  ) || state.characters[0];

  // キャラクターを切り替え
  const setActiveCharacter = useCallback((characterId: string) => {
    setState(prev => ({
      ...prev,
      activeCharacterId: characterId
    }));
  }, []);

  // キャラクターを追加
  const addCharacter = useCallback((character: Partial<Character>): string => {
    if (state.characters.length >= VALIDATION.maxCharacters) {
      throw new Error(`キャラクターは${VALIDATION.maxCharacters}体まで作成可能です`);
    }

    const newCharacter: Character = {
      id: `custom_${Date.now()}`,
      name: character.name || '新しいキャラクター',
      avatars: character.avatars || createDefaultAvatars(),
      speechPattern: character.speechPattern || 'polite',
      dialogs: character.dialogs || { ...PRESET_DIALOGS.normal },
      isPreset: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      characters: [...prev.characters, newCharacter],
      activeCharacterId: newCharacter.id
    }));

    return newCharacter.id;
  }, [state.characters.length]);

  // キャラクターを更新
  const updateCharacter = useCallback((characterId: string, updates: Partial<Character>) => {
    setState(prev => ({
      ...prev,
      characters: prev.characters.map(c => {
        if (c.id !== characterId) return c;
        return {
          ...c,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      })
    }));
  }, []);

  // キャラクターを削除（プリセットは削除不可）
  const deleteCharacter = useCallback((characterId: string) => {
    const character = state.characters.find(c => c.id === characterId);
    if (!character) return;
    if (character.isPreset) {
      throw new Error('プリセットキャラクターは削除できません');
    }

    setState(prev => {
      const newCharacters = prev.characters.filter(c => c.id !== characterId);
      const newActiveId = prev.activeCharacterId === characterId
        ? 'normal'
        : prev.activeCharacterId;
      return {
        characters: newCharacters,
        activeCharacterId: newActiveId
      };
    });
  }, [state.characters]);

  // プリセットをデフォルトに戻す
  const resetToDefault = useCallback((characterId: string) => {
    const character = state.characters.find(c => c.id === characterId);
    if (!character || !character.isPreset) return;

    const defaultDialogs = PRESET_DIALOGS[characterId as 'normal' | 'vegeta'];
    if (!defaultDialogs) return;

    const defaultSpeechPattern: SpeechPatternId = characterId === 'vegeta' ? 'oresama' : 'polite';

    setState(prev => ({
      ...prev,
      characters: prev.characters.map(c => {
        if (c.id !== characterId) return c;
        return {
          ...c,
          name: characterId === 'vegeta' ? 'ベジータ' : 'ノーマル',
          avatars: createDefaultAvatars(),
          speechPattern: defaultSpeechPattern,
          dialogs: { ...defaultDialogs },
          updatedAt: new Date().toISOString()
        };
      })
    }));
  }, [state.characters]);

  // ランダムにセリフを取得
  const getRandomDialog = useCallback((dialogType: DialogType, scorePercentage: number | null = null): string => {
    const dialogs = activeCharacter.dialogs[dialogType];
    if (!dialogs) return '';

    // quizCompleteはスコアに応じたカテゴリを持つ
    if (dialogType === 'quizComplete' && scorePercentage !== null) {
      let category: ScoreCategory;
      if (scorePercentage >= 80) category = 'excellent';
      else if (scorePercentage >= 60) category = 'good';
      else category = 'needsWork';

      const quizCompleteDialogs = dialogs as { excellent: string[]; good: string[]; needsWork: string[] };
      const categoryDialogs = quizCompleteDialogs[category];
      if (!categoryDialogs || categoryDialogs.length === 0) return '';
      return categoryDialogs[Math.floor(Math.random() * categoryDialogs.length)];
    }

    // 通常の配列から取得
    if (Array.isArray(dialogs)) {
      return dialogs[Math.floor(Math.random() * dialogs.length)];
    }

    return '';
  }, [activeCharacter]);

  // 解説文を口調変換
  const transformExplanation = useCallback((text: string): string => {
    return transformWithPattern(activeCharacter.speechPattern, text);
  }, [activeCharacter.speechPattern]);

  // キャラクター一覧を取得
  const characters = state.characters;

  // バリデーション関数
  const validateName = useCallback((name: string): string | null => {
    if (!name || name.length < VALIDATION.nameMinLength) {
      return `名前は${VALIDATION.nameMinLength}文字以上必要です`;
    }
    if (name.length > VALIDATION.nameMaxLength) {
      return `名前は${VALIDATION.nameMaxLength}文字以内にしてください`;
    }
    return null;
  }, []);

  const validateDialog = useCallback((dialog: string): string | null => {
    if (!dialog || dialog.length < VALIDATION.dialogMinLength) {
      return `セリフは${VALIDATION.dialogMinLength}文字以上必要です`;
    }
    if (dialog.length > VALIDATION.dialogMaxLength) {
      return `セリフは${VALIDATION.dialogMaxLength}文字以内にしてください`;
    }
    return null;
  }, []);

  return {
    // 状態
    characters,
    activeCharacter,
    activeCharacterId: state.activeCharacterId,

    // アクション
    setActiveCharacter,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    resetToDefault,

    // ヘルパー
    getRandomDialog,
    transformExplanation,

    // バリデーション
    validateName,
    validateDialog,
    VALIDATION
  };
}
