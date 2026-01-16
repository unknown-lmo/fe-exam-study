import { HTMLAttributes, forwardRef } from 'react';
import styles from './Card.module.css';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'flat';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** カードのスタイルバリアント */
  variant?: CardVariant;
  /** パディングサイズ */
  padding?: CardPadding;
  /** クリック可能なカード */
  clickable?: boolean;
  /** 全幅表示 */
  fullWidth?: boolean;
}

/**
 * 共通カードコンポーネント
 *
 * @example
 * // デフォルトカード
 * <Card>コンテンツ</Card>
 *
 * // アウトラインカード
 * <Card variant="outlined" padding="lg">
 *   コンテンツ
 * </Card>
 *
 * // クリック可能なカード
 * <Card clickable onClick={handleClick}>
 *   クリック可能
 * </Card>
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      clickable = false,
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const classNames = [
      styles.card,
      styles[variant],
      styles[`padding-${padding}`],
      clickable && styles.clickable,
      fullWidth && styles.fullWidth,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div
        ref={ref}
        className={classNames}
        role={clickable ? 'button' : undefined}
        tabIndex={clickable ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * カードヘッダーコンポーネント
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** タイトル */
  title?: string;
  /** サブタイトル */
  subtitle?: string;
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, className, children, ...props }, ref) => {
    const classNames = [styles.cardHeader, className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        {title && <h3 className={styles.cardTitle}>{title}</h3>}
        {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

/**
 * カードボディコンポーネント
 */
export const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const classNames = [styles.cardBody, className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

/**
 * カードフッターコンポーネント
 */
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    const classNames = [styles.cardFooter, className].filter(Boolean).join(' ');

    return (
      <div ref={ref} className={classNames} {...props}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export default Card;
