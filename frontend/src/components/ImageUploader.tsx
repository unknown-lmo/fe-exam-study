import { useState, useRef } from 'react';
import ImageCropper from './ImageCropper';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

interface ImageUploaderProps {
  currentImage: string | null;
  onImageChange: (base64: string) => void;
  onImageRemove: () => void;
}

function ImageUploader({ currentImage, onImageChange, onImageRemove }: ImageUploaderProps) {
  const [error, setError] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [rawImageUrl, setRawImageUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // ファイルタイプのチェック
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('JPG、PNG、GIF形式の画像のみ対応しています');
      return;
    }

    // ファイルをData URLに変換してクロッパーを表示
    const reader = new FileReader();
    reader.onload = (e) => {
      setRawImageUrl(e.target?.result as string);
      setShowCropper(true);
    };
    reader.onerror = () => {
      setError('ファイルの読み込みに失敗しました');
    };
    reader.readAsDataURL(file);

    // inputをリセット（同じファイルを再選択できるように）
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCrop = (croppedBase64: string) => {
    onImageChange(croppedBase64);
    setShowCropper(false);
    setRawImageUrl(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setRawImageUrl(null);
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
        >
          {currentImage ? '画像を変更' : '画像をアップロード'}
        </button>
        {currentImage && (
          <button
            type="button"
            className="remove-button"
            onClick={handleRemove}
          >
            削除
          </button>
        )}
      </div>

      {error && <p className="image-error">{error}</p>}

      <p className="image-hint">
        位置調整・トリミングができます
      </p>

      {showCropper && rawImageUrl && (
        <ImageCropper
          imageUrl={rawImageUrl}
          onCrop={handleCrop}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}

export default ImageUploader;
