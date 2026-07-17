import React, { useState, useEffect, useMemo, useRef } from 'react';
import Navbar from './components/Navbar';
import ConnectHandle from './components/ConnectHandle';
import Dashboard from './components/Dashboard';
import ContestList from './components/ContestList';
import CloudSettingsModal from './components/CloudSettingsModal';
import DatabaseGateway from './components/DatabaseGateway';

import { 
  fetchUserInfo, 
  fetchContestList, 
  fetchUserRating, 
  fetchUserStatus,
  fetchAtCoderUserInfo,
  fetchAtCoderUserRating,
  fetchAtCoderSubmissions,
  fetchAtCoderContestList,
  fetchLeetCodeUserInfo,
  fetchLeetCodeSubmissions,
  fetchLeetCodeContestList
} from './services/api';
import { 
  getHandle, 
  saveHandle, 
  removeHandle, 
  getContestUserData, 
  saveContestUserData,
  updateContestStatus, 
  updateContestNote, 
  toggleContestFavourite,
  getAtCoderHandle,
  saveAtCoderHandle,
  removeAtCoderHandle,
  getAtCoderContestUserData,
  saveAtCoderContestUserData,
  updateAtCoderContestStatus,
  updateAtCoderContestNote,
  toggleAtCoderContestFavourite,
  getLeetCodeHandle,
  saveLeetCodeHandle,
  removeLeetCodeHandle,
  getLeetCodeContestUserData,
  saveLeetCodeContestUserData,
  updateLeetCodeContestStatus,
  updateLeetCodeContestNote,
  toggleLeetCodeContestFavourite,
  updateProblemOverride
} from './services/storage';
import { 
  isSupabaseConfigured, 
  fetchCloudContestData, 
  upsertCloudContestData 
} from './services/supabase';
import { 
  processContestSubmissions, 
  processAtCoderSubmissions, 
  calculateDashboardStats 
} from './utils/helpers';
import { 
  MOCK_USER_INFO, 
  MOCK_RATING_HISTORY, 
  MOCK_CONTESTS, 
  MOCK_SUBMISSIONS,
  MOCK_ATCODER_CONTESTS,
  MOCK_ATCODER_RATING_HISTORY,
  MOCK_LEETCODE_CONTESTS,
  MOCK_LEETCODE_RATING_HISTORY
} from './utils/mockData';

import './App.css';

