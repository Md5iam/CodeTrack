import React, { useState, useEffect, useRef } from 'react';
import { 
  ExternalLink, 
  Star, 
  Notebook, 
  Save,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { formatUnixDate, getContestDivision, getAtCoderDivision } from '../utils/helpers';

export default function ContestCard({ 
  contest, 
  userData = {}, 
  submissionData = {}, 
  onStatusChange, 
  onNoteChange, 
  onFavouriteToggle,
  onProblemOverrideChange = () => {},
  platform = 'codeforces'
}) {
  const { id, name, startTimeSeconds, durationSeconds, phase } = contest;
  
  // Local states for note editing, custom subproblem input, and accordion expansion
  const [note, setNote] = useState(userData.note || '');
  const [isSaved, setIsSaved] = useState(false);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [customProblem, setCustomProblem] = useState('');

  const handleSelectOverride = (problemIndex, val) => {
    onProblemOverrideChange(id, problemIndex, val);
  };
  
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



  const division = platform === 'codeforces' 
    ? getContestDivision(name) 
    : platform === 'atcoder' 
      ? getAtCoderDivision(id, name) 
      : 'LeetCode Contest';

  // Status lists
  const STATUS_OPTIONS = [
    'Not tried',
    'Complete',
    'Revisit'
  ];

  // Helper to resolve problem indices dynamically based on division, API contest problems, submissions, and overrides
  const getProblemIndices = (div) => {
    // If official problem data exists on contest object, use it as primary source!
    if (contest.problems && Array.isArray(contest.problems) && contest.problems.length > 0) {
      const officialSet = new Set(contest.problems.map(p => p.index.toUpperCase()).filter(Boolean));
      // Also merge any extra user overrides or submissions if custom subproblems were added
      (submissionData.solvedProblems || []).forEach(p => officialSet.add(p.toUpperCase()));
      (submissionData.attemptedProblems || []).forEach(p => officialSet.add(p.toUpperCase()));
      Object.keys(userData.problemOverrides || {}).forEach(p => officialSet.add(p.toUpperCase()));

      return Array.from(officialSet).sort((a, b) => 
        a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
      );
    }

    let base = [];
    if (platform === 'leetcode') {
      base = ['Q1', 'Q2', 'Q3', 'Q4'];
    } else if (platform === 'atcoder') {
      if (div === 'ABC (Beginner)') base = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      else base = ['A', 'B', 'C', 'D', 'E', 'F'];
    } else {
      if (div === 'Div. 4') base = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
      else if (div === 'Div. 3') base = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
      else base = ['A', 'B', 'C', 'D', 'E', 'F'];
    }

    const solvedList = submissionData.solvedProblems || [];
    const attemptedList = submissionData.attemptedProblems || [];
    const problemOverrides = userData.problemOverrides || {};

    // Collect all known problem indices from all sources
    const knownSet = new Set();
    solvedList.forEach(p => knownSet.add(p.toUpperCase()));
    attemptedList.forEach(p => knownSet.add(p.toUpperCase()));
    Object.keys(problemOverrides).forEach(p => knownSet.add(p.toUpperCase()));

    // Ensure paired subproblems (if D1 exists, ensure D2 exists; if D2 exists, ensure D1)
    Array.from(knownSet).forEach(k => {
      const match1 = k.match(/^([A-Z])1$/);
      if (match1) {
        knownSet.add(`${match1[1]}2`);
      }
      const match2 = k.match(/^([A-Z])2$/);
      if (match2) {
        knownSet.add(`${match2[1]}1`);
      }
    });

    if (knownSet.size === 0) {
      return base;
    }

    const result = [];
    const processedKnown = new Set();

    base.forEach(bIdx => {
      const bUpper = bIdx.toUpperCase();
      
      // Find all matching sub-indices like D1, D2 for D (excluding bare letter bUpper if sub-indices exist)
      const matchingSub = Array.from(knownSet).filter(k => {
        if (k === bUpper) return false;
        const pattern = new RegExp(`^${bUpper}[0-9a-zA-Z]+$`);
        return pattern.test(k);
      });

      if (matchingSub.length > 0) {
        matchingSub.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
        matchingSub.forEach(idx => {
          if (!processedKnown.has(idx)) {
            result.push(idx);
            processedKnown.add(idx);
          }
        });
        processedKnown.add(bUpper);
      } else if (knownSet.has(bUpper)) {
        result.push(bIdx);
        processedKnown.add(bUpper);
      } else {
        result.push(bIdx);
      }
    });

    // Append any extra known indices (e.g., G, H)
    const leftover = Array.from(knownSet)
      .filter(k => !processedKnown.has(k))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

    leftover.forEach(idx => result.push(idx));

    return result;
  };

  const problemIndices = getProblemIndices(division);
  const solvedProblems = submissionData.solvedProblems || [];
  const attemptedProblems = submissionData.attemptedProblems || [];
  const problemOverrides = userData.problemOverrides || {};
  const hasProblemOverrides = Object.keys(problemOverrides).length > 0;

  // Track state is active if any user activity exists
  const isTracked = 
    (userData.status && userData.status !== 'Not tried' && userData.status !== '') ||
    (userData.note && userData.note.trim() !== '') ||
    userData.favourite ||
    hasProblemOverrides ||
    (submissionData.totalAttempted && submissionData.totalAttempted > 0);

  const getStatusBorderColor = () => {
    if (phase === 'BEFORE') return 'var(--warning)';
    if (userData.status === 'Complete') return 'var(--success)';
    if (userData.status === 'Revisit') return 'var(--danger)';
    return 'var(--border-color)';
  };

  const getSolidBgColor = () => {
    const isLight = document.body.classList.contains('light-theme');
    if (userData.favourite) {
      return isLight ? '#fffbeb' : '#232018';
    }
    if (isTracked) {
      return isLight ? '#e6fcf5' : '#14251f';
    }
    return 'var(--bg-card-solid)';
  };

  const cardClassName = `glass-card animate-fade-in ${
    isExpanded 
      ? '' 
      : `${userData.favourite ? 'favourite-card' : ''} ${isTracked ? 'tracked-card' : ''}`
  }`;

  return (
    <div 
      className={cardClassName}
      style={{ 
        ...styles.card, 
        borderLeft: `4px solid ${getStatusBorderColor()}`,
        zIndex: isExpanded ? 200 : 1,
        ...(isExpanded ? { 
          borderBottomLeftRadius: 0, 
          borderBottomRightRadius: 0,
          background: getSolidBgColor(),
          borderColor: userData.favourite 
            ? 'rgba(251, 191, 36, 0.45)' 
            : isTracked 
              ? 'rgba(52, 211, 153, 0.45)' 
              : 'var(--border-color)',
          boxShadow: userData.favourite 
            ? '0 0 24px rgba(251, 191, 36, 0.12)' 
            : isTracked 
              ? '0 0 24px rgba(52, 211, 153, 0.12)' 
              : 'var(--shadow-md)'
        } : {})
      }}
    >
      {/* Top Row: Division Badges & Favorite Star Button */}
      <div style={styles.topHeaderRow}>
        <div style={styles.badgesWrapper}>
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
          {userData.status && userData.status !== 'None' && (
            <span className={`badge ${getStatusBadgeClass(userData.status)}`} style={styles.divBadge}>
              {userData.status}
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onFavouriteToggle(id);
            }} 
            style={{ 
              ...styles.favBtn, 
              color: userData.favourite ? 'var(--favourite)' : 'var(--color-text-muted)' 
            }}
            title={userData.favourite ? 'Remove from Favourites' : 'Add to Favourites'}
          >
            <Star size={16} fill={userData.favourite ? 'var(--favourite)' : 'transparent'} />
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="contest-card-expand-btn"
            style={styles.expandBtn}
            title={isExpanded ? 'Minimize notes and overrides' : 'Expand notes and overrides'}
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Main Info Section (Title & Metadata) */}
      <div style={styles.titleSection}>
        <h3 style={styles.contestName} title={name}>
          {name}
        </h3>
        <div style={styles.dateAndLink}>
          <span className="font-mono" style={styles.dateText}>{formatUnixDate(startTimeSeconds)}</span>
          <span style={styles.bullet}>•</span>
          <span className="font-mono" style={styles.durationText}>{formatDuration(durationSeconds)}</span>
          <span style={styles.bullet}>•</span>
          <a 
            href={platform === 'codeforces' 
              ? (phase === 'BEFORE' ? 'https://codeforces.com/contests' : `https://codeforces.com/contest/${id}`)
              : platform === 'atcoder'
                ? (phase === 'BEFORE' ? 'https://atcoder.jp/contests' : `https://atcoder.jp/contests/${id}`)
                : `https://leetcode.com/contest/${id}`
            } 
            target="_blank" 
            rel="noopener noreferrer" 
            style={styles.cfLink}
          >
            {platform === 'codeforces' 
              ? (phase === 'BEFORE' ? 'Register / View Schedule' : 'Open Codeforces')
              : platform === 'atcoder'
                ? (phase === 'BEFORE' ? 'Register / View Schedule' : 'Open AtCoder')
                : 'Open LeetCode'
            }
            <ExternalLink size={12} style={{ marginLeft: 3 }} />
          </a>
        </div>
      </div>

      {/* Middle row: Problems row & Track status selector */}
      <div style={styles.middleRow}>
        <div style={styles.problemsListContainer}>
          {problemIndices.map(idx => {
            const problemOverrides = userData.problemOverrides || {};
            const override = problemOverrides[idx]; // 'solved', 'attempted', or undefined
            
            const idxUpper = idx.toUpperCase();
            let isSolved = solvedProblems.some(p => {
              const pUpper = p.toUpperCase();
              if (pUpper === idxUpper) return true;
              if (pUpper.startsWith(idxUpper) && !problemIndices.map(x => x.toUpperCase()).includes(pUpper)) return true;
              return false;
            });

            let isAttempted = false;
            if (!isSolved) {
              isAttempted = attemptedProblems.some(p => {
                const pUpper = p.toUpperCase();
                if (pUpper === idxUpper) return true;
                if (pUpper.startsWith(idxUpper) && !problemIndices.map(x => x.toUpperCase()).includes(pUpper)) return true;
                return false;
              });
            }
            
            if (override === 'solved') {
              isSolved = true;
              isAttempted = false;
            } else if (override === 'attempted') {
              isSolved = false;
              isAttempted = true;
            }

            const problemMeta = contest.problems?.find(p => p.index === idx);
            let tooltip = `Problem ${idx} (Not Tried)`;
            let hrefUrl = platform === 'codeforces'
              ? (phase === 'BEFORE' ? 'https://codeforces.com/contests' : `https://codeforces.com/contest/${id}/problem/${idx}`)
              : platform === 'atcoder'
                ? (phase === 'BEFORE' ? 'https://atcoder.jp/contests' : `https://atcoder.jp/contests/${id}/tasks/${id}_${idx.toLowerCase()}`)
                : (problemMeta?.titleSlug ? `https://leetcode.com/problems/${problemMeta.titleSlug}` : `https://leetcode.com/contest/${id}`);

            if (problemMeta) {
              tooltip = `${idx}: ${problemMeta.title}${problemMeta.rating ? ` (Rating: ${problemMeta.rating})` : ''} - Not Tried`;
            }

            let badgeClass = "problem-badge problem-badge-default font-mono";
            if (override) {
              if (override === 'solved') {
                badgeClass = "problem-badge problem-badge-solved font-mono";
                tooltip = problemMeta 
                  ? `${idx}: ${problemMeta.title}${problemMeta.rating ? ` (Rating: ${problemMeta.rating})` : ''} - Marked Solved`
                  : `Problem ${idx} (Marked Solved)`;
              } else {
                badgeClass = "problem-badge problem-badge-attempted font-mono";
                tooltip = problemMeta 
                  ? `${idx}: ${problemMeta.title}${problemMeta.rating ? ` (Rating: ${problemMeta.rating})` : ''} - Marked Attempted`
                  : `Problem ${idx} (Marked Attempted)`;
              }
            } else if (isSolved) {
              badgeClass = "problem-badge problem-badge-solved font-mono";
              tooltip = problemMeta 
                ? `${idx}: ${problemMeta.title}${problemMeta.rating ? ` (Rating: ${problemMeta.rating})` : ''} - Solved`
                : `Problem ${idx} (Solved)`;
            } else if (isAttempted) {
              badgeClass = "problem-badge problem-badge-attempted font-mono";
              tooltip = problemMeta 
                ? `${idx}: ${problemMeta.title}${problemMeta.rating ? ` (Rating: ${problemMeta.rating})` : ''} - Attempted`
                : `Problem ${idx} (Attempted)`;
            }

            return (
              <a 
                key={idx}
                href={hrefUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={badgeClass}
                title={tooltip}
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
            value={userData.status || 'Not tried'}
            onChange={(e) => onStatusChange(id, e.target.value === 'Not tried' ? '' : e.target.value)}
          >
            {STATUS_OPTIONS.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Accordion Expandable Notes Row */}
      {isExpanded && (
        <div 
          style={{
            ...styles.notesRow,
            border: `1px solid ${
              userData.favourite 
                ? 'rgba(251, 191, 36, 0.45)' 
                : isTracked 
                  ? 'rgba(52, 211, 153, 0.45)' 
                  : 'var(--border-color)'
            }`,
            borderTop: 'none',
            background: getSolidBgColor(),
          }}
        >
          {/* Subsection A: Personal Notes */}
          <div style={{ marginBottom: '16px' }}>
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

          {/* Subsection B: Problem Status Overrides */}
          <div style={styles.overrideSection}>
            <span style={styles.overrideTitle}>Problem Status Overrides (Click to color manually)</span>
            <div style={platform === 'leetcode' ? { ...styles.overrideGrid, flexDirection: 'column', alignItems: 'stretch', gap: '8px' } : styles.overrideGrid}>
              {problemIndices.map(idx => {
                const problemOverrides = userData.problemOverrides || {};
                const currentOverride = problemOverrides[idx] || 'default'; // 'solved', 'attempted', or 'default'
                
                const problemMeta = contest.problems?.find(p => p.index === idx);
                const problemText = problemMeta 
                  ? `${idx}: ${problemMeta.title} ${problemMeta.rating ? `[★ ${problemMeta.rating}]` : ''}`
                  : idx;

                return (
                  <div key={idx} style={platform === 'leetcode' ? { ...styles.overrideItem, justifyContent: 'space-between', width: '100%' } : styles.overrideItem}>
                    <span className="font-mono" style={platform === 'leetcode' ? { ...styles.overrideLabel, width: 'auto', flex: 1, textAlign: 'left', marginRight: '16px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' } : styles.overrideLabel} title={problemMeta?.title || idx}>
                      {problemText}
                    </span>
                    <div style={styles.overridePillGroup}>
                      <button
                        onClick={() => handleSelectOverride(idx, 'default')}
                        style={{
                          ...styles.overridePillBtn,
                          backgroundColor: currentOverride === 'default' ? 'var(--color-text-muted)' : 'rgba(255,255,255,0.03)',
                          color: currentOverride === 'default' ? 'var(--color-bg)' : 'var(--color-text-secondary)',
                          border: currentOverride === 'default' ? '1px solid transparent' : '1px solid var(--border-color)',
                          fontWeight: currentOverride === 'default' ? '600' : 'normal'
                        }}
                        title="Auto (Reset to submissions)"
                      >
                        Auto
                      </button>
                      <button
                        onClick={() => handleSelectOverride(idx, 'solved')}
                        style={{
                          ...styles.overridePillBtn,
                          backgroundColor: currentOverride === 'solved' ? 'var(--success)' : 'rgba(255,255,255,0.03)',
                          color: currentOverride === 'solved' ? '#ffffff' : 'var(--color-text-secondary)',
                          border: currentOverride === 'solved' ? '1px solid transparent' : '1px solid var(--border-color)',
                          fontWeight: currentOverride === 'solved' ? '600' : 'normal'
                        }}
                        title="Solved (Green)"
                      >
                        AC
                      </button>
                      <button
                        onClick={() => handleSelectOverride(idx, 'attempted')}
                        style={{
                          ...styles.overridePillBtn,
                          backgroundColor: currentOverride === 'attempted' ? 'var(--danger)' : 'rgba(255,255,255,0.03)',
                          color: currentOverride === 'attempted' ? '#ffffff' : 'var(--color-text-secondary)',
                          border: currentOverride === 'attempted' ? '1px solid transparent' : '1px solid var(--border-color)',
                          fontWeight: currentOverride === 'attempted' ? '600' : 'normal'
                        }}
                        title="Attempted (Red)"
                      >
                        WA
                      </button>
                      
                      {/* Split button for single letter problems (e.g. D -> D1, D2) */}
                      {/^[A-Z]$/.test(idx) && (
                        <button
                          type="button"
                          onClick={() => {
                            handleSelectOverride(`${idx}1`, 'default');
                            handleSelectOverride(`${idx}2`, 'default');
                          }}
                          style={{
                            ...styles.overridePillBtn,
                            backgroundColor: 'rgba(99, 102, 241, 0.12)',
                            color: 'var(--primary)',
                            border: '1px dashed rgba(99, 102, 241, 0.35)',
                            fontSize: '0.7rem',
                            padding: '3px 7px'
                          }}
                          title={`Split ${idx} into ${idx}1 and ${idx}2`}
                        >
                          Split {idx}1/{idx}2
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Add Subproblem (e.g. D1, D2) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed var(--border-color)', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', fontWeight: '500' }}>Add Subproblem:</span>
              <input
                type="text"
                className="form-control font-mono"
                style={{ width: '130px', padding: '5px 10px', fontSize: '0.82rem', height: '30px' }}
                placeholder="e.g. D1, D2"
                value={customProblem}
                onChange={(e) => setCustomProblem(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-sm"
                style={{ backgroundColor: 'rgba(52, 211, 153, 0.15)', color: 'var(--success)', border: '1px solid rgba(52, 211, 153, 0.3)', padding: '4px 10px', fontSize: '0.78rem', fontWeight: '600' }}
                onClick={() => {
                  const clean = customProblem.trim().toUpperCase();
                  if (clean) {
                    handleSelectOverride(clean, 'solved');
                    setCustomProblem('');
                  }
                }}
              >
                + Add AC
              </button>
              <button
                type="button"
                className="btn btn-sm"
                style={{ backgroundColor: 'rgba(248, 113, 113, 0.15)', color: 'var(--danger)', border: '1px solid rgba(248, 113, 113, 0.3)', padding: '4px 10px', fontSize: '0.78rem', fontWeight: '600' }}
                onClick={() => {
                  const clean = customProblem.trim().toUpperCase();
                  if (clean) {
                    handleSelectOverride(clean, 'attempted');
                    setCustomProblem('');
                  }
                }}
              >
                + Add WA
              </button>
            </div>
          </div>
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
    case 'ABC (Beginner)': return 'badge-success';
    case 'ARC (Regular)': return 'badge-warning';
    case 'AGC (Grand)': return 'badge-danger';
    case 'AHC (Heuristic)': return 'badge-info';
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
    case 'Done': return 'badge-success';
    case 'Partial Done': return 'badge-warning';
    case 'Not Done': return 'badge-danger';
    case 'Skipped': return 'badge-neutral';
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
    gap: '12px',
    background: 'var(--bg-card)',
    borderColor: 'var(--border-color)',
    padding: '20px',
    textAlign: 'left',
    position: 'relative',
  },
  topHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: '4px',
  },
  badgesWrapper: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    flexWrap: 'wrap',
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
    gap: '12px',
    borderTop: '1px solid var(--border-color)',
    paddingTop: '14px',
    marginTop: '4px',
    position: 'absolute',
    left: '-1px',
    right: '-1px',
    top: 'calc(100% - 1px)',
    zIndex: 100,
    background: 'var(--bg-card)',
    backdropFilter: 'var(--backdrop-blur)',
    WebkitBackdropFilter: 'var(--backdrop-blur)',
    border: '1px solid var(--border-color)',
    borderTop: 'none',
    borderBottomLeftRadius: '16px',
    borderBottomRightRadius: '16px',
    padding: '20px',
    boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
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
  },
  overrideSection: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  overrideTitle: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em'
  },
  overrideGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '12px 16px',
    alignItems: 'center'
  },
  overrideItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '4px 8px',
    borderRadius: '8px',
    border: '1px solid var(--border-color)'
  },
  overrideLabel: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--color-text-primary)',
    minWidth: '14px',
    textAlign: 'center'
  },
  overridePillGroup: {
    display: 'flex',
    gap: '2px',
    background: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '14px',
    padding: '2px'
  },
  overridePillBtn: {
    border: 'none',
    padding: '3px 8px',
    fontSize: '0.68rem',
    cursor: 'pointer',
    borderRadius: '12px',
    transition: 'all 0.2s ease',
    outline: 'none'
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--color-text-muted)',
    transition: 'all var(--transition-fast)',
    outline: 'none',
  }
};
