import React from 'react';
import { LayoutDashboard, List, LogOut, Award, RefreshCw, Download, Upload } from 'lucide-react';
import { getRankColorClass } from '../utils/helpers';

export default function Navbar({ 
  userInfo, 
  handle, 
  activeTab, 
  setActiveTab, 
  onDisconnect, 
  isMockData, 
  onRefreshData,
  isRefreshing,
  onExportData,
  onImportData
}) {
  const rankClass = userInfo ? getRankColorClass(userInfo.rank) : 'rank-unrated';

  return (
    <header style={styles.header}>
      <div className="container" style={styles.navContainer}>
        <div style={styles.logoSection} onClick={() => setActiveTab('dashboard')}>
          <div style={styles.logoIcon}>CT</div>
          <div>
            <h1 style={styles.logoText}>CodeTrack</h1>
            <p style={styles.tagline}>Codeforces Contest Tracker</p>
          </div>
        </div>

        {handle && (
          <nav style={styles.navTabs}>
            <button 
              className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ ...styles.tabBtn, ...styles.navBtnOverride }}
              onClick={() => setActiveTab('dashboard')}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>
            <button 
              className={`btn ${activeTab === 'contests' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ ...styles.tabBtn, ...styles.navBtnOverride }}
              onClick={() => setActiveTab('contests')}
            >
              <List size={18} />
              Contests
            </button>
          </nav>
        )}

        {handle && (
          <div style={styles.userSection}>
            {isMockData && (
              <span className="badge badge-warning" style={styles.demoBadge}>
                Demo Mode
              </span>
            )}
            
            <div style={styles.userInfoCard}>
              <img 
                src={userInfo?.avatar || 'https://userpic.codeforces.org/no-avatar.jpg'} 
                alt={handle} 
                style={styles.avatar} 
              />
              <div style={styles.userDetails}>
                <span className={`rank-username ${rankClass}`} style={styles.handleText}>
                  {handle}
                </span>
                {userInfo?.rating && (
                  <span style={styles.ratingText}>
                    <Award size={12} style={{ marginRight: 2, display: 'inline' }} />
                    {userInfo.rating}
                  </span>
                )}
              </div>
            </div>

            <button 
              className="btn btn-secondary" 
              style={styles.iconBtn} 
              title="Refresh Data"
              onClick={onRefreshData}
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            <button 
              className="btn btn-secondary" 
              style={styles.iconBtn} 
              title="Export Backup JSON"
              onClick={onExportData}
            >
              <Download size={16} />
            </button>

            <button 
              className="btn btn-secondary" 
              style={styles.iconBtn} 
              title="Import Backup JSON"
              onClick={() => document.getElementById('cf-import-file').click()}
            >
              <Upload size={16} />
            </button>
            <input 
              type="file" 
              id="cf-import-file" 
              accept=".json" 
              style={{ display: 'none' }} 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => onImportData(event.target.result);
                  reader.readAsText(file);
                }
                e.target.value = '';
              }}
            />

            <button 
              className="btn btn-danger" 
              style={styles.disconnectBtn}
              onClick={onDisconnect}
              title="Disconnect Handle"
            >
              <LogOut size={16} />
              <span className="nav-disconnect-text">Disconnect</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

const styles = {
  header: {
    background: 'var(--bg-navbar)',
    backdropFilter: 'var(--backdrop-blur)',
    WebkitBackdropFilter: 'var(--backdrop-blur)',
    borderBottom: '1px solid var(--border-color)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '12px 0',
  },
  navContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  logoIcon: {
    background: 'linear-gradient(135deg, var(--primary), var(--info))',
    color: '#fff',
    fontFamily: 'var(--font-sans)',
    fontWeight: '800',
    fontSize: '1.2rem',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-glow)',
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: '700',
    margin: 0,
    lineHeight: 1.1,
    background: 'linear-gradient(90deg, #fff, var(--color-text-secondary))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  tagline: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    margin: 0,
  },
  navTabs: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  tabBtn: {
    gap: '8px',
    padding: '8px 16px',
    fontSize: '0.9rem',
  },
  navBtnOverride: {
    border: '1px solid var(--border-color)',
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  demoBadge: {
    fontSize: '0.75rem',
    padding: '3px 8px',
  },
  userInfoCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 12px 4px 6px',
    background: 'rgba(255, 255, 255, 0.03)',
    border: '1px solid var(--border-color)',
    borderRadius: '30px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    lineHeight: 1.1,
  },
  handleText: {
    fontSize: '0.85rem',
    fontWeight: '600',
  },
  ratingText: {
    fontSize: '0.75rem',
    color: 'var(--color-text-secondary)',
    marginTop: '2px',
  },
  iconBtn: {
    padding: '10px',
    borderRadius: '8px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderColor: 'var(--border-color)',
    color: 'var(--color-text-secondary)',
  },
  disconnectBtn: {
    gap: '6px',
    padding: '8px 12px',
    fontSize: '0.85rem',
  }
};
