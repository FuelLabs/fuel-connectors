import { useMemo } from 'react';

interface ProgressBarProps {
  theme?: 'dark' | 'light';
  current?: number;
  total?: number;
  backgroundColor?: string;
  progressColor?: string;
}

export function ProgressBar({
  total,
  current,
  theme = 'dark',
}: ProgressBarProps) {
  const progress = useMemo(() => {
    if (!total || !current) return 0;
    return (current / total) * 100;
  }, [total, current]);

  const { backgroundColor, progressColor } = useMemo(() => {
    return theme === 'dark'
      ? { backgroundColor: '#e5e7eb', progressColor: '#22c55e' }
      : { backgroundColor: '#e5e7eb', progressColor: '#2563eb' };
  }, [theme]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.875rem',
          color: '#6b7280',
        }}
      >
        <span>Progress</span>
        <span>
          {current}/{total} transactions
        </span>
      </div>
      <div
        style={{
          width: '100%',
          backgroundColor,
          borderRadius: '9999px',
          height: '0.5rem',
        }}
      >
        <div
          style={{
            backgroundColor: progressColor,
            height: '0.5rem',
            borderRadius: '9999px',
            transition: 'width 0.3s',
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}
