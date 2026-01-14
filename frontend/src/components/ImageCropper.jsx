import { useState, useRef, useEffect, useCallback } from 'react';

const CROP_SIZE = 200; // 出力サイズ
const PREVIEW_SIZE = 250; // プレビュー表示サイズ

function ImageCropper({ imageUrl, onCrop, onCancel }) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const containerRef = useRef(null);
  const imageRef = useRef(null);

  // 画像読み込み時にサイズを取得
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      let width, height;

      // 短い辺がプレビューサイズになるようにスケール
      if (aspectRatio > 1) {
        height = PREVIEW_SIZE;
        width = PREVIEW_SIZE * aspectRatio;
      } else {
        width = PREVIEW_SIZE;
        height = PREVIEW_SIZE / aspectRatio;
      }

      setImageSize({ width, height, naturalWidth: img.width, naturalHeight: img.height });
      // 中央に配置
      setPosition({
        x: (PREVIEW_SIZE - width) / 2,
        y: (PREVIEW_SIZE - height) / 2
      });
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // ドラッグ開始
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // タッチ開始
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({
      x: touch.clientX - position.x,
      y: touch.clientY - position.y
    });
  };

  // ドラッグ中
  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;

    const scaledWidth = imageSize.width * zoom;
    const scaledHeight = imageSize.height * zoom;

    // 境界制限
    const minX = PREVIEW_SIZE - scaledWidth;
    const minY = PREVIEW_SIZE - scaledHeight;

    const newX = Math.min(0, Math.max(minX, e.clientX - dragStart.x));
    const newY = Math.min(0, Math.max(minY, e.clientY - dragStart.y));

    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart, imageSize, zoom]);

  // タッチ移動
  const handleTouchMove = useCallback((e) => {
    if (!isDragging) return;
    const touch = e.touches[0];

    const scaledWidth = imageSize.width * zoom;
    const scaledHeight = imageSize.height * zoom;

    const minX = PREVIEW_SIZE - scaledWidth;
    const minY = PREVIEW_SIZE - scaledHeight;

    const newX = Math.min(0, Math.max(minX, touch.clientX - dragStart.x));
    const newY = Math.min(0, Math.max(minY, touch.clientY - dragStart.y));

    setPosition({ x: newX, y: newY });
  }, [isDragging, dragStart, imageSize, zoom]);

  // ドラッグ終了
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // グローバルイベントリスナー
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleTouchMove]);

  // ズーム変更時に位置を調整
  const handleZoomChange = (e) => {
    const newZoom = parseFloat(e.target.value);
    const oldZoom = zoom;

    // 中心を基準にズーム
    const centerX = PREVIEW_SIZE / 2;
    const centerY = PREVIEW_SIZE / 2;

    const oldCenterOffsetX = centerX - position.x;
    const oldCenterOffsetY = centerY - position.y;

    const newCenterOffsetX = oldCenterOffsetX * (newZoom / oldZoom);
    const newCenterOffsetY = oldCenterOffsetY * (newZoom / oldZoom);

    const scaledWidth = imageSize.width * newZoom;
    const scaledHeight = imageSize.height * newZoom;

    const minX = PREVIEW_SIZE - scaledWidth;
    const minY = PREVIEW_SIZE - scaledHeight;

    const newX = Math.min(0, Math.max(minX, centerX - newCenterOffsetX));
    const newY = Math.min(0, Math.max(minY, centerY - newCenterOffsetY));

    setZoom(newZoom);
    setPosition({ x: newX, y: newY });
  };

  // クロップ実行
  const handleCrop = () => {
    const canvas = document.createElement('canvas');
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext('2d');

    const img = imageRef.current;
    if (!img) return;

    // スケール計算
    const scale = imageSize.naturalWidth / (imageSize.width * zoom);

    // 切り取り領域（元画像上の座標）
    const sourceX = -position.x * scale;
    const sourceY = -position.y * scale;
    const sourceSize = PREVIEW_SIZE * scale;

    // 円形クリッピング
    ctx.beginPath();
    ctx.arc(CROP_SIZE / 2, CROP_SIZE / 2, CROP_SIZE / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();

    // 背景を白で塗りつぶし
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, CROP_SIZE, CROP_SIZE);

    // 画像を描画
    ctx.drawImage(
      img,
      sourceX, sourceY, sourceSize, sourceSize,
      0, 0, CROP_SIZE, CROP_SIZE
    );

    // Base64に変換
    let quality = 0.9;
    let base64 = canvas.toDataURL('image/jpeg', quality);

    // サイズ調整
    const maxSize = 100 * 1024 * 1.37; // 100KB (Base64換算)
    while (base64.length > maxSize && quality > 0.1) {
      quality -= 0.1;
      base64 = canvas.toDataURL('image/jpeg', quality);
    }

    onCrop(base64);
  };

  const scaledWidth = imageSize.width * zoom;
  const scaledHeight = imageSize.height * zoom;

  return (
    <div className="image-cropper-overlay">
      <div className="image-cropper">
        <div className="cropper-header">
          <h3>画像の位置を調整</h3>
        </div>

        <div className="cropper-content">
          <div
            className="cropper-preview-container"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Crop preview"
              className="cropper-image"
              style={{
                width: `${scaledWidth}px`,
                height: `${scaledHeight}px`,
                transform: `translate(${position.x}px, ${position.y}px)`,
                cursor: isDragging ? 'grabbing' : 'grab'
              }}
              draggable={false}
            />
            <div className="cropper-guide" />
          </div>

          <div className="cropper-hint">
            ドラッグで位置を調整
          </div>

          <div className="cropper-zoom">
            <span className="zoom-label">ズーム</span>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={zoom}
              onChange={handleZoomChange}
              className="zoom-slider"
            />
            <span className="zoom-value">{Math.round(zoom * 100)}%</span>
          </div>
        </div>

        <div className="cropper-actions">
          <button className="cropper-cancel" onClick={onCancel}>
            キャンセル
          </button>
          <button className="cropper-confirm" onClick={handleCrop}>
            決定
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImageCropper;