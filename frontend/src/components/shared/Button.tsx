import { ButtonHTMLAttributes, forwardRef } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonColor = 'default' | 'success' | 'warning' | 'danger' | 'info';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** ボタンのスタイルバリアント */
  variant?: ButtonVariant;
  /** ボタンのサイズ */
  size?: ButtonSize;
  /** ボタンの色テーマ */
  color?: ButtonColor;
  /** 全幅表示 */
  fullWidth?: boolean;
  /** アクティブ状態（トグル用） */
  active?: boolean;
  /** ローディング状態 */
  loading?: boolean;
}

/**
 * 共通ボタンコンポーネント
 *
 * @example
 * // プライマリボタン
 * <Button variant="primary">送信</Button>
 *
 * // アウトラインボタン（危険）
 * <Button variant="outline" color="danger">削除</Button>
 *
 * // 全幅ボタン
 * <Button fullWidth>全幅ボタン</Button>
 *
 * // トグルボタン
 * <Button variant="outline" active={isActive} onClick={toggle}>
 *   {isActive ? 'ON' : 'OFF'}
 * </Button>
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      color = 'default',
      fullWidth = false,
      active = false,
      loading = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.button,
      styles[variant],
      styles[size],
      styles[color],
      fullWidth && styles.fullWidth,
      active && styles.active,
      loading && styles.loading,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button
        ref={ref}
        className={classNames}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading && <span className={styles.spinner} aria-hidden="true" />}
        <span className={loading ? styles.hiddenText : undefined}>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
