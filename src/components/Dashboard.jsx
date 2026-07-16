import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  Bookmark
} from 'lucide-react';
import { getRankColorClass } from '../utils/helpers';

export default function Dashboard({ 
  stats, 
  recentContests = [], 
  onNavigateToContests,
  setFilterState,
  platform = 'codeforces'
}) {
  const rankClass = platform === 'codeforces' 
    ? getRankColorClass(stats.rank) 
    : platform === 'atcoder' 
      ? `rank-at-${stats.rank.toLowerCase()}` 
      : `rank-lc-${stats.rank.toLowerCase()}`;
  const maxRankClass = platform === 'codeforces' 
    ? getRankColorClass(stats.maxRank) 
    : platform === 'atcoder' 
      ? `rank-at-${stats.maxRank.toLowerCase()}` 
      : `rank-lc-${stats.maxRank.toLowerCase()}`;

  // Calculate rating progress to next level
  const CF_RATING_LEVELS = [
    { name: 'Newbie', min: 0, max: 1199 },
    { name: 'Pupil', min: 1200, max: 1399 },
    { name: 'Specialist', min: 1400, max: 1599 },
    { name: 'Expert', min: 1600, max: 1899 },
    { name: 'Candidate Master', min: 1900, max: 2099 },
    { name: 'Master', min: 2100, max: 2299 },
    { name: 'International Master', min: 2300, max: 2399 },
    { name: 'Grandmaster', min: 2400, max: 2599 },
    { name: 'International Grandmaster', min: 2600, max: 2999 },
    { name: 'Legendary Grandmaster', min: 3000, max: 8000 }
  ];

  const ATCODER_RATING_LEVELS = [
    { name: 'Grey', min: 0, max: 399 },
    { name: 'Brown', min: 400, max: 799 },
    { name: 'Green', min: 800, max: 1199 },
    { name: 'Cyan', min: 1200, max: 1599 },
    { name: 'Blue', min: 1600, max: 1999 },
    { name: 'Yellow', min: 2000, max: 2399 },
    { name: 'Orange', min: 2400, max: 2799 },
    { name: 'Red', min: 2800, max: 8000 }
  ];

  const LEETCODE_RATING_LEVELS = [
    { name: 'Standard', min: 0, max: 1599 },
    { name: 'Knight', min: 1600, max: 2199 },
    { name: 'Guardian', min: 2200, max: 8000 }
  ];

  const RATING_LEVELS = platform === 'codeforces' 
    ? CF_RATING_LEVELS 
    : platform === 'atcoder' 
      ? ATCODER_RATING_LEVELS 
      : LEETCODE_RATING_LEVELS;

  const currentLevelIndex = RATING_LEVELS.findIndex(
    level => stats.currentRating >= level.min && stats.currentRating <= level.max
  );

  const currentLevel = RATING_LEVELS[currentLevelIndex >= 0 ? currentLevelIndex : 0];
  const nextLevel = currentLevelIndex >= 0 && currentLevelIndex < RATING_LEVELS.length - 1 
    ? RATING_LEVELS[currentLevelIndex + 1] 
    : null;

  const currentRankColorVar = `var(--rank-${
    platform === 'codeforces' 
      ? stats.rank.toLowerCase().replace(/ /g, '-') 
      : platform === 'atcoder' 
        ? `at-${stats.rank.toLowerCase()}` 
        : `lc-${stats.rank.toLowerCase()}`
  })`;
  const nextRankColorVar = nextLevel 
    ? `var(--rank-${
        platform === 'codeforces' 
          ? nextLevel.name.toLowerCase().replace(/ /g, '-') 
          : platform === 'atcoder' 
            ? `at-${nextLevel.name.toLowerCase()}` 
            : `lc-${nextLevel.name.toLowerCase()}`
      })` 
    : 'var(--primary)';

  let progressPercent = 0;
  if (nextLevel && stats.currentRating > 0) {
    const range = nextLevel.min - currentLevel.min;
    const progress = stats.currentRating - currentLevel.min;
    progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  // Action: filter contests by status "Revisit"
  const handleViewUpsolve = () => {
    setFilterState(prev => ({
      ...prev,
      userStatus: 'Revisit',
      searchTerm: '',
      division: 'All',
      untriedProblems: ''
    }));
    onNavigateToContests();
  };

  const handleViewCompleted = () => {
    setFilterState(prev => ({
      ...prev,
      userStatus: 'Complete',
      searchTerm: '',
      division: 'All',
      untriedProblems: ''
    }));
    onNavigateToContests();
  };

  const ratingHistory = stats.ratingHistory || [];
  const ratings = ratingHistory.map(h => h.newRating);
  
  // Hand-rolled Sparkline Path Calculation
  let sparklinePath = '';
  let sparklineAreaPath = '';
  const width = 140;
  const height = 50;
  const padding = 6;
  let points = [];
  let lastPoint = { x: width / 2, y: height / 2 };
  
  if (ratings.length > 0) {
    const minRating = Math.min(...ratings);
    const maxRating = Math.max(...ratings);
    const ratingRange = maxRating - minRating;
    
    points = ratings.map((val, index) => {
      const x = ratings.length > 1 
        ? padding + (index / (ratings.length - 1)) * (width - 2 * padding)
        : width / 2;
      const y = ratingRange > 0
        ? height - padding - ((val - minRating) / ratingRange) * (height - 2 * padding)
        : height / 2;
      return { x, y };
    });
    
    sparklinePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    if (points.length > 0) {
      sparklineAreaPath = `${sparklinePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
      lastPoint = points[points.length - 1];
    }
  }

  return (
    <div className="container animate-fade-in" style={styles.dashboardContainer}>
      
      {/* Redesigned Hero Section */}
      <div className="glass-card hero-banner-container">
        {/* Left Column: Hero Rating Display */}
        <div className="hero-rating-box">
          <span className="hero-rating-label">Current Rating</span>
          <h1 className={`hero-rating-value font-mono ${rankClass}`} style={{ margin: 0 }}>
            {stats.currentRating || 'Unrated'}
          </h1>
          <span className={`badge ${rankClass}-bg`} style={{ ...styles.rankBadge, backgroundColor: getRankBgColor(stats.rank, platform) }}>
            {stats.rank}
          </span>
        </div>
 
        {/* Center Column: Visual Rating Sparkline */}
        <div className="hero-sparkline-box">
          <span className="hero-sparkline-label">Rating Sparkline</span>
          {ratings.length > 1 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <svg width={width} height={height} style={{ overflow: 'visible' }}>
                <defs>
                  <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={currentRankColorVar} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={currentRankColorVar} stopOpacity="0.00" />
                  </linearGradient>
                </defs>
                <path d={sparklineAreaPath} fill="url(#sparkline-grad)" />
                <path 
                  d={sparklinePath} 
                  fill="none" 
                  stroke={currentRankColorVar} 
                  strokeWidth="2.5" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
                <circle 
                  cx={lastPoint.x} 
                  cy={lastPoint.y} 
                  r="4" 
                  fill={currentRankColorVar} 
                />
              </svg>
              <span className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                {ratings.length} contests
              </span>
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
              No contest history found
            </div>
          )}
        </div>
 
        {/* Right Column: Milestone Tracker */}
        {stats.currentRating > 0 && nextLevel ? (
          <div className="hero-milestone-box">
            <div style={styles.milestoneHeader}>
              <span style={styles.milestoneLabel}>Progress to {nextLevel.name}</span>
              <span className="font-mono" style={styles.milestoneVal}>
                {stats.currentRating} / {nextLevel.min} ({progressPercent}%)
              </span>
            </div>
            <div style={styles.progressBarBg}>
              <div 
                style={{ 
                  ...styles.progressBarFill, 
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, ${currentRankColorVar}, ${nextRankColorVar})` 
                }} 
              />
            </div>
          </div>
        ) : (
          <div className="hero-milestone-box" style={{ justifyContent: 'center' }}>
            <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
              Milestone unavailable (unrated user)
            </span>
          </div>
        )}
      </div>

      {/* Redesigned Lighter Secondary Stats Row */}
      <div className="glass-card secondary-stats-row">
        {/* Max Rating */}
        <div className="secondary-stat-item">
          <span className="secondary-stat-label">Maximum Rating</span>
          <span className={`secondary-stat-value font-mono ${maxRankClass}`} style={{ margin: '4px 0' }}>
            {stats.maxRating || '0'}
          </span>
          <span className={`secondary-stat-badge ${maxRankClass}-bg`} style={{ backgroundColor: getRankBgColor(stats.maxRank, platform) }}>
            Max: {stats.maxRank}
          </span>
        </div>

        <div className="secondary-divider"></div>

        {/* Problems Solved */}
        <div className="secondary-stat-item">
          <span className="secondary-stat-label">Problems Solved</span>
          <span className="secondary-stat-value font-mono" style={{ color: 'var(--success)', margin: '4px 0' }}>
            {stats.totalUniqueSolved || '0'}
          </span>
          <span className="badge badge-success" style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>
            Accepted
          </span>
        </div>

        <div className="secondary-divider"></div>

        {/* Participation Stats or LeetCode Solved Breakdown */}
        {platform === 'leetcode' ? (
          <div className="secondary-stat-item" style={{ flex: 1.5 }}>
            <span className="secondary-stat-label">Solved Breakdown</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px', width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: '700', color: '#00b8a3', lineHeight: 1.1 }}>
                  {stats.solvedBreakdown?.easy || 0}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Easy</span>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ffc01e', lineHeight: 1.1 }}>
                  {stats.solvedBreakdown?.medium || 0}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Medium</span>
              </div>
              <div style={{ width: '1px', height: '24px', background: 'var(--border-color)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <span className="font-mono" style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ef4743', lineHeight: 1.1 }}>
                  {stats.solvedBreakdown?.hard || 0}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Hard</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="secondary-stat-item">
            <span className="secondary-stat-label">Participation</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
                  {stats.totalOfficial || '0'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Official</span>
              </div>
              <div style={{ width: '1px', height: '28px', background: 'var(--border-color)' }}></div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span className="font-mono" style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-text-primary)', lineHeight: 1.1 }}>
                  {stats.totalVirtual || '0'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>Virtual</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Progress Cards */}
      <div style={styles.twoColumnGrid}>
        {/* Upsolving Tracker */}
        <div className="glass-card" style={styles.trackerCard}>
          <div style={styles.trackerHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={22} color="var(--warning)" />
              <h3 style={styles.trackerTitle}>Upsolving Queue</h3>
            </div>
            <span className="badge badge-warning font-mono" style={styles.queueCount}>
              {stats.needUpsolvingContests} Contests
            </span>
          </div>
          
          <p style={styles.trackerDesc}>
            Contests you have marked as <strong>Need to Upsolve</strong> or <strong>Upsolving</strong>. Tackle these to improve your skills!
          </p>

          <div style={styles.actionContainer}>
            <button 
              className="btn btn-primary" 
              style={{ ...styles.actionBtn, background: 'var(--warning)', borderColor: 'rgba(245, 158, 11, 0.4)' }}
              onClick={handleViewUpsolve}
            >
              Open Upsolving List
            </button>
          </div>
        </div>

        {/* Completed Tracker */}
        <div className="glass-card" style={styles.trackerCard}>
          <div style={styles.trackerHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={22} color="var(--success)" />
              <h3 style={styles.trackerTitle}>Completed Rounds</h3>
            </div>
            <span className="badge badge-success font-mono" style={styles.queueCount}>
              {stats.completedContests} Contests
            </span>
          </div>

          <p style={styles.trackerDesc}>
            Contests where you have completed all goals and upsolved target problems. Keep up the excellent work!
          </p>

          <div style={styles.actionContainer}>
            <button 
              className="btn btn-primary" 
              style={{ ...styles.actionBtn, background: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.4)' }}
              onClick={handleViewCompleted}
            >
              Open Completed List
            </button>
          </div>
        </div>
      </div>

      {/* Recent Contests status list */}
      <div className="glass-card" style={styles.recentSection}>
        <div style={styles.recentHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bookmark size={20} color="var(--primary)" />
            <h3 style={styles.recentTitle}>Your Recent Tracked Contests</h3>
          </div>
          <button className="btn btn-secondary" onClick={onNavigateToContests}>
            View All Contests
          </button>
        </div>

        {recentContests.length === 0 ? (
          <div style={styles.emptyRecent}>
            <p style={styles.emptyRecentText}>
              No contests tracked in localStorage yet. Head over to the <strong>Contests</strong> tab to start planning and marking statuses!
            </p>
          </div>
        ) : (
          <div style={styles.recentList}>
            {recentContests.map(c => (
              <div key={c.id} style={styles.recentRow}>
                <div style={styles.recentRowNameSection}>
                  <h4 style={styles.recentRowName}>{c.name}</h4>
                  <span className="font-mono" style={styles.recentRowDate}>ID: {c.id}</span>
                </div>
                <div style={styles.recentRowBadges}>
                  <span className={`badge ${getStatusBadgeClass(c.status)}`}>
                    {c.status}
                  </span>
                  {c.favourite && (
                    <span className="badge badge-danger" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--favourite)' }}>
                      ★ Favourite
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Utility to get status colors
function getStatusBadgeClass(status) {
  switch (status) {
    case 'Plan to Attend': return 'badge-info';
    case 'Attended': return 'badge-primary';
    case 'Need to Upsolve': return 'badge-danger';
    case 'Upsolving': return 'badge-warning';
    case 'Completed': return 'badge-success';
    case 'Skipped': return 'badge-neutral';
    case 'Favourite': return 'badge-danger';
    default: return 'badge-neutral';
  }
}

// Map ranks to hex colors using CSS custom properties
function getRankColorHex(rank = '', platform = 'codeforces') {
  const r = rank.toLowerCase().replace(/ /g, '-');
  if (platform === 'atcoder') {
    return `var(--rank-at-${r})`;
  }
  if (platform === 'leetcode') {
    return `var(--rank-lc-${r})`;
  }
  if (r.includes('tourist')) return 'var(--rank-legendary)';
  return `var(--rank-${r})`;
}

function getRankBgColor(rank = '', platform = 'codeforces') {
  const r = rank.toLowerCase().replace(/ /g, '-');
  if (platform === 'atcoder') {
    return `var(--rank-at-${r}-bg)`;
  }
  if (platform === 'leetcode') {
    return `var(--rank-lc-${r}-bg)`;
  }
  if (r.includes('tourist')) return 'var(--rank-legendary-bg)';
  return `var(--rank-${r}-bg)`;
}

const styles = {
  dashboardContainer: {
    paddingTop: '28px',
    paddingBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  milestoneHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
  milestoneLabel: {
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
  },
  milestoneVal: {
    color: 'var(--color-text-primary)',
    fontWeight: '600',
  },
  progressBarBg: {
    height: '8px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '10px',
    transition: 'width 0.8s ease-out',
  },
  rankBadge: {
    fontSize: '0.75rem',
    textTransform: 'capitalize',
    padding: '3px 8px',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '20px',
  },
  trackerCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    textAlign: 'left',
    padding: '28px',
  },
  trackerHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trackerTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: 0,
  },
  queueCount: {
    fontSize: '0.8rem',
    padding: '4px 10px',
  },
  trackerDesc: {
    fontSize: '0.88rem',
    color: 'var(--color-text-secondary)',
    lineHeight: 1.5,
    margin: 0,
    flex: 1,
  },
  actionContainer: {
    marginTop: '8px',
  },
  actionBtn: {
    width: '100%',
    padding: '12px',
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--color-text-primary)',
  },
  recentSection: {
    textAlign: 'left',
    padding: '28px',
  },
  recentHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  recentTitle: {
    fontSize: '1.2rem',
    fontWeight: '700',
    margin: 0,
  },
  emptyRecent: {
    padding: '30px 16px',
    textAlign: 'center',
    border: '1px dashed var(--border-color)',
    borderRadius: '12px',
  },
  emptyRecentText: {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  recentRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '14px 18px',
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid var(--border-color)',
    borderRadius: '10px',
    transition: 'all var(--transition-fast)',
    flexWrap: 'wrap',
    gap: '12px',
  },
  recentRowNameSection: {
    flex: '1 1 300px',
  },
  recentRowName: {
    fontSize: '0.92rem',
    fontWeight: '600',
    margin: '0 0 2px 0',
  },
  recentRowDate: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
  },
  recentRowBadges: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  }
};
