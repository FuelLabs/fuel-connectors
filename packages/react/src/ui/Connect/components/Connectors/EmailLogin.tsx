import { useState } from 'react';

type EmailLoginState = 'email' | 'code' | 'loading';

interface EmailLoginProps {
  onSubmitEmail: (email: string) => Promise<void>;
  onSubmitCode: (code: string) => Promise<void>;
  theme?: string;
}

export function EmailLogin({ onSubmitEmail, onSubmitCode }: EmailLoginProps) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [state, setState] = useState<EmailLoginState>('email');
  const [error, setError] = useState<string | null>(null);

  const handleSubmitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setState('loading');
    setError(null);
    try {
      await onSubmitEmail(email.trim());
      setState('code');
    } catch (_err) {
      setError('Failed to send code. Please try again.');
      setState('email');
    }
  };

  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setState('loading');
    setError(null);
    try {
      await onSubmitCode(code.trim());
    } catch (_err) {
      setError('Invalid code. Please try again.');
      setState('code');
    }
  };

  const handleBack = () => {
    setState('email');
    setEmail('');
    setCode('');
    setError(null);
  };

  const containerStyle: React.CSSProperties = {
    width: '100%',
    marginBottom: '16px',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '0.875em',
    color: 'var(--fuel-gray-11)',
    marginBottom: '8px',
    display: 'block',
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid var(--fuel-gray-6)',
    backgroundColor: 'var(--fuel-gray-2)',
  };

  const iconStyle: React.CSSProperties = {
    width: '24px',
    height: '24px',
    opacity: 0.6,
    flexShrink: 0,
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    border: 'none',
    background: 'transparent',
    outline: 'none',
    fontSize: '0.875em',
    color: 'var(--fuel-gray-12)',
  };

  const buttonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: isActive ? 'var(--fuel-green-9)' : 'var(--fuel-gray-6)',
    color: isActive ? 'white' : 'var(--fuel-gray-11)',
    fontSize: '0.875em',
    fontWeight: 500,
    cursor: isActive ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    flexShrink: 0,
  });

  const dividerContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '16px 0',
    width: '100%',
  };

  const dividerLineStyle: React.CSSProperties = {
    flex: 1,
    height: '1px',
    backgroundColor: 'var(--fuel-gray-6)',
  };

  const dividerTextStyle: React.CSSProperties = {
    fontSize: '0.75em',
    color: 'var(--fuel-gray-9)',
  };

  const errorStyle: React.CSSProperties = {
    color: 'var(--fuel-red-9)',
    fontSize: '0.75em',
    marginTop: '8px',
  };

  const backButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--fuel-gray-11)',
    fontSize: '0.75em',
    cursor: 'pointer',
    padding: 0,
    marginTop: '8px',
  };

  const codeInfoStyle: React.CSSProperties = {
    fontSize: '0.75em',
    color: 'var(--fuel-gray-9)',
    marginBottom: '8px',
  };

  if (state === 'loading') {
    return (
      <div style={containerStyle}>
        <label style={labelStyle}>Login with email</label>
        <div style={{ ...inputContainerStyle, justifyContent: 'center' }}>
          <span style={{ color: 'var(--fuel-gray-11)', fontSize: '0.875em' }}>
            Loading...
          </span>
        </div>
        <div style={dividerContainerStyle}>
          <div style={dividerLineStyle} />
          <span style={dividerTextStyle}>or use a wallet</span>
          <div style={dividerLineStyle} />
        </div>
      </div>
    );
  }

  if (state === 'code') {
    return (
      <div style={containerStyle}>
        <label style={labelStyle}>Enter verification code</label>
        <p style={codeInfoStyle}>We sent a code to {email}</p>
        <form onSubmit={handleSubmitCode} style={inputContainerStyle}>
          <input
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, '').slice(0, 6))
            }
            style={inputStyle}
          />
          <button
            type="submit"
            style={buttonStyle(code.length === 6)}
            disabled={code.length !== 6}
          >
            Verify
          </button>
        </form>
        {error && <p style={errorStyle}>{error}</p>}
        <button type="button" onClick={handleBack} style={backButtonStyle}>
          ← Use a different email
        </button>
        <div style={dividerContainerStyle}>
          <div style={dividerLineStyle} />
          <span style={dividerTextStyle}>or use a wallet</span>
          <div style={dividerLineStyle} />
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <label style={labelStyle}>Login with email</label>
      <form onSubmit={handleSubmitEmail} style={inputContainerStyle}>
        <svg
          style={iconStyle}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-labelledby="email-icon-title"
        >
          <title id="email-icon-title">Email</title>
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        <input
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
        />
        <button
          type="submit"
          style={buttonStyle(!!email.trim())}
          disabled={!email.trim()}
        >
          Submit
        </button>
      </form>
      {error && <p style={errorStyle}>{error}</p>}
      <div style={dividerContainerStyle}>
        <div style={dividerLineStyle} />
        <span style={dividerTextStyle}>or use a wallet</span>
        <div style={dividerLineStyle} />
      </div>
    </div>
  );
}
