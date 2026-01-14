import { useState, useRef } from 'react';

const MAX_SIZE = 200; // 200x200px
const MAX_FILE_SIZE = 100 * 1024; // 100KB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

function ImageUploader({ currentImage, onImageChange, onImageRemove }) {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  // 画像をリサイズ・圧縮してBase64に変換
  const processImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Canvasでリサイズ
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // アスペクト比を維持してリサイズ
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_SIZE) {
              height = (height * MAX_SIZE) / width;
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = (width * MAX_SIZE) / height;
              height = MAX_SIZE;
            }
          }

          // 正方形にするため、中央でクロップ
          const size = Math.min(width, height);
          canvas.width = MAX_SIZE;
          canvas.height = MAX_SIZE;

          // 背景を白で塗りつぶし（透明PNGの場合）
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, MAX_SIZE, MAX_SIZE);

          // 中央に配置して描画
          const offsetX = (MAX_SIZE - width) / 2;
          const offsetY = (MAX_SIZE - height) / 2;
          ctx.drawImage(img, offsetX, offsetY, width, height);

          // 圧縮率を調整してBase64に変換
          let quality = 0.9;
          let base64 = canvas.toDataURL('image/jpeg', quality);

          // ファイルサイズが大きすぎる場合は圧縮率を下げる
          while (base64.length > MAX_FILE_SIZE * 1.37 && quality > 0.1) {
            quality -= 0.1;
            base64 = canvas.toDataURL('image/jpeg', quality);
          }

          if (base64.length > MAX_FILE_SIZE * 1.37) {
            reject(new Error('画像を十分に圧縮できませんでした。別の画像を試してください。'));
            return;
          }

          resolve(base64);
        };

        img.onerror = () => {
          reject(new Error('画像の読み込みに失敗しました'));
        };

        img.src = e.target.result;
      };

      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました'));
      };

      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError(null);
    setLoading(true);

    try {
      // ファイルタイプのチェック
      if (!ACCEPTED_TYPES.includes(file.type)) {
        throw new Error('JPG、PNG、GIF形式の画像のみ対応しています');
      }

      // 画像を処理
      const base64 = await processImage(file);
      onImageChange(base64);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      // inputをリセット（同じファイルを再選択できるように）
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setError(null);
    onImageRemove();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="image-uploader">
      <div className="image-preview-container" onClick={handleClick}>
        {currentImage ? (
          <img src={currentImage} alt="アバター" className="image-preview" />
        ) : (
          <div className="image-placeholder">
            <span className="placeholder-icon">📷</span>
            <span className="placeholder-text">画像を選択</span>
          </div>
        )}
        {loading && (
          <div className="image-loading">
            <span>処理中...</span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      <div className="image-actions">
        <button
          type="button"
          className="upload-button"
          onClick={handleClick}
          disabled={loading}
        >
          {currentImage ? '画像を変更' : '画像をアップロード'}
        </button>
        {currentImage && (
          <button
            type="button"
            className="remove-button"
            onClick={handleRemove}
            disabled={loading}
          >
            削除
          </button>
        )}
      </div>

      {error && <p className="image-error">{error}</p>}

      <p className="image-hint">
        200x200px、100KB以下に自動リサイズされます
      </p>
    </div>
  );
}

export default ImageUploader;
