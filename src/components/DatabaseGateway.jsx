import React, { useState, useEffect } from 'react';
import { Database, Key, ShieldCheck, ShieldAlert, ArrowRight, Loader } from 'lucide-react';
import {
  getSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  getSupabaseClient
} from '../services/supabase';

export default function DatabaseGateway({ onUnlocked }) {
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useEffect(() => {
    const creds = getSupabaseCredentials();
    if (creds) {
      setUrlInput(creds.url || '');
      setKeyInput(creds.key || '');
    }
  }, []);

  const handleConnect = async (e) => {
    e.preventDefault();
    const url = urlInput.trim();
    const key = keyInput.trim();

    if (!url || !key) {
      setStatus({ type: 'error', msg: 'Both the Project URL and Anon Key are required.' });
      return;
    }

    setIsLoading(true);
    setStatus({ type: 'loading', msg: 'Verifying your database connection...' });

    try {
      saveSupabaseCredentials(url, key);
      const client = getSupabaseClient();
      if (!client) throw new Error('Failed to initialize database client.');

      const { error } = await client
        .from('codetrack_contest_data')
        .select('count', { count: 'exact', head: true })
        .limit(1);

      if (error && error.code !== '42P01' && error.code !== 'PGRST116') {
        throw error;
      }

      setStatus({ type: 'success', msg: 'Connected! Entering CodeTrack...' });
      setIsEntering(true);
      setTimeout(() => { onUnlocked(); }, 1200);
    } catch (err) {
      clearSupabaseCredentials();
      setStatus({ type: 'error', msg: `Connection failed: ${err.message || 'Check your URL and Anon Key.'}` });
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.overlay} className={isEntering ? 'gateway-exit' : ''}>
      <div style={styles.orb1} />
      <div style={styles.orb2} />
      <div style={styles.orb3} />

      <div style={styles.card} className="animate-fade-in">
        <div style={styles.iconWrap}>
          <div style={styles.iconRing}>
            <Database size={32} color="var(--primary)" />
          </div>
        </div>

        <div style={styles.branding}>
          <h1 style={styles.appName}>CodeTrack</h1>
          <p style={styles.tagline}>Connect your database to continue</p>
        </div>

        <div style={styles.infoBox}>
          <ShieldCheck size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
          <p style={styles.infoText}>
            CodeTrack stores your contest tracking data in your own private Supabase database.
            Enter your project credentials below to unlock the app.
          </p>
        </div>

        <form onSubmit={handleConnect} style={styles.form}>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Supabase Project URL</label>
            <input
              type="text"
              className="form-control"
              style={styles.input}
              placeholder="https://yourprojectid.supabase.co"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Supabase Anon Key (Public)</label>
            <div style={styles.inputWrapper}>
              <Key size={15} style={styles.keyIcon} />
              <input
                type="password"
                className="form-control"
                style={{ ...styles.input, paddingLeft: '38px' }}
                placeholder="eyJhbGciOi..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                disabled={isLoading}
                autoComplete="off"
              />
            </div>
          </div>

          {status.msg && (
            <div style={{
              ...styles.statusBox,
              background: status.type === 'error' ? 'rgba(239,68,68,0.1)' : status.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(99,102,241,0.1)',
              borderColor: status.type === 'error' ? 'rgba(239,68,68,0.25)' : status.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(99,102,241,0.25)',
              color: status.type === 'error' ? 'var(--danger)' : status.type === 'success' ? 'var(--success)' : 'var(--primary)',
            }}>
              {status.type === 'error' && <ShieldAlert size={15} style={{ flexShrink: 0 }} />}
              {status.type === 'success' && <ShieldCheck size={15} style={{ flexShrink: 0 }} />}
              {status.type === 'loading' && <Loader size={15} style={{ flexShrink: 0, animation: 'spin 1s linear infinite' }} />}
              <span>{status.msg}</span>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary"
            style={styles.submitBtn}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} />
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>Enter CodeTrack</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <p style={styles.helpText}>
          Don&apos;t have a Supabase project?{' '}
          <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" style={styles.helpLink}>
            Create one free at supabase.com →
          </a>
        </p>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-orb { 0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.55; transform: scale(1.08); } }
        .gateway-exit { animation: gateway-fade-out 0.6s ease forwards; }
        @keyframes gateway-fade-out { to { opacity: 0; transform: scale(1.04); } }
      `}</style>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    zIndex: 2000,
    overflow: 'hidden',
  },
  orb1: {
    position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)',
    top: '-100px', left: '-100px',
    animation: 'pulse-orb 6s ease-in-out infinite', pointerEvents: 'none',
  },
  orb2: {
    position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)',
    bottom: '-80px', right: '-80px',
    animation: 'pulse-orb 8s ease-in-out infinite reverse', pointerEvents: 'none',
  },
  orb3: {
    position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)',
    bottom: '20%', left: '10%',
    animation: 'pulse-orb 10s ease-in-out infinite', pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 1, width: '100%', maxWidth: '460px',
    background: 'rgba(22, 28, 45, 0.92)',
    border: '1px solid rgba(99,102,241,0.2)', borderRadius: '20px',
    backdropFilter: 'blur(20px)',
    boxShadow: '0 30px 60px -15px rgba(0,0,0,0.6), 0 0 40px rgba(99,102,241,0.08)',
    padding: '40px 36px', display: 'flex', flexDirection: 'column',
    gap: '24px', alignItems: 'center', textAlign: 'center',
  },
  iconWrap: { display: 'flex', justifyContent: 'center' },
  iconRing: {
    width: '72px', height: '72px', borderRadius: '50%',
    background: 'rgba(99,102,241,0.12)', border: '1.5px solid rgba(99,102,241,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 30px rgba(99,102,241,0.2)',
  },
  branding: { display: 'flex', flexDirection: 'column', gap: '6px' },
  appName: {
    fontSize: '2rem', fontWeight: '800', margin: 0,
    background: 'linear-gradient(135deg, #a5b4fc 0%, #818cf8 50%, #6366f1 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px',
  },
  tagline: { fontSize: '0.92rem', color: 'var(--color-text-secondary)', margin: 0 },
  infoBox: {
    display: 'flex', alignItems: 'flex-start', gap: '10px',
    background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)',
    borderRadius: '10px', padding: '12px 14px', textAlign: 'left', width: '100%',
  },
  infoText: { fontSize: '0.8rem', color: 'var(--color-text-secondary)', lineHeight: 1.55, margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '14px', width: '100%', textAlign: 'left' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '0.82rem', fontWeight: '600', color: 'var(--color-text-secondary)' },
  input: { padding: '11px 14px', fontSize: '0.9rem', width: '100%' },
  inputWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  keyIcon: { position: 'absolute', left: '13px', color: 'var(--color-text-muted)', pointerEvents: 'none' },
  statusBox: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '11px 14px', borderRadius: '9px', border: '1px solid transparent',
    fontSize: '0.82rem', lineHeight: 1.45,
  },
  submitBtn: {
    width: '100%', padding: '13px', fontSize: '0.95rem', fontWeight: '700',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    gap: '8px', marginTop: '4px', letterSpacing: '0.2px',
  },
  helpText: { fontSize: '0.76rem', color: 'var(--color-text-muted)', margin: 0 },
  helpLink: { color: 'var(--primary)', textDecoration: 'none' },
};
