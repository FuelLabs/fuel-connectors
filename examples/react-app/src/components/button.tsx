import clsx from 'clsx';

export type Props = {
  color?: 'primary' | 'secondary';
  loading?: boolean;
  loadingText?: string;
} & React.ComponentProps<'button'>;

export default function Button(props: Props) {
  const {
    color = 'primary',
    children,
    disabled,
    loading,
    loadingText,
    className,
    ...rest
  } = props;

  return (
    <button
      type="button"
      className={clsx(
        'btn',
        color === 'primary' && 'btn-primary',
        color === 'secondary' && 'btn-secondary',
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && loadingText && <span>{loadingText}</span>}
      {!loading && children}
    </button>
  );
}
