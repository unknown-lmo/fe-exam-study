function PresenterDialog({ message, presenter, type, activeCharacter }) {
  if (!message) return null;

  const isVegeta = presenter === 'vegeta';
  const hasCustomAvatar = activeCharacter?.avatar;

  return (
    <div className={`presenter-dialog ${presenter} ${type}`}>
      {hasCustomAvatar ? (
        <img
          src={activeCharacter.avatar}
          alt={activeCharacter.name}
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
