import type { Character, PresenterMode, PresenterDialogType, AvatarType } from '../types';

interface PresenterDialogProps {
  message: string;
  presenter: PresenterMode;
  type: PresenterDialogType;
  activeCharacter?: Character;
}

function PresenterDialog({ message, presenter, type, activeCharacter }: PresenterDialogProps) {
  if (!message) return null;

  const isVegeta = presenter === 'vegeta';

  // typeに応じたアバターを選択
  // type: 'intro' | 'correct' | 'incorrect' | 'complete'
  const getAvatarForType = (): string | null => {
    if (!activeCharacter?.avatars) return null;

    // typeをavatarキーにマッピング
    const avatarMap: Record<PresenterDialogType, AvatarType> = {
      intro: 'default',
      correct: 'correct',
      incorrect: 'incorrect',
      complete: 'default'  // 結果発表時はデフォルト
    };

    const avatarKey = avatarMap[type] || 'default';

    // 該当タイプの画像があればそれを使用、なければdefaultにフォールバック
    return activeCharacter.avatars[avatarKey] || activeCharacter.avatars.default || null;
  };

  const avatarUrl = getAvatarForType();

  return (
    <div className={`presenter-dialog ${presenter} ${type}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={activeCharacter?.name || ''}
          className="presenter-avatar custom-avatar"
        />
      ) : isVegeta ? (
        <div className="presenter-avatar vegeta-avatar" />
      ) : null}
      <div className="presenter-message">
        {activeCharacter?.name && (
          <span className="presenter-name">{activeCharacter.name}</span>
        )}
        <span className="dialog-text">{message}</span>
      </div>
    </div>
  );
}

export default PresenterDialog;
