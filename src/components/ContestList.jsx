import React, { useState, useMemo } from 'react';
import { Search, Filter, RefreshCw, Layers, Calendar, ClipboardList, CheckCircle } from 'lucide-react';
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

  // 1. Dynamic filter collections
  const divisions = ['All', 'Div. 1', 'Div. 2', 'Div. 3', 'Div. 4', 'Educational', 'Global Round', 'Other'];
  
  const years = useMemo(() => {
    const yearsSet = new Set();
    contests.forEach(c => {
      if (c.startTimeSeconds) {
        yearsSet.add(new Date(c.startTimeSeconds * 1000).getFullYear().toString());
      }
    });
    return ['All', ...Array.from(yearsSet).sort((a, b) => b - a)];
  }, [contests]);

  const participationStatuses = ['All', 'Official', 'Virtual', 'Practice', 'Unattempted'];
  
  const userTrackStatuses = ['All', 'Plan to Attend', 'Attended', 'Need to Upsolve', 'Upsolving', 'Completed', 'Favourite', 'Skipped', 'None'];

  const solvedRanges = ['All', '0 Solved', '1-2 Solved', '3-4 Solved', '5+ Solved'];

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilterState(prev => {
      const next = { ...prev, [key]: value };
      return next;
    });
    setCurrentPage(1); // Reset page on filter change
  };

  // 2. Filter & Sort Logic
  const filteredContests = useMemo(() => {
    return contests.filter(contest => {
      const { id, name, startTimeSeconds } = contest;
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
          // If division is "Other", filter out main categories
          const knownDivs = ['Div. 1', 'Div. 2', 'Div. 3', 'Div. 4', 'Educational', 'Global Round', 'Div. 1 + Div. 2'];
          if (knownDivs.includes(division)) return false;
        } else if (division !== filterState.division) {
          // Handle specific case when user selects "Div. 2" but round is "Div. 1 + Div. 2" or "Div. 1+2"
          if (filterState.division === 'Div. 2' && (division === 'Div. 1 + Div. 2')) {
            // Keep it
          } else if (filterState.division === 'Div. 1' && (division === 'Div. 1 + Div. 2')) {
            // Keep it
          } else {
            return false;
          }
        }
      }

      // Year
      if (filterState.year !== 'All' && startTimeSeconds) {
        const contestYear = new Date(startTimeSeconds * 1000).getFullYear().toString();
        if (contestYear !== filterState.year) return false;
      }

      // Participation Status
      if (filterState.participation !== 'All') {
        const part = subData.participation || 'NONE';
        if (filterState.participation === 'Official' && part !== 'OFFICIAL') return false;
        if (filterState.participation === 'Virtual' && part !== 'VIRTUAL') return false;
        if (filterState.participation === 'Practice' && part !== 'PRACTICE') return false;
        if (filterState.participation === 'Unattempted' && part !== 'NONE') return false;
      }

      // Custom User status tracking
      if (filterState.userStatus !== 'All') {
        if (filterState.userStatus === 'None') {
          if (uData.status) return false;
        } else if (filterState.userStatus === 'Favourite') {
          if (!uData.favourite) return false;
        } else {
          if (uData.status !== filterState.userStatus) return false;
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

      return true;
    });
  }, [contests, userContestData, processedSubmissions, filterState]);

  // 3. Paginated items
  const paginatedContests = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredContests.slice(startIndex, startIndex + pageSize);
  }, [filteredContests, currentPage, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredContests.length / pageSize));

  // Reset filters
  const handleResetFilters = () => {
    setFilterState({
      searchTerm: '',
      division: 'All',
      year: 'All',
      participation: 'All',
      userStatus: 'All',
      solvedRange: 'All'
    });
    setCurrentPage(1);
  };

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
              value={filterState.searchTerm}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            />
          </div>
          <button className="btn btn-secondary" onClick={handleResetFilters} style={styles.resetBtn}>
            Reset Filters
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
              value={filterState.division}
              onChange={(e) => handleFilterChange('division', e.target.value)}
            >
              {divisions.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div className="form-group" style={styles.filterGroup}>
            <label className="form-label">
              <Calendar size={12} style={styles.labelIcon} /> Year
            </label>
            <select 
              className="form-control form-select"
              value={filterState.year}
              onChange={(e) => handleFilterChange('year', e.target.value)}
            >
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Participation Filter */}
          <div className="form-group" style={styles.filterGroup}>
            <label className="form-label">
              <ClipboardList size={12} style={styles.labelIcon} /> Participation
            </label>
            <select 
              className="form-control form-select"
              value={filterState.participation}
              onChange={(e) => handleFilterChange('participation', e.target.value)}
            >
              {participationStatuses.map(p => (
                <option key={p} value={p}>{p}</option>
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
              value={filterState.userStatus}
              onChange={(e) => handleFilterChange('userStatus', e.target.value)}
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
              value={filterState.solvedRange}
              onChange={(e) => handleFilterChange('solvedRange', e.target.value)}
            >
              {solvedRanges.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
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
            No contests match your selected filter criteria. Try resetting filters or updating your search query.
          </p>
          <button className="btn btn-primary" onClick={handleResetFilters} style={{ marginTop: '12px' }}>
            Clear Filters
          </button>
        </div>
      )}

      {/* Contests Grid */}
      {filteredContests.length > 0 && (
        <>
          <div className="contests-grid-layout">
            {paginatedContests.map(contest => (
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

          {/* Pagination Controls */}
          <div style={styles.paginationCard}>
            <div style={styles.pageSizeSelect}>
              <span style={styles.pageSizeLabel}>Page Size:</span>
              <select
                className="form-control"
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
      )}
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '28px',
    paddingBottom: '60px',
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
  resetBtn: {
    height: '44px',
    padding: '0 20px',
  },
  filtersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '16px',
  },
  filterGroup: {
    marginBottom: 0,
  },
  labelIcon: {
    marginRight: '4px',
    verticalAlign: 'middle',
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
