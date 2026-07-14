import React, { useState, useEffect, useMemo } from 'react';
import { Search, RefreshCw, Layers, ClipboardList, CheckCircle } from 'lucide-react';
import ContestCard from './ContestCard';
import { getContestDivision } from '../utils/helpers';

export default function ContestList({ 
  contests = [], 
  userContestData = {}, 
  processedSubmissions = {}, 
  onStatusChange, 
  onNoteChange, 
  onFavouriteToggle,
  filterState,
  setFilterState
}) {
  const [pageSize, setPageSize] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // 1. Dynamic local filter state (changes only apply to actual grid on click)
  const [localFilterState, setLocalFilterState] = useState({
    searchTerm: filterState.searchTerm || '',
    division: filterState.division || 'All',
    userStatus: filterState.userStatus || 'All',
    solvedRange: filterState.solvedRange || 'All',
    untriedProblems: filterState.untriedProblems || ''
  });

  // Sync local filters when parent state is modified externally (e.g. Dashboard redirect)
  useEffect(() => {
    setLocalFilterState({
      searchTerm: filterState.searchTerm || '',
      division: filterState.division || 'All',
      userStatus: filterState.userStatus || 'All',
      solvedRange: filterState.solvedRange || 'All',
      untriedProblems: filterState.untriedProblems || ''
    });
  }, [filterState]);

  // Options
  const divisions = ['All', 'Div. 1', 'Div. 2', 'Div. 3', 'Div. 4', 'Educational', 'Global Round', 'Other'];
  const userTrackStatuses = ['All', 'Done', 'Partial Done', 'Not Done'];
  const solvedRanges = ['All', '0 Solved', '1-2 Solved', '3-4 Solved', '5+ Solved'];

  // Handle local filter inputs changes
  const handleLocalFilterChange = (key, value) => {
    setLocalFilterState(prev => ({ ...prev, [key]: value }));
  };

  // Apply filters manually
  const handleApplyFilters = () => {
    setFilterState(localFilterState);
    setCurrentPage(1);
  };

  // Reset filters
  const handleResetFilters = () => {
    const cleared = {
      searchTerm: '',
      division: 'All',
      userStatus: 'All',
      solvedRange: 'All',
      untriedProblems: ''
    };
    setLocalFilterState(cleared);
    setFilterState(cleared);
    setCurrentPage(1);
  };

  // 2. Apply Filters (filtering matches uses parent's filterState)
  const filteredContests = useMemo(() => {
    return contests.filter(contest => {
      const { id, name } = contest;
      const division = getContestDivision(name);
      
      const uData = userContestData[id] || {};
      const subData = processedSubmissions[id] || {};

      // Name / ID Search
      if (filterState.searchTerm) {
        const query = filterState.searchTerm.toLowerCase();
        const matchesName = name.toLowerCase().includes(query);
        const matchesId = id.toString().includes(query);
        if (!matchesName && !matchesId) return false;
      }

      // Division
      if (filterState.division !== 'All') {
        if (filterState.division === 'Other') {
          const knownDivs = ['Div. 1', 'Div. 2', 'Div. 3', 'Div. 4', 'Educational', 'Global Round', 'Div. 1 + Div. 2'];
          if (knownDivs.includes(division)) return false;
        } else if (division !== filterState.division) {
          if (filterState.division === 'Div. 2' && (division === 'Div. 1 + Div. 2')) {
            // Keep
          } else if (filterState.division === 'Div. 1' && (division === 'Div. 1 + Div. 2')) {
            // Keep
          } else {
            return false;
          }
        }
      }

      // Custom User status tracking (mapped to Done, Partial Done, Not Done)
      if (filterState.userStatus !== 'All') {
        const currentStatus = uData.status || '';
        if (filterState.userStatus === 'Not Done') {
          // Both empty track status AND explicitly marked as "Not Done" count here
          if (currentStatus !== 'Not Done' && currentStatus !== '') return false;
        } else {
          // Strict checks for Done and Partial Done
          if (currentStatus !== filterState.userStatus) return false;
        }
      }

      // Solved problem count
      if (filterState.solvedRange !== 'All') {
        const solved = subData.totalSolved || 0;
        if (filterState.solvedRange === '0 Solved' && solved !== 0) return false;
        if (filterState.solvedRange === '1-2 Solved' && (solved < 1 || solved > 2)) return false;
        if (filterState.solvedRange === '3-4 Solved' && (solved < 3 || solved > 4)) return false;
        if (filterState.solvedRange === '5+ Solved' && solved < 5) return false;
      }

      // Untried specific problem index filter (e.g. C, D)
      if (filterState.untriedProblems) {
        const targetIndices = filterState.untriedProblems
          .split(',')
          .map(idx => idx.trim().toUpperCase())
          .filter(Boolean);

        if (targetIndices.length > 0) {
          const attempted = (subData.attemptedProblems || []).map(p => p.toUpperCase());
          const hasTriedAny = targetIndices.some(targetIdx => 
            attempted.some(attemptedIdx => attemptedIdx.startsWith(targetIdx) || attemptedIdx === targetIdx)
          );
          if (hasTriedAny) return false;
        }
      }
 
      return true;
    });
  }, [contests, userContestData, processedSubmissions, filterState]);

  // 3. Separate Upcoming and Finished/Past Contests
  const upcomingContests = useMemo(() => {
    return filteredContests.filter(c => c.phase === 'BEFORE');
  }, [filteredContests]);

  const pastContests = useMemo(() => {
    return filteredContests.filter(c => c.phase !== 'BEFORE');
  }, [filteredContests]);

  // 4. Paginate ONLY past contests
  const paginatedPastContests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return pastContests.slice(startIndex, startIndex + pageSize);
  }, [pastContests, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(pastContests.length / pageSize));

  return (
    <div className="container animate-fade-in" style={styles.container}>
      
      {/* Search and Filters Panel */}
      <div className="glass-card" style={styles.filterCard}>
        <div style={styles.searchRow}>
          <div style={styles.searchWrapper}>
            <Search size={18} style={styles.searchIcon} />
            <input 
              type="text"
              placeholder="Search by contest name or ID..."
              className="form-control"
              style={styles.searchInput}
              value={localFilterState.searchTerm}
              onChange={(e) => handleLocalFilterChange('searchTerm', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
            />
          </div>
          <button className="btn btn-primary" onClick={handleApplyFilters} style={styles.applyBtn}>
            Apply Filters
          </button>
          <button className="btn btn-secondary" onClick={handleResetFilters} style={styles.resetBtn}>
            Reset
          </button>
        </div>

        <div style={styles.filtersGrid}>
          {/* Division Filter */}
          <div className="form-group" style={styles.filterGroup}>
            <label className="form-label">
              <Layers size={12} style={styles.labelIcon} /> Division
            </label>
            <select 
              className="form-control form-select"
              value={localFilterState.division}
              onChange={(e) => handleLocalFilterChange('division', e.target.value)}
            >
              {divisions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* User Status Filter */}
          <div className="form-group" style={styles.filterGroup}>
            <label className="form-label">
              <CheckCircle size={12} style={styles.labelIcon} /> User Status
            </label>
            <select 
              className="form-control form-select"
              value={localFilterState.userStatus}
              onChange={(e) => handleLocalFilterChange('userStatus', e.target.value)}
            >
              {userTrackStatuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Solved Count Filter */}
          <div className="form-group" style={styles.filterGroup}>
            <label className="form-label">
              <RefreshCw size={12} style={styles.labelIcon} /> Solved Tasks
            </label>
            <select 
              className="form-control form-select"
              value={localFilterState.solvedRange}
              onChange={(e) => handleLocalFilterChange('solvedRange', e.target.value)}
            >
              {solvedRanges.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Untried Problems Filter */}
          <div className="form-group" style={styles.filterGroup}>
            <label className="form-label">
              <ClipboardList size={12} style={styles.labelIcon} /> Untried Problems
            </label>
            <input 
              type="text"
              placeholder="e.g. C, D, E"
              className="form-control"
              style={{ ...styles.statusSelect, paddingRight: '12px' }}
              value={localFilterState.untriedProblems}
              onChange={(e) => handleLocalFilterChange('untriedProblems', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
            />
          </div>
        </div>

        <div style={styles.summaryBar}>
          <p style={styles.resultsCount}>
            Found <strong>{filteredContests.length}</strong> matching contests
          </p>
        </div>
      </div>

      {/* Empty State */}
      {filteredContests.length === 0 && (
        <div className="glass-card" style={styles.emptyState}>
          <h3>No Contests Found</h3>
          <p style={styles.emptyText}>
            No contests match your selected filter criteria. Click reset or edit search parameters.
          </p>
          <button className="btn btn-primary" onClick={handleResetFilters} style={{ marginTop: '12px' }}>
            Clear Filters
          </button>
        </div>
      )}

      {filteredContests.length > 0 && (
        <>
          {/* Section 1: Upcoming Contests */}
          {upcomingContests.length > 0 && (
            <div style={{ marginBottom: '40px' }}>
              <h2 style={styles.sectionTitle}>Upcoming Contests</h2>
              <div className="contests-grid-layout">
                {upcomingContests.map(contest => (
                  <ContestCard
                    key={contest.id}
                    contest={contest}
                    userData={userContestData[contest.id] || {}}
                    submissionData={processedSubmissions[contest.id] || {}}
                    onStatusChange={onStatusChange}
                    onNoteChange={onNoteChange}
                    onFavouriteToggle={onFavouriteToggle}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Finished/Past Contests */}
          <div>
            <h2 style={styles.sectionTitle}>Finished Contests</h2>
            {paginatedPastContests.length > 0 ? (
              <>
                <div className="contests-grid-layout">
                  {paginatedPastContests.map(contest => (
                    <ContestCard
                      key={contest.id}
                      contest={contest}
                      userData={userContestData[contest.id] || {}}
                      submissionData={processedSubmissions[contest.id] || {}}
                      onStatusChange={onStatusChange}
                      onNoteChange={onNoteChange}
                      onFavouriteToggle={onFavouriteToggle}
                    />
                  ))}
                </div>

                {/* Pagination Controls (only for finished contests) */}
                <div style={styles.paginationCard}>
                  <div style={styles.pageSizeSelect}>
                    <span style={styles.pageSizeLabel}>Page Size:</span>
                    <select
                      className="form-control form-select"
                      style={styles.pageSizeControl}
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      {[10, 20, 50, 100].map(sz => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>

                  <div style={styles.paginationControls}>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      style={styles.pageBtn}
                    >
                      Previous
                    </button>
                    
                    <span style={styles.pageInfo}>
                      Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
                    </span>

                    <button 
                      className="btn btn-secondary"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      style={styles.pageBtn}
                    >
                      Next
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 24px', color: 'var(--color-text-muted)' }}>
                No finished contests match your filter criteria.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '28px',
    paddingBottom: '60px',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    textAlign: 'left',
    marginBottom: '20px',
    borderLeft: '4px solid var(--primary)',
    paddingLeft: '12px',
    color: 'var(--color-text-primary)',
  },
  filterCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    background: 'rgba(22, 28, 45, 0.6)',
    borderColor: 'var(--border-color)',
    padding: '24px',
    textAlign: 'left',
    marginBottom: '28px',
  },
  searchRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: '260px',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--color-text-muted)',
    pointerEvents: 'none',
  },
  searchInput: {
    paddingLeft: '44px',
    height: '44px',
  },
  applyBtn: {
    height: '44px',
    padding: '0 24px',
  },
  resetBtn: {
    height: '44px',
    padding: '0 20px',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  filterGroup: {
    marginBottom: 0,
  },
  labelIcon: {
    marginRight: '4px',
    verticalAlign: 'middle',
  },
  statusSelect: {
    padding: '8px 12px',
    fontSize: '0.85rem',
    height: '36px',
  },
  summaryBar: {
    borderTop: '1px solid var(--border-color)',
    paddingTop: '14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: '0.88rem',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  emptyState: {
    padding: '48px 24px',
    textAlign: 'center',
    border: '1px dashed var(--border-color)',
  },
  emptyText: {
    fontSize: '0.92rem',
    color: 'var(--color-text-secondary)',
    maxWidth: '400px',
    margin: '8px auto 0 auto',
    lineHeight: 1.5,
  },
  paginationCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '14px 24px',
    flexWrap: 'wrap',
    gap: '16px',
    marginTop: '20px',
  },
  pageSizeSelect: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  pageSizeLabel: {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
  },
  pageSizeControl: {
    width: '80px',
    padding: '6px 12px',
    height: '32px',
    paddingRight: '28px',
  },
  paginationControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  pageBtn: {
    padding: '6px 16px',
    fontSize: '0.85rem',
    height: '32px',
  },
  pageInfo: {
    fontSize: '0.88rem',
    color: 'var(--color-text-secondary)',
  }
};
