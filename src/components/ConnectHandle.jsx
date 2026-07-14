import React, { useState } from 'react';
import { User, ShieldAlert, Award, Play } from 'lucide-react';

export default function ConnectHandle({ onConnect, onUseMock }) {
  const [handleInput, setHandleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const handle = handleInput.trim();
    if (!handle) {
      setErrorMsg('Please enter a handle');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      await onConnect(handle);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Could not verify handle. Please check your spelling and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div className="glass-card animate-fade-in" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>CT</div>
          <h2 style={styles.title}>Welcome to CodeTrack</h2>
          <p style={styles.subtitle}>
            Enter your Codeforces username to fetch your profile, track contest participation, and upsolve problems.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="cf-handle">
              Codeforces Handle
            </label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                id="cf-handle"
                className="form-control"
                style={styles.inputField}
                placeholder="e.g. tourist, Benq, cp_legend"
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
          </div>

          {errorMsg && (
            <div style={styles.errorContainer}>
              <ShieldAlert size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={isLoading || !handleInput.trim()}
          >
            {isLoading ? 'Verifying Handle...' : 'Connect Profile'}
          </button>
        </form>

        <div style={styles.divider}>
          <span style={styles.dividerLine}></span>
          <span style={styles.dividerText}>or</span>
          <span style={styles.dividerLine}></span>
        </div>

        <div style={styles.demoSection}>
          <p style={styles.demoText}>
            Want to see how the dashboard works first? Explore the site with demo mock data.
          </p>
          <button 
            onClick={onUseMock} 
            className="btn btn-secondary" 
            style={styles.demoBtn}
            disabled={isLoading}
          >
            <Play size={16} fill="currentColor" />
            Explore Demo Mode
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  outerContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 120px)',
    padding: '24px 16px',
  },
  card: {
    maxWidth: '460px',
    width: '100%',
    padding: '36px',
    textAlign: 'center',
    background: 'rgba(22, 28, 45, 0.85)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 25px rgba(99, 102, 241, 0.1)',
  },
  header: {
    marginBottom: '28px',
  },
  logoBadge: {
    background: 'linear-gradient(135deg, var(--primary), var(--info))',
    color: '#fff',
    fontFamily: 'var(--font-sans)',
    fontWeight: '800',
    fontSize: '1.5rem',
    width: '56px',
    height: '56px',
    borderRadius: '14px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-glow)',
    marginBottom: '16px',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: '700',
    marginBottom: '8px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--color-text-muted)',
    pointerEvents: 'none',
  },
  inputField: {
    paddingLeft: '44px',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(239, 68, 68, 0.1)',
    color: 'var(--danger)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '0.85rem',
    textAlign: 'left',
    lineHeight: 1.4,
  },
  submitBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '1rem',
    marginTop: '8px',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'var(--border-color)',
  },
  dividerText: {
    padding: '0 12px',
    fontSize: '0.85rem',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
  },
  demoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  demoText: {
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
    lineHeight: 1.4,
  },
  demoBtn: {
    width: '100%',
    padding: '10px 16px',
    fontSize: '0.9rem',
    borderColor: 'var(--border-color)',
    gap: '8px',
  },
};