function App() {
  // Platform Selection
  const [platform, setPlatform] = useState('codeforces');

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

  // Database Gateway — must connect Supabase before entering the app
  const [isDbUnlocked, setIsDbUnlocked] = useState(isSupabaseConfigured());

  // Cloud Sync Database States
  const [isCloudActive, setIsCloudActive] = useState(isSupabaseConfigured());
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);

  // Theme state
  const [theme, setTheme] = useState(localStorage.getItem('cf_theme') || 'dark');

  // Persist filter state across tabs
  const [filterState, setFilterState] = useState({
    searchTerm: '',
    division: 'All',
    userStatus: 'All',
    solvedRange: 'All',
    untriedProblems: ''
  });

  const prevHandleRef = useRef(handle);

  // Synchronize state changes to URL hash (handles pushing / replacing browser history)
  useEffect(() => {
    const savedHandle = platform === 'codeforces' 
      ? getHandle() 
      : platform === 'atcoder' 
        ? getAtCoderHandle() 
        : getLeetCodeHandle();

    let newHash = '';
    if (savedHandle) {
      newHash = `#/${platform}/${activeTab}`;
    } else {
      newHash = `#/${platform}`;
    }

    if (window.location.hash !== newHash) {
      const isLoginTransition = !prevHandleRef.current && handle;
      const isLogoutTransition = prevHandleRef.current && !handle;

      if (isLoginTransition || isLogoutTransition) {
        window.history.replaceState(null, '', newHash);
      } else {
        window.location.hash = newHash;
      }
    }
    
    prevHandleRef.current = handle;
  }, [platform, activeTab, handle]);

  // Handle URL hash changes (browser back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (!hash) {
        setPlatform('codeforces');
        setActiveTab('dashboard');
        return;
      }

      const parts = hash.replace(/^#\/?/, '').split('/');
      const parsedPlatform = parts[0];
      const parsedTab = parts[1] || 'dashboard';

      const validPlatforms = ['codeforces', 'atcoder', 'leetcode'];
      const validTabs = ['dashboard', 'contests'];

      if (validPlatforms.includes(parsedPlatform)) {
        setPlatform(parsedPlatform);
        if (validTabs.includes(parsedTab)) {
          setActiveTab(parsedTab);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  // Load initial handle and local storage data when platform or load triggers
  useEffect(() => {
    setIsLoading(true);
    setUserInfo(null);
    setRatingHistory([]);
    setSubmissions([]);
    setContests([]);
    setErrorMsg('');
    
    // Reset filters to prevent platform mismatch (e.g. division filters)
    setFilterState({
      searchTerm: '',
      division: 'All',
      userStatus: 'All',
      solvedRange: 'All',
      untriedProblems: ''
    });

    const savedHandle = platform === 'codeforces' 
      ? getHandle() 
      : platform === 'atcoder' 
        ? getAtCoderHandle() 
        : getLeetCodeHandle();
    const localContestData = platform === 'codeforces' 
      ? getContestUserData() 
      : platform === 'atcoder' 
        ? getAtCoderContestUserData() 
        : getLeetCodeContestUserData();
    setUserContestData(localContestData);

    if (savedHandle) {
      setHandle(savedHandle);
      if (savedHandle === 'demo') {
        loadMockData();
      } else {
        loadProfileData(savedHandle, platform);
      }
    } else {
      setHandle('');
      setIsLoading(false);
    }
  }, [platform]);

  // Sync theme with body class and local storage
  useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('cf_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Sync cloud database states
  const handleCloudConfigChange = () => {
    const active = isSupabaseConfigured();
    setIsCloudActive(active);
    if (active && handle && handle !== 'demo') {
      syncCloudData(handle, platform);
    }
  };

  const syncCloudData = async (userHandle, activePlatform = platform) => {
    if (!userHandle || userHandle === 'demo') return;
    if (!isSupabaseConfigured()) return;
    try {
      const cloudData = await fetchCloudContestData(userHandle, activePlatform);
      if (activePlatform === 'codeforces') {
        const localData = getContestUserData();
        const mergedData = { ...localData, ...cloudData };
        saveContestUserData(mergedData);
        setUserContestData(mergedData);
      } else if (activePlatform === 'atcoder') {
        const localData = getAtCoderContestUserData();
        const mergedData = { ...localData, ...cloudData };
        saveAtCoderContestUserData(mergedData);
        setUserContestData(mergedData);
      } else {
        const localData = getLeetCodeContestUserData();
        const mergedData = { ...localData, ...cloudData };
        saveLeetCodeContestUserData(mergedData);
        setUserContestData(mergedData);
      }
    } catch (err) {
      console.warn('Failed to fetch cloud database tracking data', err);
    }
  };

  // Fetch all profile details from Codeforces/AtCoder/LeetCode APIs
  const loadProfileData = async (userHandle, activePlatform = platform) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      let profile;
      let atCoderHistory = null;
      let leetCodeHistory = null;
      if (activePlatform === 'codeforces') {
        profile = await fetchUserInfo(userHandle);
      } else if (activePlatform === 'atcoder') {
        if (userHandle === 'atcoder_manual') {
          profile = {
            handle: 'atcoder_manual',
            rank: 'Manual',
            maxRank: 'Manual',
            rating: 0,
            maxRating: 0,
            avatar: 'https://img.atcoder.jp/assets/icon/avatar.png',
            contestCount: 0
          };
          atCoderHistory = [];
        } else {
          const atCoderData = await fetchAtCoderUserInfo(userHandle);
          profile = atCoderData.profile;
          atCoderHistory = atCoderData.history;
        }
      } else {
        const leetCodeData = await fetchLeetCodeUserInfo(userHandle);
        profile = leetCodeData.profile;
        leetCodeHistory = leetCodeData.history;
      }
      setUserInfo(profile);
      setIsMockData(false);

      // 2. Fetch rating history, submissions, and contest lists
      const [history, subs, allContests, cloudData] = await Promise.all([
        activePlatform === 'codeforces' 
          ? fetchUserRating(userHandle).catch(err => {
              console.warn('Failed to load ratings, using empty', err);
              return [];
            })
          : activePlatform === 'atcoder'
            ? Promise.resolve(atCoderHistory)
            : Promise.resolve(leetCodeHistory),
        (activePlatform === 'codeforces' 
          ? fetchUserStatus(userHandle) 
          : activePlatform === 'atcoder'
            ? (userHandle === 'atcoder_manual' ? Promise.resolve([]) : fetchAtCoderSubmissions(userHandle))
            : fetchLeetCodeSubmissions(userHandle)
        ).catch(err => {
          console.warn('Failed to load submissions, using empty', err);
          return [];
        }),
        (activePlatform === 'codeforces' 
          ? fetchContestList() 
          : activePlatform === 'atcoder'
            ? fetchAtCoderContestList()
            : fetchLeetCodeContestList(leetCodeHistory)
        ).catch(err => {
          console.warn('Failed to fetch fresh contests, attempting cached', err);
          return [];
        }),
        // Load cloud tracking data for all platforms if Supabase is configured
        (isSupabaseConfigured() ? fetchCloudContestData(userHandle, activePlatform) : Promise.resolve(null)).catch(err => {
          console.warn('Failed to load cloud tracking data, using local fallback', err);
          return null;
        })
      ]);

      setRatingHistory(history);
      setSubmissions(subs);
      setContests(allContests);
      setHandle(userHandle);
      
      if (activePlatform === 'codeforces') {
        saveHandle(userHandle);
      } else if (activePlatform === 'atcoder') {
        saveAtCoderHandle(userHandle);
      } else {
        saveLeetCodeHandle(userHandle);
      }

      if (cloudData) {
        if (activePlatform === 'codeforces') {
          const mergedData = { ...getContestUserData(), ...cloudData };
          saveContestUserData(mergedData);
          setUserContestData(mergedData);
        } else if (activePlatform === 'atcoder') {
          const mergedData = { ...getAtCoderContestUserData(), ...cloudData };
          saveAtCoderContestUserData(mergedData);
          setUserContestData(mergedData);
        } else {
          const mergedData = { ...getLeetCodeContestUserData(), ...cloudData };
          saveLeetCodeContestUserData(mergedData);
          setUserContestData(mergedData);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || `Failed to connect to ${activePlatform === 'codeforces' ? 'Codeforces' : activePlatform === 'atcoder' ? 'AtCoder' : 'LeetCode'}. Please verify your connection.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh profile details
  const handleRefreshData = async () => {
    if (isMockData) return;
    setIsRefreshing(true);
    try {
      let profile;
      let atCoderHistory = null;
      let leetCodeHistory = null;
      if (platform === 'codeforces') {
        profile = await fetchUserInfo(handle);
      } else if (platform === 'atcoder') {
        if (handle === 'atcoder_manual') {
          profile = {
            handle: 'atcoder_manual',
            rank: 'Manual',
            maxRank: 'Manual',
            rating: 0,
            maxRating: 0,
            avatar: 'https://img.atcoder.jp/assets/icon/avatar.png',
            contestCount: 0
          };
          atCoderHistory = [];
        } else {
          const atCoderData = await fetchAtCoderUserInfo(handle);
          profile = atCoderData.profile;
          atCoderHistory = atCoderData.history;
        }
      } else {
        const leetCodeData = await fetchLeetCodeUserInfo(handle);
        profile = leetCodeData.profile;
        leetCodeHistory = leetCodeData.history;
      }
      setUserInfo(profile);

      const [history, subs, allContests] = await Promise.all([
        platform === 'codeforces' 
          ? fetchUserRating(handle) 
          : platform === 'atcoder'
            ? Promise.resolve(atCoderHistory)
            : Promise.resolve(leetCodeHistory),
        platform === 'codeforces' 
          ? fetchUserStatus(handle) 
          : platform === 'atcoder'
            ? (handle === 'atcoder_manual' ? Promise.resolve([]) : fetchAtCoderSubmissions(handle))
            : fetchLeetCodeSubmissions(handle),
        platform === 'codeforces' 
          ? fetchContestList(true) 
          : platform === 'atcoder'
            ? fetchAtCoderContestList(true)
            : fetchLeetCodeContestList(leetCodeHistory)
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
    if (platform === 'codeforces') {
      setHandle('cp_legend');
      setUserInfo(MOCK_USER_INFO);
      setContests(MOCK_CONTESTS);
      setRatingHistory(MOCK_RATING_HISTORY);
      setSubmissions(MOCK_SUBMISSIONS);
      setIsMockData(true);
      saveHandle('demo');
    } else if (platform === 'atcoder') {
      setHandle('at_legend');
      setUserInfo({
        handle: 'at_legend',
        rank: 'Orange',
        maxRank: 'Red',
        rating: 2650,
        maxRating: 2840,
        avatar: 'https://img.atcoder.jp/assets/icon/avatar.png',
        contestCount: 15
      });
      
      setContests(MOCK_ATCODER_CONTESTS);
      setRatingHistory(MOCK_ATCODER_RATING_HISTORY);
      setSubmissions([]);
      setIsMockData(true);
      saveAtCoderHandle('demo');
    } else {
      setHandle('lc_legend');
      setUserInfo({
        handle: 'lc_legend',
        name: 'LeetCode Legend',
        rank: 'Knight',
        maxRank: 'Guardian',
        rating: 1820,
        maxRating: 1950,
        avatar: 'https://assets.leetcode.com/users/default_avatar.jpg',
        contestCount: 4,
        solvedStats: {
          easy: 120,
          medium: 180,
          hard: 35,
          total: 335
        }
      });
      setContests(MOCK_LEETCODE_CONTESTS);
      setRatingHistory(MOCK_LEETCODE_RATING_HISTORY);
      setSubmissions([]);
      setIsMockData(true);
      saveLeetCodeHandle('demo');
    }
    setIsLoading(false);
  };

  // Connect handle triggers
  const handleConnect = async (userHandle) => {
    await loadProfileData(userHandle);
  };

  // Disconnect handle
  const handleDisconnect = () => {
    if (platform === 'codeforces') {
      removeHandle();
    } else if (platform === 'atcoder') {
      removeAtCoderHandle();
    } else {
      removeLeetCodeHandle();
    }
    setHandle('');
    setUserInfo(null);
    setRatingHistory([]);
    setSubmissions([]);
    setContests([]);
    setIsMockData(false);
    setErrorMsg('');
  };

  // Helper: sync a single contest's full tracking record to Supabase
  const syncContestToCloud = (contestId, updated) => {
    if (!isCloudActive || handle === 'demo') return;
    const cardData = updated[contestId] || {};
    upsertCloudContestData(handle, contestId, {
      status: cardData.status,
      note: cardData.note,
      favourite: cardData.favourite,
      problemOverrides: cardData.problemOverrides || {}
    }, platform).catch(err => console.warn('Failed to sync to Cloud database', err));
  };

  // State update functions for custom manual statuses
  const handleStatusChange = (contestId, newStatus) => {
    const updated = platform === 'codeforces'
      ? updateContestStatus(contestId, newStatus)
      : platform === 'atcoder'
        ? updateAtCoderContestStatus(contestId, newStatus)
        : updateLeetCodeContestStatus(contestId, newStatus);
    setUserContestData(updated);
    syncContestToCloud(contestId, updated);
  };

  const handleNoteChange = (contestId, newNote) => {
    const updated = platform === 'codeforces'
      ? updateContestNote(contestId, newNote)
      : platform === 'atcoder'
        ? updateAtCoderContestNote(contestId, newNote)
        : updateLeetCodeContestNote(contestId, newNote);
    setUserContestData(updated);
    syncContestToCloud(contestId, updated);
  };

  const handleFavouriteToggle = (contestId) => {
    const updated = platform === 'codeforces'
      ? toggleContestFavourite(contestId)
      : platform === 'atcoder'
        ? toggleAtCoderContestFavourite(contestId)
        : toggleLeetCodeContestFavourite(contestId);
    setUserContestData(updated);
    syncContestToCloud(contestId, updated);
  };

  const handleProblemOverrideChange = (contestId, problemIndex, override) => {
    const updated = updateProblemOverride(contestId, problemIndex, override, platform);
    setUserContestData(updated);
    syncContestToCloud(contestId, updated);
  };

  // Calculate statistics from submission histories
  const processedSubmissions = useMemo(() => {
    if (platform === 'codeforces') {
      return processContestSubmissions(submissions, ratingHistory, contests);
    } else if (platform === 'atcoder') {
      return processAtCoderSubmissions(submissions, ratingHistory, contests);
    } else {
      const result = {};
      const acSlugs = new Set(submissions.map(s => s.titleSlug).filter(Boolean));

      contests.forEach(c => {
        const solved = [];
        const solvedCount = c.problemsSolved || 0;
        const totalCount = c.totalProblems || 4;
        
        for (let i = 1; i <= totalCount; i++) {
          const key = `Q${i}`;
          if (i <= solvedCount) {
            solved.push(key);
          }
        }

        // Add problems solved from recent accepted submissions
        if (c.problems) {
          c.problems.forEach(p => {
            if (p.titleSlug && acSlugs.has(p.titleSlug)) {
              if (!solved.includes(p.index)) {
                solved.push(p.index);
              }
            }
          });
        }

        result[c.id] = {
          solvedProblems: solved,
          attemptedProblems: [],
          totalAttempted: 0,
          totalSolved: solved.length
        };
      });
      return result;
    }
  }, [submissions, ratingHistory, contests, platform]);

  const dashboardStats = useMemo(() => {
    return calculateDashboardStats(userInfo, ratingHistory, processedSubmissions, userContestData);
  }, [userInfo, ratingHistory, processedSubmissions, userContestData]);

  // Extract recent tracked contests (sorted by last updated, or simply contests with user interactions)
  const recentTrackedContests = useMemo(() => {
    const trackedList = [];
    Object.keys(userContestData).forEach(cidStr => {
      const cid = cidStr; // Keep as string for AtCoder IDs
      const data = userContestData[cid];
      if (data.status || data.favourite) {
        const contestInfo = contests.find(c => c.id === cid || c.id === parseInt(cid, 10));
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
        <h3 style={styles.loadingText}>Fetching {platform === 'codeforces' ? 'Codeforces' : platform === 'atcoder' ? 'AtCoder' : 'LeetCode'} Data...</h3>
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
          platform={platform}
        />
        {errorMsg && (
          <div className="container" style={styles.errorBanner}>
            <p>{errorMsg}</p>
          </div>
        )}
      </div>
    );
  }

  if (!isDbUnlocked) {
    return (
      <DatabaseGateway
        onUnlocked={() => {
          setIsDbUnlocked(true);
          setIsCloudActive(true);
        }}
      />
    );
  }

  return (
    <div style={styles.appContainer}>
      <Navbar 
        userInfo={userInfo}
        handle={handle === 'demo' ? (platform === 'codeforces' ? 'cp_legend' : platform === 'atcoder' ? 'at_legend' : 'lc_legend') : handle}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onDisconnect={handleDisconnect}
        isMockData={isMockData}
        onRefreshData={handleRefreshData}
        isRefreshing={isRefreshing}
        isCloudActive={isCloudActive}
        onOpenCloudSettings={() => setIsCloudModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        platform={platform}
        onChangePlatform={setPlatform}
      />

      <main style={styles.mainContent}>
        {activeTab === 'dashboard' ? (
          <Dashboard 
            stats={dashboardStats} 
            recentContests={recentTrackedContests}
            onNavigateToContests={() => setActiveTab('contests')}
            setFilterState={setFilterState}
            platform={platform}
            handle={handle}
          />
        ) : (
          <ContestList 
            contests={contests}
            userContestData={userContestData}
            processedSubmissions={processedSubmissions}
            onStatusChange={handleStatusChange}
            onNoteChange={handleNoteChange}
            onFavouriteToggle={handleFavouriteToggle}
            onProblemOverrideChange={handleProblemOverrideChange}
            filterState={filterState}
            setFilterState={setFilterState}
            platform={platform}
          />
        )}
      </main>

      <footer style={styles.footer}>
        <div className="container" style={styles.footerContainer}>
          <p>© 2026 CodeTrack. Developed by <a href="https://github.com/Md5iam" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}>Md5iam</a>.</p>
          {isCloudActive && (
            <p style={styles.footerSub}>Synced with Supabase Cloud Database.</p>
          )}
        </div>
      </footer>

      <CloudSettingsModal 
        isOpen={isCloudModalOpen} 
        onClose={() => setIsCloudModalOpen(false)} 
        onConfigChange={handleCloudConfigChange} 
      />
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
