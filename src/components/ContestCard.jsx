import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  Star, 
  Notebook, 
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
  
  // Local states for note editing and accordion expansion
  const [note, setNote] = useState(userData.note || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  
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

  // Toggle card expansion (show/hide notes) unless clicking interactive elements
  const handleCardClick = (e) => {
    const tag = e.target.tagName.toLowerCase();
    if (
      tag === 'select' || 
      tag === 'option' || 
      tag === 'button' || 
      tag === 'a' || 
      tag === 'textarea' || 
      e.target.closest('button') || 
      e.target.closest('a')
    ) {
      return;
    }
    setIsExpanded(!isExpanded);
  };

  const division = getContestDivision(name);

  // Status lists
  const STATUS_OPTIONS = [
    'None',
    'Done',
    'Partial Done',
    'Not Done'
  ];

  // Helper to resolve problem indices based on division
  const getProblemIndices = (div) => {
    if (div === 'Div. 4') return ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    if (div === 'Div. 3') return ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    return ['A', 'B', 'C', 'D', 'E', 'F'];
  };

  const problemIndices = getProblemIndices(division);
  const solvedProblems = submissionData.solvedProblems || [];
  const attemptedProblems = submissionData.attemptedProblems || [];

  // Track state is active if any user activity exists
  const isTracked = 
    (userData.status && userData.status !== 'None' && userData.status !== '') ||
    (userData.note && userData.note.trim() !== '') ||
    userData.favourite ||
    (submissionData.totalAttempted && submissionData.totalAttempted > 0);

  return (
    <div 
      className={`glass-card animate-fade-in ${userData.favourite ? 'favourite-card' : ''} ${isTracked ? 'tracked-card' : ''}`} 
      style={{ ...styles.card, cursor: 'pointer' }}
      onClick={handleCardClick}
    >
      {/* Card Header: Title & Star Button */}
      <div style={styles.cardHeader}>
        <div style={styles.titleSection}>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span className={`badge ${getDivisionBadgeClass(division)}`} style={styles.divBadge}>
              {division}
            </span>
            {phase === 'BEFORE' && (
              <span className="badge" style={{ ...styles.divBadge, backgroundColor: 'rgba(251, 191, 36, 0.12)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.22)' }}>
                Upcoming
              </span>
            )}
            {phase === 'CODING' && (
              <span className="badge" style={{ ...styles.divBadge, backgroundColor: 'rgba(248, 113, 113, 0.12)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.22)' }}>
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
              href={phase === 'BEFORE' ? 'https://codeforces.com/contests' : `https://codeforces.com/contest/${id}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={styles.cfLink}
            >
              {phase === 'BEFORE' ? 'Register / View Schedule' : 'Open Codeforces'}
              <ExternalLink size={12} style={{ marginLeft: 3 }} />
            </a>
          </div>
        </div>
        
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

      {/* Middle row: Problems row & Track status selector */}
      <div style={styles.middleRow}>
        <div style={styles.problemsListContainer}>
          {problemIndices.map(idx => {
            const isSolved = solvedProblems.includes(idx) || 
                             solvedProblems.some(p => p.toUpperCase() === idx.toUpperCase());
            const isAttempted = attemptedProblems.includes(idx) || 
                                attemptedProblems.some(p => p.toUpperCase().startsWith(idx.toUpperCase()));
            
            let badgeClass = "problem-badge problem-badge-default";
            let title = `Problem ${idx} (Not Tried)`;
            if (isSolved) {
              badgeClass = "problem-badge problem-badge-solved";
              title = `Problem ${idx} (Solved)`;
            } else if (isAttempted) {
              badgeClass = "problem-badge problem-badge-attempted";
              title = `Problem ${idx} (Attempted but not solved)`;
            }

            return (
              <a 
                key={idx}
                href={phase === 'BEFORE' ? 'https://codeforces.com/contests' : `https://codeforces.com/contest/${id}/problem/${idx}`}
                target="_blank"
                rel="noopener noreferrer"
                className={badgeClass}
                title={title}
              >
                {idx}
              </a>
            );
          })}
        </div>

        <div style={styles.statusContainer}>
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
      </div>

      {/* Accordion Expandable Notes Row */}
      {isExpanded && (
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
      )}
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
  },
  middleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '14px',
    marginTop: 'auto',
    flexWrap: 'wrap',
  },
  problemsListContainer: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    flex: 1,
  },
  statusContainer: {
    minWidth: '130px',
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
    marginTop: '4px',
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
  }
};
