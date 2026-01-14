function PresenterDialog({ message, presenter, type }) {
  if (!message) return null;

  const isVegeta = presenter === 'vegeta';

  return (
    <div className={`presenter-dialog ${presenter} ${type}`}>
      {isVegeta && <div className="presenter-avatar vegeta-avatar" />}
      <div className="presenter-message">
        <span className="dialog-text">{message}</span>
      </div>
    </div>
  );
}

export default PresenterDialog;
