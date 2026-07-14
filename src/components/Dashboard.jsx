import React from 'react';
import { 
  Trophy, 
  Award, 
  Calendar, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { getRankColorClass } from '../utils/helpers';

export default function Dashboard({ 
  stats, 
  recentContests = [], 
  onNavigateToContests,
  setFilterState
}) {
  const rankClass = getRankColorClass(stats.rank);
  const maxRankClass = getRankColorClass(stats.maxRank);

  // Calculate rating progress to next level
  const RATING_LEVELS = [
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

  const currentLevelIndex = RATING_LEVELS.findIndex(
    level => stats.currentRating >= level.min && stats.currentRating <= level.max
  );

  const currentLevel = RATING_LEVELS[currentLevelIndex >= 0 ? currentLevelIndex : 0];
  const nextLevel = currentLevelIndex >= 0 && currentLevelIndex < RATING_LEVELS.length - 1 
    ? RATING_LEVELS[currentLevelIndex + 1] 
    : null;

  let progressPercent = 0;
  if (nextLevel && stats.currentRating > 0) {
    const range = nextLevel.min - currentLevel.min;
    const progress = stats.currentRating - currentLevel.min;
    progressPercent = Math.min(100, Math.max(0, Math.round((progress / range) * 100)));
  }

  // Action: filter contests by status "Need to Upsolve" or "Upsolving"
  const handleViewUpsolve = () => {
    setFilterState(prev => ({
      ...prev,
      userStatus: 'Need to Upsolve', // or show all needing upsolve
      searchTerm: '',
      division: 'All',
      year: 'All',
      participation: 'All'
    }));
    onNavigateToContests();
  };

  const handleViewCompleted = () => {
    setFilterState(prev => ({
      ...prev,
      userStatus: 'Completed',
      searchTerm: '',
      division: 'All',
      year: 'All',
      participation: 'All'
    }));
    onNavigateToContests();
  };

  return (
    <div className="container animate-fade-in" style={styles.dashboardContainer}>
      {/* Welcome Banner */}
      <div className="glass-card" style={styles.welcomeBanner}>
        <div style={styles.welcomeInfo}>
          <div style={styles.sparkleIcon}>
            <Sparkles size={24} color="var(--info)" />
          </div>
          <div>
            <h2 style={styles.welcomeTitle}>Dashboard Overview</h2>
            <p style={styles.welcomeSub}>
              Track your ratings, milestones, and contest upsolving progress. Keep pushing your limits!
            </p>
          </div>
        </div>
        {stats.currentRating > 0 && nextLevel && (
          <div style={styles.milestoneTracker}>
            <div style={styles.milestoneHeader}>
              <span style={styles.milestoneLabel}>Progress to {nextLevel.name}</span>
              <span style={styles.milestoneVal}>{stats.currentRating} / {nextLevel.min} ({progressPercent}%)</span>
            </div>
            <div style={styles.progressBarBg}>
              <div 
                style={{ 
                  ...styles.progressBarFill, 
                  width: `${progressPercent}%`,
                  background: `linear-gradient(90deg, var(--primary), ${getRankColorHex(nextLevel.name)})` 
                }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div style={styles.statsGrid}>
        {/* Rating Card */}
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <Trophy size={20} color="var(--warning)" />
            <span style={styles.cardLabel}>Current Rating</span>
          </div>
          <div style={styles.ratingValueBox}>
            <span className={rankClass} style={styles.largeValue}>
              {stats.currentRating || 'Unrated'}
            </span>
            <span className={`badge ${rankClass}-bg`} style={{ ...styles.rankBadge, backgroundColor: getRankBgColor(stats.rank) }}>
              {stats.rank}
            </span>
          </div>
        </div>

        {/* Max Rating Card */}
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <Award size={20} color="var(--favourite)" />
            <span style={styles.cardLabel}>Maximum Rating</span>
          </div>
          <div style={styles.ratingValueBox}>
            <span className={maxRankClass} style={styles.largeValue}>
              {stats.maxRating || 'Unrated'}
            </span>
            <span className={`badge ${maxRankClass}-bg`} style={{ ...styles.rankBadge, backgroundColor: getRankBgColor(stats.maxRank) }}>
              Max: {stats.maxRank}
            </span>
          </div>
        </div>

        {/* Contests Count Card */}
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <Calendar size={20} color="var(--primary)" />
            <span style={styles.cardLabel}>Participation Stats</span>
          </div>
          <div style={styles.statsInlineBox}>
            <div style={styles.subStat}>
              <span style={styles.mediumValue}>{stats.totalOfficial}</span>
              <span style={styles.subLabel}>Official Rounds</span>
            </div>
            <div style={styles.verticalDivider}></div>
            <div style={styles.subStat}>
              <span style={styles.mediumValue}>{stats.totalVirtual}</span>
              <span style={styles.subLabel}>Virtual Rounds</span>
            </div>
          </div>
        </div>

        {/* Solved Problems Card */}
        <div className="glass-card" style={styles.statCard}>
          <div style={styles.cardHeader}>
            <Flame size={20} color="var(--success)" />
            <span style={styles.cardLabel}>Unique Problems Solved</span>
          </div>
          <div style={styles.ratingValueBox}>
            <span style={{ ...styles.largeValue, color: 'var(--success)' }}>
              {stats.totalUniqueSolved}
            </span>
            <span className="badge badge-success" style={styles.rankBadge}>
              Accepted Tasks
            </span>
          </div>
        </div>
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
            <span className="badge badge-warning" style={styles.queueCount}>
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
            <span className="badge badge-success" style={styles.queueCount}>
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
                  <span style={styles.recentRowDate}>ID: {c.id}</span>
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

// Map ranks to hex colors
function getRankColorHex(rank = '') {
  const r = rank.toLowerCase();
  if (r.includes('legendary') || r.includes('tourist')) return '#ff3333';
  if (r.includes('grandmaster')) return '#ff7777';
  if (r.includes('master')) return '#ffbb55';
  if (r.includes('candidate')) return '#aa88ff';
  if (r.includes('expert')) return '#3377ff';
  if (r.includes('specialist')) return '#22abbb';
  if (r.includes('pupil')) return '#00aa00';
  if (r.includes('newbie')) return '#999999';
  return 'var(--primary)';
}

function getRankBgColor(rank = '') {
  const r = rank.toLowerCase();
  if (r.includes('legendary') || r.includes('grandmaster')) return 'rgba(255, 51, 51, 0.1)';
  if (r.includes('master')) return 'rgba(255, 187, 85, 0.1)';
  if (r.includes('candidate')) return 'rgba(170, 136, 255, 0.1)';
  if (r.includes('expert')) return 'rgba(51, 119, 255, 0.1)';
  if (r.includes('specialist')) return 'rgba(34, 171, 187, 0.1)';
  if (r.includes('pupil')) return 'rgba(0, 170, 0, 0.1)';
  if (r.includes('newbie')) return 'rgba(153, 153, 153, 0.1)';
  return 'rgba(255, 255, 255, 0.05)';
}

const styles = {
  dashboardContainer: {
    paddingTop: '28px',
    paddingBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  welcomeBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '24px',
    background: 'linear-gradient(135deg, rgba(22, 28, 45, 0.8), rgba(15, 20, 35, 0.9))',
    borderColor: 'rgba(99, 102, 241, 0.15)',
    padding: '30px',
  },
  welcomeInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flex: '1 1 300px',
    textAlign: 'left',
  },
  sparkleIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(6, 182, 212, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    margin: '0 0 4px 0',
  },
  welcomeSub: {
    color: 'var(--color-text-secondary)',
    fontSize: '0.88rem',
    margin: 0,
  },
  milestoneTracker: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: '1 1 300px',
    maxWidth: '450px',
    width: '100%',
    textAlign: 'left',
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
    color: '#fff',
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
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
  },
  statCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '24px',
    textAlign: 'left',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardLabel: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  ratingValueBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '6px',
    marginTop: '4px',
  },
  largeValue: {
    fontSize: '2.2rem',
    fontWeight: '800',
    lineHeight: 1,
    letterSpacing: '-1px',
  },
  rankBadge: {
    fontSize: '0.75rem',
    textTransform: 'capitalize',
    padding: '3px 8px',
  },
  statsInlineBox: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    gap: '16px',
    marginTop: '6px',
  },
  subStat: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  mediumValue: {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#fff',
    lineHeight: 1,
  },
  subLabel: {
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    marginTop: '6px',
  },
  verticalDivider: {
    width: '1px',
    height: '40px',
    background: 'var(--border-color)',
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
    color: '#fff',
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
