import { useState, useEffect } from 'react';
import ImageUploader from './ImageUploader';
import { getSpeechPatternList } from '../config/speechPatterns';

const DIALOG_TYPES = [
  { id: 'questionIntro', name: '出題時' },
  { id: 'correct', name: '正解時' },
  { id: 'incorrect', name: '不正解時' },
  { id: 'timeout', name: 'タイムアウト' },
  { id: 'quizStart', name: '開始時' }
];

const QUIZ_COMPLETE_CATEGORIES = [
  { id: 'excellent', name: '80%以上' },
  { id: 'good', name: '60-79%' },
  { id: 'needsWork', name: '60%未満' }
];

function CharacterSettings({
  characters,
  activeCharacter,
  onClose,
  onSave,
  onAddCharacter,
  onDeleteCharacter,
  onResetToDefault,
  validateName,
  validateDialog
}) {
  // 編集中のキャラクター（コピーして編集）
  const [editingCharacter, setEditingCharacter] = useState(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState(activeCharacter?.id);
  const [activeDialogTab, setActiveDialogTab] = useState('questionIntro');
  const [errors, setErrors] = useState({});
  const [editingDialogIndex, setEditingDialogIndex] = useState(null);
  const [editingDialogText, setEditingDialogText] = useState('');
  const [editingDialogCategory, setEditingDialogCategory] = useState(null);

  // 選択されたキャラクターが変わったら編集データを更新
  useEffect(() => {
    const character = characters.find(c => c.id === selectedCharacterId);
    if (character) {
      setEditingCharacter(JSON.parse(JSON.stringify(character)));
    }
  }, [selectedCharacterId, characters]);

  const speechPatterns = getSpeechPatternList();

  // 名前を変更
  const handleNameChange = (e) => {
    const name = e.target.value;
    setEditingCharacter(prev => ({ ...prev, name }));

    const error = validateName(name);
    setErrors(prev => ({ ...prev, name: error }));
  };

  // 口調を変更
  const handleSpeechPatternChange = (e) => {
    setEditingCharacter(prev => ({
      ...prev,
      speechPattern: e.target.value
    }));
  };

  // 画像を変更（タイプ別）
  const handleImageChange = (avatarType, base64) => {
    setEditingCharacter(prev => ({
      ...prev,
      avatars: {
        ...prev.avatars,
        [avatarType]: base64
      }
    }));
  };

  // 画像を削除（タイプ別）
  const handleImageRemove = (avatarType) => {
    setEditingCharacter(prev => ({
      ...prev,
      avatars: {
        ...prev.avatars,
        [avatarType]: null
      }
    }));
  };

  // セリフを追加
  const handleAddDialog = (dialogType, category = null) => {
    setEditingCharacter(prev => {
      const newDialogs = { ...prev.dialogs };
      if (category) {
        // quizComplete用
        if (!newDialogs.quizComplete) {
          newDialogs.quizComplete = { excellent: [], good: [], needsWork: [] };
        }
        newDialogs.quizComplete[category] = [
          ...newDialogs.quizComplete[category],
          '新しいセリフ'
        ];
      } else {
        newDialogs[dialogType] = [...(newDialogs[dialogType] || []), '新しいセリフ'];
      }
      return { ...prev, dialogs: newDialogs };
    });
  };

  // セリフを編集開始
  const handleEditDialogStart = (index, text, category = null) => {
    setEditingDialogIndex(index);
    setEditingDialogText(text);
    setEditingDialogCategory(category);
  };

  // セリフを編集確定
  const handleEditDialogEnd = (dialogType, category = null) => {
    if (editingDialogIndex === null) return;

    const error = validateDialog(editingDialogText);
    if (error) {
      setErrors(prev => ({ ...prev, dialog: error }));
      return;
    }

    setEditingCharacter(prev => {
      const newDialogs = { ...prev.dialogs };
      if (category) {
        newDialogs.quizComplete[category][editingDialogIndex] = editingDialogText;
      } else {
        newDialogs[dialogType][editingDialogIndex] = editingDialogText;
      }
      return { ...prev, dialogs: newDialogs };
    });

    setEditingDialogIndex(null);
    setEditingDialogText('');
    setEditingDialogCategory(null);
    setErrors(prev => ({ ...prev, dialog: null }));
  };

  // セリフを削除
  const handleDeleteDialog = (dialogType, index, category = null) => {
    setEditingCharacter(prev => {
      const newDialogs = { ...prev.dialogs };
      if (category) {
        newDialogs.quizComplete[category] = newDialogs.quizComplete[category].filter(
          (_, i) => i !== index
        );
      } else {
        newDialogs[dialogType] = newDialogs[dialogType].filter((_, i) => i !== index);
      }
      return { ...prev, dialogs: newDialogs };
    });
  };

  // キャラクターを選択
  const handleCharacterSelect = (e) => {
    setSelectedCharacterId(e.target.value);
    setActiveDialogTab('questionIntro');
    setEditingDialogIndex(null);
    setEditingDialogCategory(null);
  };

  // 新規キャラクター作成
  const handleCreateNew = () => {
    const newId = onAddCharacter({
      name: '新しいキャラクター',
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
      }
    });
    setSelectedCharacterId(newId);
  };

  // キャラクターを削除
  const handleDelete = () => {
    if (editingCharacter?.isPreset) return;
    if (!confirm('このキャラクターを削除しますか?')) return;

    onDeleteCharacter(selectedCharacterId);
    setSelectedCharacterId('normal');
  };

  // デフォルトに戻す
  const handleResetToDefault = () => {
    if (!editingCharacter?.isPreset) return;
    if (!confirm('このキャラクターをデフォルトに戻しますか?')) return;

    onResetToDefault(selectedCharacterId);
  };

  // 保存
  const handleSave = () => {
    // バリデーション
    const nameError = validateName(editingCharacter.name);
    if (nameError) {
      setErrors(prev => ({ ...prev, name: nameError }));
      return;
    }

    // 各セリフカテゴリに最低1つあるか確認
    for (const type of DIALOG_TYPES) {
      if (!editingCharacter.dialogs[type.id] || editingCharacter.dialogs[type.id].length === 0) {
        setErrors(prev => ({ ...prev, dialog: `${type.name}のセリフが必要です` }));
        setActiveDialogTab(type.id);
        return;
      }
    }

    // quizCompleteの確認
    const qc = editingCharacter.dialogs.quizComplete;
    if (!qc || !qc.excellent?.length || !qc.good?.length || !qc.needsWork?.length) {
      setErrors(prev => ({ ...prev, dialog: '結果発表のセリフが必要です' }));
      setActiveDialogTab('quizComplete');
      return;
    }

    onSave(editingCharacter);
    onClose();
  };

  if (!editingCharacter) return null;

  const currentDialogs = activeDialogTab === 'quizComplete'
    ? null
    : editingCharacter.dialogs[activeDialogTab] || [];

  return (
    <div className="character-settings-overlay">
      <div className="character-settings">
        <div className="settings-header">
          <h2>キャラクター設定</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <div className="settings-content">
          {/* キャラクター選択 */}
          <div className="settings-section">
            <div className="character-selector">
              <select value={selectedCharacterId} onChange={handleCharacterSelect}>
                {characters.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.isPreset ? '(プリセット)' : ''}
                  </option>
                ))}
              </select>
              <button className="add-character-button" onClick={handleCreateNew}>
                + 新規作成
              </button>
            </div>
          </div>

          {/* 基本設定 */}
          <div className="settings-section">
            <h3>基本設定</h3>
            <div className="basic-settings-row">
              <div className="form-group">
                <label>キャラクター名</label>
                <input
                  type="text"
                  value={editingCharacter.name}
                  onChange={handleNameChange}
                  maxLength={20}
                />
                {errors.name && <span className="error">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>口調</label>
                <select
                  value={editingCharacter.speechPattern}
                  onChange={handleSpeechPatternChange}
                >
                  {speechPatterns.map(sp => (
                    <option key={sp.id} value={sp.id}>
                      {sp.name} - {sp.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* アバター画像 */}
          <div className="settings-section">
            <h3>アバター画像</h3>
            <p className="avatar-hint">状況に応じて表示される画像を設定できます（任意）</p>
            <div className="avatars-grid">
              <div className="avatar-item">
                <span className="avatar-label">通常・出題時</span>
                <ImageUploader
                  currentImage={editingCharacter.avatars?.default}
                  onImageChange={(base64) => handleImageChange('default', base64)}
                  onImageRemove={() => handleImageRemove('default')}
                />
              </div>
              <div className="avatar-item">
                <span className="avatar-label">正解時</span>
                <ImageUploader
                  currentImage={editingCharacter.avatars?.correct}
                  onImageChange={(base64) => handleImageChange('correct', base64)}
                  onImageRemove={() => handleImageRemove('correct')}
                />
              </div>
              <div className="avatar-item">
                <span className="avatar-label">不正解時</span>
                <ImageUploader
                  currentImage={editingCharacter.avatars?.incorrect}
                  onImageChange={(base64) => handleImageChange('incorrect', base64)}
                  onImageRemove={() => handleImageRemove('incorrect')}
                />
              </div>
            </div>
          </div>

          {/* セリフ編集 */}
          <div className="settings-section">
            <h3>セリフ編集</h3>

            <div className="dialog-tabs">
              {DIALOG_TYPES.map(type => (
                <button
                  key={type.id}
                  className={`dialog-tab ${activeDialogTab === type.id ? 'active' : ''}`}
                  onClick={() => {
                    setActiveDialogTab(type.id);
                    setEditingDialogIndex(null);
                    setEditingDialogCategory(null);
                  }}
                >
                  {type.name}
                </button>
              ))}
              <button
                className={`dialog-tab ${activeDialogTab === 'quizComplete' ? 'active' : ''}`}
                onClick={() => {
                  setActiveDialogTab('quizComplete');
                  setEditingDialogIndex(null);
                  setEditingDialogCategory(null);
                }}
              >
                結果発表
              </button>
            </div>

            <div className="dialog-editor">
              {activeDialogTab === 'quizComplete' ? (
                // 結果発表用（カテゴリ別）
                <div className="quiz-complete-editor">
                  {QUIZ_COMPLETE_CATEGORIES.map(cat => (
                    <div key={cat.id} className="quiz-complete-category">
                      <h4>{cat.name}</h4>
                      <div className="dialog-list">
                        {(editingCharacter.dialogs.quizComplete?.[cat.id] || []).map(
                          (dialog, index) => (
                            <div key={index} className="dialog-item">
                              {editingDialogIndex === index &&
                              editingDialogCategory === cat.id ? (
                                <div className="dialog-edit-form">
                                  <input
                                    type="text"
                                    value={editingDialogText}
                                    onChange={(e) => setEditingDialogText(e.target.value)}
                                    maxLength={200}
                                    autoFocus
                                  />
                                  <button
                                    onClick={() =>
                                      handleEditDialogEnd('quizComplete', cat.id)
                                    }
                                  >
                                    保存
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingDialogIndex(null);
                                      setEditingDialogText('');
                                      setEditingDialogCategory(null);
                                    }}
                                  >
                                    キャンセル
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="dialog-text">{dialog}</span>
                                  <div className="dialog-actions">
                                    <button
                                      onClick={() => handleEditDialogStart(index, dialog, cat.id)}
                                    >
                                      編集
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteDialog('quizComplete', index, cat.id)
                                      }
                                      disabled={
                                        editingCharacter.dialogs.quizComplete?.[cat.id]
                                          ?.length <= 1
                                      }
                                    >
                                      削除
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        )}
                      </div>
                      <button
                        className="add-dialog-button"
                        onClick={() => handleAddDialog('quizComplete', cat.id)}
                      >
                        + セリフを追加
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                // 通常のセリフ
                <>
                  <div className="dialog-list">
                    {currentDialogs.map((dialog, index) => (
                      <div key={index} className="dialog-item">
                        {editingDialogIndex === index ? (
                          <div className="dialog-edit-form">
                            <input
                              type="text"
                              value={editingDialogText}
                              onChange={(e) => setEditingDialogText(e.target.value)}
                              maxLength={200}
                              autoFocus
                            />
                            <button
                              onClick={() => handleEditDialogEnd(activeDialogTab)}
                            >
                              保存
                            </button>
                            <button
                              onClick={() => {
                                setEditingDialogIndex(null);
                                setEditingDialogText('');
                              }}
                            >
                              キャンセル
                            </button>
                          </div>
                        ) : (
                          <>
                            <span className="dialog-text">{dialog}</span>
                            <div className="dialog-actions">
                              <button
                                onClick={() => handleEditDialogStart(index, dialog)}
                              >
                                編集
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteDialog(activeDialogTab, index)
                                }
                                disabled={currentDialogs.length <= 1}
                              >
                                削除
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    className="add-dialog-button"
                    onClick={() => handleAddDialog(activeDialogTab)}
                  >
                    + セリフを追加
                  </button>
                </>
              )}

              {errors.dialog && <p className="error">{errors.dialog}</p>}
            </div>
          </div>

          {/* プレビュー */}
          <div className="settings-section">
            <h3>プレビュー</h3>
            <div className="preview-container">
              <div className="preview-dialog">
                {editingCharacter.avatars?.default ? (
                  <img
                    src={editingCharacter.avatars.default}
                    alt={editingCharacter.name}
                    className="preview-avatar"
                  />
                ) : (
                  <div className="preview-avatar-placeholder">
                    {editingCharacter.name.charAt(0)}
                  </div>
                )}
                <div className="preview-content">
                  <span className="preview-name">{editingCharacter.name}</span>
                  <span className="preview-text">
                    {editingCharacter.dialogs.questionIntro?.[0] || 'セリフがありません'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="settings-footer">
          <div className="footer-left">
            {editingCharacter.isPreset ? (
              <button className="reset-button" onClick={handleResetToDefault}>
                デフォルトに戻す
              </button>
            ) : (
              <button className="delete-button" onClick={handleDelete}>
                キャラクターを削除
              </button>
            )}
          </div>
          <div className="footer-right">
            <button className="cancel-button" onClick={onClose}>
              キャンセル
            </button>
            <button className="save-button" onClick={handleSave}>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CharacterSettings;
