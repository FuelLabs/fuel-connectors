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
      ? { backgroundColor: '#374151', progressColor: '#22c55e' }
      : { backgroundColor: '#e5e7eb', progressColor: '#2563eb' };
  }, [theme]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.875rem',
          color: theme === 'dark' ? '#9ca3af' : '#6b7280',
        }}
      >
        <span style={{ fontWeight: '500' }}>Progress</span>
        <span>
          {current || 0} of {total || 0} transaction
          {(total || 0) !== 1 ? 's' : ''}
        </span>
      </div>
      <div
        style={{
          width: '100%',
          backgroundColor,
          borderRadius: '9999px',
          height: '0.5rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            backgroundColor: progressColor,
            height: '0.5rem',
            borderRadius: '9999px',
            transition: 'width 0.3s ease-in-out',
            width: `${progress}%`,
          }}
        />
      </div>
    </div>
  );
}
