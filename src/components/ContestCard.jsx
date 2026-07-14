import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  Star, 
  CheckSquare, 
  Clock, 
  Notebook, 
  Activity, 
  CheckCircle,
  HelpCircle,
  Save
} from 'lucide-react';
import { formatUnixDate, getContestDivision } from '../utils/helpers';

export default function ContestCard({ 
  contest, 
  userData = {}, 
  submissionData = {}, 
  onStatusChange, 
  onNoteChange, 
  onFavouriteToggle 
}) {
  const { id, name, startTimeSeconds, durationSeconds, phase } = contest;
  
  // Local states for note editing
  const [note, setNote] = useState(userData.note || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Sync note from props when it changes externally
  useEffect(() => {
    setNote(userData.note || '');
  }, [userData.note]);

  // Handle note change and trigger auto-saving after a delay
  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNote(val);
    setIsSaved(false);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onNoteChange(id, val);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }, 1000);
  };

  const handleManualSave = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    onNoteChange(id, note);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  // Extract statistics
  const participation = submissionData.participation || 'NONE';
  const solvedDuring = submissionData.solvedDuring || 0;
  const solvedAfter = submissionData.solvedAfter || 0;
  const totalSolved = submissionData.totalSolved || 0;
  const totalAttempted = submissionData.totalAttempted || 0;

  const division = getContestDivision(name);

  // Status lists
  const STATUS_OPTIONS = [
    'None',
    'Plan to Attend',
    'Attended',
    'Need to Upsolve',
    'Upsolving',
    'Completed',
    'Favourite',
    'Skipped'
  ];

  const isTracked = userData.status && userData.status !== '';

  return (
    <div className={`glass-card animate-fade-in ${userData.favourite ? 'favourite-card' : ''} ${isTracked ? 'tracked-card' : ''}`} style={styles.card}>
      {/* Card Header: Title and Favourite Icon */}
      <div style={styles.cardHeader}>
        <div style={styles.titleSection}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span className={`badge ${getDivisionBadgeClass(division)}`} style={styles.divBadge}>
              {division}
            </span>
            {phase === 'BEFORE' && (
              <span className="badge" style={{ ...styles.divBadge, backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                Upcoming
              </span>
            )}
            {phase === 'CODING' && (
              <span className="badge" style={{ ...styles.divBadge, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                Live
              </span>
            )}
          </div>
          <h3 style={styles.contestName} title={name}>
            {name}
          </h3>
          <div style={styles.dateAndLink}>
            <span style={styles.dateText}>{formatUnixDate(startTimeSeconds)}</span>
            <span style={styles.bullet}>•</span>
            <span style={styles.durationText}>{formatDuration(durationSeconds)}</span>
            <span style={styles.bullet}>•</span>
            <a 
              href={`https://codeforces.com/contest/${id}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.cfLink}
            >
              Open Codeforces
              <ExternalLink size={12} style={{ marginLeft: 3 }} />
            </a>
          </div>
        </div>
        
        {/* Star Button */}
        <button 
          onClick={() => onFavouriteToggle(id)} 
          style={{ 
            ...styles.favBtn, 
            color: userData.favourite ? 'var(--favourite)' : 'var(--color-text-muted)' 
          }}
          title={userData.favourite ? 'Remove from Favourites' : 'Add to Favourites'}
        >
          <Star size={20} fill={userData.favourite ? 'var(--favourite)' : 'transparent'} />
        </button>
      </div>

      {/* Card Body Grid: Solved Stats & Controls */}
      <div className="contest-card-body-grid">
        
        {/* API Statistics Column */}
        <div style={styles.statsColumn}>
          <div style={styles.statsSectionHeader}>
            <Activity size={14} color="var(--primary)" />
            <span style={styles.sectionHeaderTitle}>Activity & Submissions</span>
          </div>

          <div style={styles.participationContainer}>
            <span style={styles.statsLabel}>Your Participation:</span>
            <span className={`badge ${getParticipationBadgeClass(participation)}`}>
              {participation === 'NONE' ? 'Unattempted' : participation}
            </span>
          </div>

          {totalAttempted > 0 ? (
            <div style={styles.solvedStatsGrid}>
              <div style={styles.solvedStatItem}>
                <span style={styles.statSubVal}>{solvedDuring}</span>
                <span style={styles.statSubLabel}>Solved During</span>
              </div>
              <div style={styles.solvedStatItem}>
                <span style={styles.statSubVal}>{solvedAfter}</span>
                <span style={styles.statSubLabel}>Solved After</span>
              </div>
              <div style={styles.solvedStatItem}>
                <span style={{ ...styles.statSubVal, color: 'var(--success)' }}>{totalSolved} / {totalAttempted}</span>
                <span style={styles.statSubLabel}>Total Solved/Attempted</span>
              </div>
            </div>
          ) : (
            <div style={styles.noSubmissions}>
              <HelpCircle size={16} color="var(--color-text-muted)" />
              <span>No submissions found for this round.</span>
            </div>
          )}
        </div>

        {/* User Interactive States Column */}
        <div style={styles.controlsColumn}>
          <div style={styles.statsSectionHeader}>
            <CheckSquare size={14} color="var(--info)" />
            <span style={styles.sectionHeaderTitle}>Track Status</span>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <select 
              className="form-control form-select"
              style={styles.statusSelect}
              value={userData.status || 'None'}
              onChange={(e) => onStatusChange(id, e.target.value === 'None' ? '' : e.target.value)}
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>

          {/* Quick badge representation of status */}
          {userData.status && (
            <div style={{ marginTop: '8px' }}>
              <span className={`badge ${getStatusBadgeClass(userData.status)}`}>
                {userData.status}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Personal Notes Row */}
      <div style={styles.notesRow}>
        <div style={styles.notesHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Notebook size={14} color="var(--color-text-secondary)" />
            <span style={styles.notesTitle}>Personal Notes</span>
          </div>
          <div style={styles.saveStatus}>
            {isSaved && <span style={styles.savedBadge}>Saved</span>}
            <button 
              onClick={handleManualSave} 
              style={styles.saveIconBtn} 
              title="Save Note Now"
            >
              <Save size={12} />
            </button>
          </div>
        </div>
        <textarea
          style={styles.notesTextarea}
          placeholder="e.g. Upsolved problem C, need to implement segment tree. Loved problem B!"
          value={note}
          onChange={handleNoteChange}
          onFocus={() => setIsEditingNote(true)}
          onBlur={() => setIsEditingNote(false)}
          rows={2}
        />
      </div>
    </div>
  );
}

// Helpers
function getDivisionBadgeClass(division) {
  switch (division) {
    case 'Div. 1': return 'badge-danger';
    case 'Div. 2': return 'badge-primary';
    case 'Div. 3': return 'badge-warning';
    case 'Div. 4': return 'badge-success';
    case 'Educational': return 'badge-info';
    case 'Global Round': return 'badge-primary';
    default: return 'badge-neutral';
  }
}

function getParticipationBadgeClass(participation) {
  switch (participation) {
    case 'OFFICIAL': return 'badge-success';
    case 'VIRTUAL': return 'badge-info';
    case 'PRACTICE': return 'badge-warning';
    default: return 'badge-neutral';
  }
}

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

function formatDuration(seconds) {
  if (!seconds) return 'N/A';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hrs}h${mins > 0 ? ` ${mins}m` : ''}`;
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: 'var(--bg-card)',
    borderColor: 'var(--border-color)',
    padding: '20px',
    textAlign: 'left',
    position: 'relative',
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  titleSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-start',
    flex: 1,
    overflow: 'hidden',
  },
  divBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    padding: '2px 8px',
  },
  contestName: {
    fontSize: '1.05rem',
    fontWeight: '600',
    margin: '0 0 6px 0',
    lineHeight: 1.3,
    color: 'var(--color-text-primary)',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    width: '100%',
    minHeight: '2.6em',
  },
  dateAndLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.75rem',
    color: 'var(--color-text-muted)',
    flexWrap: 'wrap',
  },
  dateText: {},
  durationText: {},
  bullet: {
    opacity: 0.5,
  },
  cfLink: {
    display: 'inline-flex',
    alignItems: 'center',
    fontWeight: '500',
  },
  favBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
    outline: 'none',
    ':hover': {
      transform: 'scale(1.1)',
    }
  },

  statsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  statsSectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '4px',
  },
  sectionHeaderTitle: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  participationContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.8rem',
  },
  statsLabel: {
    color: 'var(--color-text-secondary)',
  },
  solvedStatsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '8px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
  },
  solvedStatItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  statSubVal: {
    fontSize: '0.9rem',
    fontWeight: '700',
    color: '#fff',
  },
  statSubLabel: {
    fontSize: '0.62rem',
    color: 'var(--color-text-muted)',
    marginTop: '2px',
  },
  noSubmissions: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '0.78rem',
    color: 'var(--color-text-muted)',
    background: 'rgba(255, 255, 255, 0.01)',
    padding: '8px 12px',
    borderRadius: '8px',
    border: '1px dashed var(--border-color)',
  },
  controlsColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  statusSelect: {
    padding: '8px 12px',
    fontSize: '0.85rem',
    height: '36px',
  },
  notesRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '14px',
    marginTop: 'auto',
  },
  notesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notesTitle: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
  },
  saveStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  savedBadge: {
    fontSize: '0.65rem',
    color: 'var(--success)',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  saveIconBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-muted)',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'color var(--transition-fast)',
    ':hover': {
      color: '#fff',
    }
  },
  notesTextarea: {
    width: '100%',
    background: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--color-text-primary)',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '0.82rem',
    fontFamily: 'var(--font-sans)',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color var(--transition-fast)',
    ':focus': {
      borderColor: 'var(--primary)',
    }
  }
};
