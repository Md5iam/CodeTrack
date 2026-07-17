import React, { useState } from 'react';
import { User, ShieldAlert, Award, Play } from 'lucide-react';

export default function ConnectHandle({ onConnect, onUseMock, platform }) {
  const [handleInput, setHandleInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const platformName = platform === 'codeforces' ? 'Codeforces' : platform === 'atcoder' ? 'AtCoder' : 'LeetCode';
  const getPlaceholder = () => {
    if (platform === 'codeforces') return "e.g. tourist, Benq, cp_legend";
    if (platform === 'atcoder') return "e.g. chokudai, tourist, rng_58";
    return "e.g. alfaarghya, chokudai, beatrix_coder";
  };

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
      setErrorMsg(err.message || `Could not verify handle. Please check your spelling and try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div className="glass-card animate-fade-in" style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoBadge}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', borderRadius: '14px' }}>
              <rect x="2" y="2" width="96" height="96" rx="22" ry="22" fill="#0c3f35" stroke="#38d1b4" strokeWidth="5" />
              <rect x="23" y="65" width="11" height="17" fill="none" stroke="#38d1b4" strokeWidth="5" />
              <rect x="40" y="53" width="11" height="29" fill="none" stroke="#38d1b4" strokeWidth="5" />
              <rect x="57" y="37" width="11" height="45" fill="none" stroke="#38d1b4" strokeWidth="5" />
              <rect x="74" y="45" width="11" height="37" fill="none" stroke="#38d1b4" strokeWidth="5" />
            </svg>
          </div>
          <h2 style={styles.title}>Welcome to CodeTrack</h2>
          <p style={styles.subtitle}>
            Enter your {platformName} username to fetch your profile, track contest participation, and upsolve problems.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label className="form-label" htmlFor="platform-handle">
              {platformName} Username
            </label>
            <div style={styles.inputWrapper}>
              <User size={18} style={styles.inputIcon} />
              <input
                type="text"
                id="platform-handle"
                className="form-control"
                style={styles.inputField}
                placeholder={getPlaceholder()}
                value={handleInput}
                onChange={(e) => setHandleInput(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
            </div>
            {platform === 'leetcode' && (
              <div style={styles.apiWarningContainer}>
                <ShieldAlert size={14} style={{ color: 'var(--warning)', marginRight: '6px', flexShrink: 0 }} />
                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: '1.2' }}>
                  <strong>Note:</strong> LeetCode API runs on Render free tier and can take 30-50 seconds to wake up if idle. Thank you for your patience!
                </span>
              </div>
            )}
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

        {platform === 'atcoder' && (
          <div style={{ marginTop: '20px', width: '100%' }}>
            <div style={styles.divider}>
              <span style={styles.dividerLine}></span>
              <span style={styles.dividerText}>or bypass</span>
              <span style={styles.dividerLine}></span>
            </div>
            <p style={{ ...styles.demoText, marginBottom: '12px' }}>
              Due to AtCoder proxy restrictions, you can bypass username sync and track contests manually.
            </p>
            <button
              onClick={() => onConnect('atcoder_manual')}
              className="btn btn-success"
              style={{ 
                ...styles.demoBtn, 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                color: 'var(--success)', 
                borderColor: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              disabled={isLoading}
            >
              <Play size={16} fill="currentColor" style={{ marginRight: '8px' }} />
              Track Contests Manually
            </button>
          </div>
        )}
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
    width: '56px',
    height: '56px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 20px rgba(56, 209, 180, 0.3)',
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
  apiWarningContainer: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(251, 191, 36, 0.04)',
    border: '1px solid rgba(251, 191, 36, 0.15)',
    borderRadius: '8px',
    padding: '8px 12px',
    marginTop: '10px',
    textAlign: 'left'
  },
};
