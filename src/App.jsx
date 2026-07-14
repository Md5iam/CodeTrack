import React, { useState, useEffect, useMemo } from 'react';
import Navbar from './components/Navbar';
import ConnectHandle from './components/ConnectHandle';
import Dashboard from './components/Dashboard';
import ContestList from './components/ContestList';

import { 
  fetchUserInfo, 
  fetchContestList, 
  fetchUserRating, 
  fetchUserStatus 
} from './services/api';
import { 
  getHandle, 
  saveHandle, 
  removeHandle, 
  getContestUserData, 
  updateContestStatus, 
  updateContestNote, 
  toggleContestFavourite 
} from './services/storage';
import { processContestSubmissions, calculateDashboardStats } from './utils/helpers';
import { 
  MOCK_USER_INFO, 
  MOCK_RATING_HISTORY, 
  MOCK_CONTESTS, 
  MOCK_SUBMISSIONS 
} from './utils/mockData';

import './App.css';

function App() {
  // Main States
  const [handle, setHandle] = useState('');
  const [userInfo, setUserInfo] = useState(null);
  const [contests, setContests] = useState([]);
  const [ratingHistory, setRatingHistory] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [userContestData, setUserContestData] = useState({});
  
  // Navigation & UI States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMockData, setIsMockData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Persist filter state across tabs
  const [filterState, setFilterState] = useState({
    searchTerm: '',
    division: 'All',
    year: 'All',
    participation: 'All',
    userStatus: 'All',
    solvedRange: 'All'
  });

  // Load initial handle and local storage data
  useEffect(() => {
    const savedHandle = getHandle();
    const localContestData = getContestUserData();
    setUserContestData(localContestData);

    if (savedHandle) {
      setHandle(savedHandle);
      if (savedHandle === 'demo') {
        loadMockData();
      } else {
        loadProfileData(savedHandle);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  // Fetch all profile details from Codeforces API
  const loadProfileData = async (userHandle) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // 1. Fetch user info first to validate handle
      const profile = await fetchUserInfo(userHandle);
      setUserInfo(profile);
      setIsMockData(false);

      // 2. Fetch rating history, submissions, and contest lists
      const [history, subs, allContests] = await Promise.all([
        fetchUserRating(userHandle).catch(err => {
          console.warn('Failed to load ratings, using empty', err);
          return [];
        }),
        fetchUserStatus(userHandle).catch(err => {
          console.warn('Failed to load submissions, using empty', err);
          return [];
        }),
        fetchContestList().catch(err => {
          console.warn('Failed to fetch fresh contests, attempting cached', err);
          return [];
        })
      ]);

      setRatingHistory(history);
      setSubmissions(subs);
      setContests(allContests);
      setHandle(userHandle);
      saveHandle(userHandle);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect to Codeforces. Please verify your connection.');
      // If error occurs and we already have a local profile, don't clear it immediately, just present error
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh profile details
  const handleRefreshData = async () => {
    if (isMockData) return;
    setIsRefreshing(true);
    try {
      const profile = await fetchUserInfo(handle);
      setUserInfo(profile);

      const [history, subs, allContests] = await Promise.all([
        fetchUserRating(handle),
        fetchUserStatus(handle),
        fetchContestList()
      ]);

      setRatingHistory(history);
      setSubmissions(subs);
      setContests(allContests);
    } catch (err) {
      console.error(err);
      alert(`Refresh failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load Mock Data
  const loadMockData = () => {
    setIsLoading(true);
    setHandle('cp_legend');
    setUserInfo(MOCK_USER_INFO);
    setContests(MOCK_CONTESTS);
    setRatingHistory(MOCK_RATING_HISTORY);
    setSubmissions(MOCK_SUBMISSIONS);
    setIsMockData(true);
    saveHandle('demo');
    setIsLoading(false);
  };

  // Connect handle triggers
  const handleConnect = async (userHandle) => {
    await loadProfileData(userHandle);
  };

  // Disconnect handle
  const handleDisconnect = () => {
    removeHandle();
    setHandle('');
    setUserInfo(null);
    setRatingHistory([]);
    setSubmissions([]);
    setContests([]);
    setIsMockData(false);
    setErrorMsg('');
  };

  const handleExportData = () => {
    const data = {
      handle: handle,
      contestUserData: getContestUserData()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `codetrack-backup-${handle || 'demo'}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (importedJsonString) => {
    try {
      const data = JSON.parse(importedJsonString);
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid backup file format');
      }
      
      if (data.handle) {
        saveHandle(data.handle);
        setHandle(data.handle);
      }
      
      if (data.contestUserData && typeof data.contestUserData === 'object') {
        const mergedData = { ...getContestUserData(), ...data.contestUserData };
        saveContestUserData(mergedData);
        setUserContestData(mergedData);
      }
      
      if (data.handle && data.handle !== 'demo') {
        loadProfileData(data.handle);
      } else if (data.handle === 'demo') {
        loadMockData();
      }
      alert('Data imported successfully!');
    } catch (err) {
      console.error(err);
      alert(`Failed to import data: ${err.message}`);
    }
  };

  // State update functions for custom manual statuses
  const handleStatusChange = (contestId, newStatus) => {
    const updated = updateContestStatus(contestId, newStatus);
    setUserContestData(updated);
  };

  const handleNoteChange = (contestId, newNote) => {
    const updated = updateContestNote(contestId, newNote);
    setUserContestData(updated);
  };

  const handleFavouriteToggle = (contestId) => {
    const updated = toggleContestFavourite(contestId);
    setUserContestData(updated);
  };

  // Calculate statistics from submission histories
  const processedSubmissions = useMemo(() => {
    return processContestSubmissions(submissions, ratingHistory, contests);
  }, [submissions, ratingHistory, contests]);

  const dashboardStats = useMemo(() => {
    return calculateDashboardStats(userInfo, ratingHistory, processedSubmissions, userContestData);
  }, [userInfo, ratingHistory, processedSubmissions, userContestData]);

  // Extract recent tracked contests (sorted by last updated, or simply contests with user interactions)
  const recentTrackedContests = useMemo(() => {
    const trackedList = [];
    Object.keys(userContestData).forEach(cidStr => {
      const cid = parseInt(cidStr, 10);
      const data = userContestData[cid];
      if (data.status || data.favourite) {
        const contestInfo = contests.find(c => c.id === cid);
        if (contestInfo) {
          trackedList.push({
            id: cid,
            name: contestInfo.name,
            status: data.status || 'None',
            favourite: !!data.favourite,
            startTimeSeconds: contestInfo.startTimeSeconds || 0
          });
        }
      }
    });
    // Sort by startTimeSeconds descending (newest contests first)
    return trackedList.sort((a, b) => b.startTimeSeconds - a.startTimeSeconds).slice(0, 5);
  }, [userContestData, contests]);

  // Loading States
  if (isLoading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <h3 style={styles.loadingText}>Fetching Codeforces Data...</h3>
        <p style={styles.loadingSub}>Analyzing profile, submission history, and ratings.</p>
      </div>
    );
  }

  // Not Connected or Connection Error
  if (!handle) {
    return (
      <div style={styles.appContainer}>
        <ConnectHandle 
          onConnect={handleConnect} 
          onUseMock={loadMockData} 
        />
        {errorMsg && (
          <div className="container" style={styles.errorBanner}>
            <p>{errorMsg}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.appContainer}>
      <Navbar 
        userInfo={userInfo}
        handle={handle === 'demo' ? 'cp_legend' : handle}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDisconnect={handleDisconnect}
        isMockData={isMockData}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
        onExportData={handleExportData}
        onImportData={handleImportData}
      />

      <main style={styles.mainContent}>
        {activeTab === 'dashboard' ? (
          <Dashboard 
            stats={dashboardStats} 
            recentContests={recentTrackedContests}
            onNavigateToContests={() => setActiveTab('contests')}
            setFilterState={setFilterState}
          />
        ) : (
          <ContestList 
            contests={contests}
            userContestData={userContestData}
            processedSubmissions={processedSubmissions}
            onStatusChange={handleStatusChange}
            onNoteChange={handleNoteChange}
            onFavouriteToggle={handleFavouriteToggle}
            filterState={filterState}
            setFilterState={setFilterState}
          />
        )}
      </main>

      <footer style={styles.footer}>
        <div className="container" style={styles.footerContainer}>
          <p>© 2026 CodeTrack. Built using React, Vite, and the Codeforces Public API.</p>
          <p style={styles.footerSub}>Saved offline to LocalStorage.</p>
        </div>
      </footer>
    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    width: '100%',
  },
  mainContent: {
    flex: 1,
    width: '100%',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    gap: '16px',
    background: 'var(--bg-main)',
    color: '#fff',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: '600',
  },
  loadingSub: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary)',
  },
  errorBanner: {
    marginTop: '20px',
    textAlign: 'center',
    color: 'var(--danger)',
  },
  footer: {
    borderTop: '1px solid var(--border-color)',
    background: 'rgba(11, 15, 25, 0.5)',
    padding: '24px 0',
    marginTop: 'auto',
  },
  footerContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    fontSize: '0.8rem',
    color: 'var(--color-text-muted)',
  },
  footerSub: {
    margin: 0,
  }
};

export default App;
