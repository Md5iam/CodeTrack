import React, { useState, useEffect } from 'react';
import { Database, X, ShieldCheck, ShieldAlert, Key, Clipboard, Check } from 'lucide-react';
import { 
  getSupabaseCredentials, 
  saveSupabaseCredentials, 
  clearSupabaseCredentials,
  getSupabaseClient 
} from '../services/supabase';

export default function CloudSettingsModal({ isOpen, onClose, onConfigChange }) {
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [status, setStatus] = useState({ type: '', msg: '' });
  const [copied, setCopied] = useState(false);

  const creds = getSupabaseCredentials();

  useEffect(() => {
    if (creds) {
      setUrlInput(creds.url);
      setKeyInput(creds.key);
    } else {
      setUrlInput('');
      setKeyInput('');
    }
    setStatus({ type: '', msg: '' });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus({ type: 'loading', msg: 'Verifying connection...' });

    const url = urlInput.trim();
    const key = keyInput.trim();

    if (!url || !key) {
      setStatus({ type: 'error', msg: 'Please enter both URL and Anon Key.' });
      return;
    }

    try {
      // Temporarily save to check if connection works
      saveSupabaseCredentials(url, key);
      const client = getSupabaseClient();
      
      if (!client) {
        throw new Error('Supabase client failed to initialize.');
      }

      // Test query to make sure credentials are valid (does not select anything, just tests authentication)
      const { error } = await client
        .from('codetrack_contest_data')
        .select('count', { count: 'exact', head: true })
        .limit(1);

      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        // PGRST116 is single row error, 42P01 is table not created yet (but credentials are valid!)
        throw error;
      }

      if (error && error.code === '42P01') {
        setStatus({ 
          type: 'warning', 
          msg: 'Keys are valid! However, the "codetrack_contest_data" table was not found in your Supabase database. Please run the SQL schema below in your Supabase SQL Editor.' 
        });
      } else {
        setStatus({ type: 'success', msg: 'Connected successfully to cloud database!' });
      }

      onConfigChange();
    } catch (err) {
      console.error(err);
      clearSupabaseCredentials();
      setStatus({ type: 'error', msg: `Connection failed: ${err.message || 'Check your keys and database permissions.'}` });
    }
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
    setUrlInput('');
    setKeyInput('');
    setStatus({ type: '', msg: '' });
    onConfigChange();
  };

  const sqlCode = `create table codetrack_contest_data (
  id bigint generated always as identity primary key,
  handle text not null,
  contest_id integer not null,
  status text default '',
  note text default '',
  favourite boolean default false,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  unique(handle, contest_id)
);

-- Enable RLS and add public access policies
alter table codetrack_contest_data enable row level security;
create policy "Allow public access" on codetrack_contest_data for all using (true) with check (true);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={styles.overlay}>
      <div className="glass-card animate-fade-in" style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.titleGroup}>
            <Database size={20} color="var(--primary)" />
            <h3 style={styles.title}>Cloud Database Sync</h3>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p style={styles.desc}>
          Store your notes, stars, and upsolving statuses in a secure cloud database. All devices logged in under your handle will sync dynamically.
        </p>

        {creds && (
          <div style={styles.connectedBox}>
            <ShieldCheck size={20} color="var(--success)" />
            <div style={styles.connectedInfo}>
              <span style={styles.connectedLabel}>Cloud Synchronization Active</span>
              <span style={styles.connectedUrl} title={creds.url}>
                URL: {creds.url.substring(0, 30)}...
              </span>
              <span style={styles.connectedSource}>
                Credentials loaded from: {creds.source === 'env' ? 'Environment Variables (.env)' : 'Browser Local Settings'}
              </span>
            </div>
            {creds.source === 'local' && (
              <button 
                className="btn btn-danger" 
                style={styles.disconnectBtn}
                onClick={handleDisconnect}
              >
                Disconnect
              </button>
            )}
          </div>
        )}

        {(!creds || creds.source === 'local') && (
          <form onSubmit={handleSave} style={styles.form}>
            {!creds && <h4 style={styles.formTitle}>Connect a Database</h4>}
            
            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label className="form-label">Supabase Project URL</label>
              <input 
                type="text" 
                className="form-control"
                style={styles.input}
                placeholder="https://yourprojectid.supabase.co"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Supabase Anon Key (Public Key)</label>
              <div style={styles.inputWrapper}>
                <Key size={14} style={styles.inputIcon} />
                <input 
                  type="password" 
                  className="form-control"
                  style={styles.keyInput}
                  placeholder="your-anon-public-key"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                />
              </div>
            </div>

            {status.msg && (
              <div style={{ 
                ...styles.statusBox, 
                background: status.type === 'error' ? 'rgba(239, 68, 68, 0.1)' : status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: status.type === 'error' ? 'var(--danger)' : status.type === 'success' ? 'var(--success)' : 'var(--warning)',
                borderColor: status.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
              }}>
                {status.type === 'error' ? <ShieldAlert size={16} /> : <ShieldCheck size={16} />}
                <span>{status.msg}</span>
              </div>
            )}

            {!creds && (
              <button type="submit" className="btn btn-primary" style={styles.saveBtn}>
                Save & Connect
              </button>
            )}
          </form>
        )}

        <div style={styles.sqlSection}>
          <div style={styles.sqlHeader}>
            <span style={styles.sqlTitle}>Supabase SQL Schema</span>
            <button style={styles.copyBtn} onClick={handleCopySql}>
              {copied ? <Check size={14} color="var(--success)" /> : <Clipboard size={14} />}
              <span>{copied ? 'Copied!' : 'Copy SQL Script'}</span>
            </button>
          </div>
          <pre style={styles.sqlCode}>
            <code>{sqlCode}</code>
          </pre>
          <span style={styles.sqlHelp}>
            Copy and run this query inside your **Supabase Project ➔ SQL Editor** to create the tables.
          </span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(8px)',
    zIndex: 999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '16px',
  },
  modal: {
    maxWidth: '540px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    background: 'rgba(22, 28, 45, 0.95)',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '28px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  title: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  },
  desc: {
    fontSize: '0.86rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
    margin: 0,
    textAlign: 'left',
  },
  connectedBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    background: 'rgba(16, 185, 129, 0.08)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    padding: '16px',
    borderRadius: '10px',
    textAlign: 'left',
  },
  connectedInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    flex: 1,
  },
  connectedLabel: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
  },
  connectedUrl: {
    fontSize: '0.78rem',
    color: 'var(--color-text-secondary)',
  },
  connectedSource: {
    fontSize: '0.72rem',
    color: 'var(--color-text-muted)',
  },
  disconnectBtn: {
    padding: '6px 12px',
    fontSize: '0.78rem',
    alignSelf: 'center',
  },
  form: {
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  formTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    margin: '0 0 4px 0',
  },
  input: {
    padding: '10px 14px',
    fontSize: '0.9rem',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--color-text-muted)',
    pointerEvents: 'none',
  },
  keyInput: {
    paddingLeft: '36px',
    paddingTop: '10px',
    paddingBottom: '10px',
    fontSize: '0.9rem',
  },
  statusBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid transparent',
    fontSize: '0.82rem',
    lineHeight: 1.4,
  },
  saveBtn: {
    width: '100%',
    padding: '10px',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  sqlSection: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '16px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  sqlHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sqlTitle: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  copyBtn: {
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '4px',
    color: 'var(--color-text-secondary)',
    padding: '4px 8px',
    fontSize: '0.72rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all var(--transition-fast)',
  },
  sqlCode: {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    padding: '12px',
    margin: 0,
    fontSize: '0.72rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--primary)',
    overflowX: 'auto',
    maxHeight: '120px',
  },
  sqlHelp: {
    fontSize: '0.72rem',
    color: 'var(--color-text-muted)',
    lineHeight: 1.4,
  }
};
