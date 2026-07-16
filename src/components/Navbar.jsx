import React, { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, List, LogOut, Award, RefreshCw, Database, Sun, Moon } from 'lucide-react';
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
  isCloudActive,
  onOpenCloudSettings,
  theme,
  onToggleTheme,
  platform,
  onChangePlatform
}) {
  const rankClass = userInfo 
    ? (platform === 'codeforces' 
        ? getRankColorClass(userInfo.rank) 
        : platform === 'atcoder' 
          ? `rank-at-${userInfo.rank.toLowerCase()}` 
          : `rank-lc-${userInfo.rank.toLowerCase()}`) 
    : 'rank-unrated';
  const rankColor = userInfo 
    ? `var(--rank-${
        platform === 'codeforces' 
          ? userInfo.rank.toLowerCase().replace(/ /g, '-') 
          : platform === 'atcoder'
            ? `at-${userInfo.rank.toLowerCase()}`
            : `lc-${userInfo.rank.toLowerCase()}`
      })` 
    : 'var(--border-color)';

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header style={{ ...styles.header, borderBottom: `1px solid ${rankColor}` }}>
      <div className="navbar-container" style={styles.navContainer}>
        <div style={styles.logoSection} onClick={() => setActiveTab('dashboard')}>
          <div style={styles.logoIcon}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', borderRadius: '10px' }}>
              <rect x="2" y="2" width="96" height="96" rx="22" ry="22" fill="#0F172A" />
              <rect x="23" y="65" width="11" height="17" fill="none" stroke="#0D9488" strokeWidth="5" />
              <rect x="40" y="53" width="11" height="29" fill="none" stroke="#0D9488" strokeWidth="5" />
              <rect x="57" y="37" width="11" height="45" fill="none" stroke="#0D9488" strokeWidth="5" />
              <rect x="74" y="45" width="11" height="37" fill="none" stroke="#0D9488" strokeWidth="5" />
            </svg>
          </div>
          <div>
            <h1 style={styles.logoText}>
              <span style={styles.logoCode}>Code</span><span style={styles.logoTrack}>Track</span>
            </h1>
          </div>
        </div>

        {/* Platform Selector Toggle */}
        <div className="platform-toggle">
          <button 
            type="button"
            className={`platform-btn platform-cf ${platform === 'codeforces' ? 'active' : ''}`}
            onClick={() => onChangePlatform('codeforces')}
          >
            Codeforces
          </button>
          <button 
            type="button"
            className={`platform-btn platform-at ${platform === 'atcoder' ? 'active' : ''}`}
            onClick={() => onChangePlatform('atcoder')}
          >
            AtCoder
          </button>
          <button 
            type="button"
            className={`platform-btn platform-lc ${platform === 'leetcode' ? 'active' : ''}`}
            onClick={() => onChangePlatform('leetcode')}
          >
            LeetCode
          </button>
        </div>

        {handle && (
          <div style={styles.rightGroup}>
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

            <div style={styles.userSection}>
              {isMockData && (
                <span className="badge badge-warning" style={styles.demoBadge}>
                  Demo Mode
                </span>
              )}
              
              <div ref={dropdownRef} style={{ position: 'relative' }}>
                <div 
                  style={{ ...styles.userInfoCard, cursor: 'pointer' }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <img 
                    src={userInfo?.avatar || (platform === 'codeforces' ? 'https://userpic.codeforces.org/no-avatar.jpg' : platform === 'atcoder' ? 'https://img.atcoder.jp/assets/icon/avatar.png' : 'https://assets.leetcode.com/users/default_avatar.jpg')} 
                    alt={handle} 
                    style={{ ...styles.avatar, boxShadow: userInfo ? `0 0 0 2px ${rankColor}` : 'none' }} 
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

                {isDropdownOpen && (
                  <div style={styles.dropdownMenu}>
                    <button 
                      className="btn btn-secondary" 
                      style={styles.dropdownItem} 
                      onClick={() => { onRefreshData(); setIsDropdownOpen(false); }}
                      disabled={isRefreshing}
                    >
                      <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                      Refresh Profile
                    </button>

                    <button 
                      className="btn btn-secondary" 
                      style={{
                        ...styles.dropdownItem,
                        color: isCloudActive ? 'var(--success)' : 'var(--color-text-secondary)',
                      }} 
                      onClick={() => { onOpenCloudSettings(); setIsDropdownOpen(false); }}
                    >
                      <Database size={14} />
                      Cloud Sync
                    </button>

                    <button 
                      className="btn btn-secondary" 
                      style={styles.dropdownItem} 
                      onClick={() => { onToggleTheme(); setIsDropdownOpen(false); }}
                    >
                      {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
                      {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    </button>

                    <div style={styles.dropdownDivider}></div>

                    <button 
                      className="btn btn-danger" 
                      style={{ ...styles.dropdownItem, ...styles.dropdownItemDanger }}
                      onClick={() => { onDisconnect(); setIsDropdownOpen(false); }}
                    >
                      <LogOut size={14} />
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            </div>
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
    gap: '32px',
    padding: '0 24px',
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    cursor: 'pointer',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 15px rgba(13, 148, 136, 0.3)',
  },
  logoText: {
    fontSize: '1.4rem',
    fontWeight: '600',
    fontFamily: `'Inter', sans-serif`,
    margin: 0,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
  },
  logoCode: {
    color: 'var(--logo-code-color, #1E293B)',
  },
  logoTrack: {
    color: '#0D9488',
  },
  rightGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    flexWrap: 'wrap',
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
    transition: 'background var(--transition-fast)',
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
  dropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '8px',
    background: 'var(--bg-card-solid)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: 'var(--shadow-lg)',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px',
    gap: '4px',
    minWidth: '180px',
    zIndex: 200,
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    background: 'transparent',
    border: '1px solid transparent',
    padding: '8px 12px',
    fontSize: '0.85rem',
    borderRadius: '8px',
    textAlign: 'left',
    justifyContent: 'flex-start',
    cursor: 'pointer',
    color: 'var(--color-text-secondary)',
    transition: 'all var(--transition-fast)',
  },
  dropdownItemDanger: {
    color: 'var(--danger)',
  },
  dropdownDivider: {
    height: '1px',
    background: 'var(--border-color)',
    margin: '4px 0',
  }
};
