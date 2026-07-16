const BASE_URL = 'https://codeforces.com/api';

const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.port !== '');

function getAtCoderUrl(path) {
  if (isLocal) {
    return `/api-atcoder${path}`;
  }
  return `https://atcoder.jp${path}`;
}

function getKenkooooUrl(path) {
  if (isLocal) {
    return `/api-kenkoooo${path}`;
  }
  return `https://kenkoooo.com${path}`;
}

import { getLeetCodeApiUrl } from './storage';

const DEFAULT_LEETCODE_API = 'https://alfa-leetcode-api-x9i6.vercel.app';

function getLeetCodeUrl(path) {
  const customUrl = getLeetCodeApiUrl();
  
  // Use custom user-configured LeetCode API if provided and different from old default
  if (customUrl && customUrl !== 'https://alfa-leetcode-api.onrender.com') {
    return `${customUrl}${path}`;
  }
  
  // Use our own Vercel deployment — always on, no rate limit, no cold start
  return `${DEFAULT_LEETCODE_API}${path}`;
}

export async function fetchUserInfo(handle) {
  const url = `${BASE_URL}/user.info?handles=${encodeURIComponent(handle)}`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 503 || response.status === 429) {
      throw new Error('Codeforces API is currently rate-limited or busy. Please try again in a few seconds.');
    }
    throw new Error(`HTTP Error: ${response.status}`);
  }
  const data = await response.json();
  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Failed to fetch user info');
  }
  return data.result[0];
}

export async function fetchUserRating(handle) {
  const url = `${BASE_URL}/user.rating?handle=${encodeURIComponent(handle)}`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 503 || response.status === 429) {
      throw new Error('Codeforces API is busy. Rating history could not be retrieved.');
    }
    throw new Error(`HTTP Error: ${response.status}`);
  }
  const data = await response.json();
  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Failed to fetch rating history');
  }
  return data.result;
}

export async function fetchUserStatus(handle) {
  const url = `${BASE_URL}/user.status?handle=${encodeURIComponent(handle)}`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 503 || response.status === 429) {
      throw new Error('Codeforces API is busy. Submissions history could not be retrieved.');
    }
    throw new Error(`HTTP Error: ${response.status}`);
  }
  const data = await response.json();
  if (data.status !== 'OK') {
    throw new Error(data.comment || 'Failed to fetch submissions');
  }
  return data.result;
}

export async function fetchContestList(bypassCache = false) {
  const CACHE_KEY = 'cf_contests_cache';
  const CACHE_TIME_KEY = 'cf_contests_cache_time';
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

  if (!bypassCache && cachedData && cachedTime && (Date.now() - parseInt(cachedTime, 10) < CACHE_DURATION)) {
    try {
      return JSON.parse(cachedData);
    } catch (e) {
      console.error('Failed to parse cached contests', e);
    }
  }

  try {
    const url = `${BASE_URL}/contest.list?gym=false`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }
    const data = await response.json();
    if (data.status !== 'OK') {
      throw new Error(data.comment || 'Failed to fetch contests');
    }
    
    // Sort contests by startTimeSeconds descending (newest first) by default
    const contests = data.result;
    contests.sort((a, b) => (b.startTimeSeconds || 0) - (a.startTimeSeconds || 0));

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(contests));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (e) {
      console.warn('LocalStorage quota exceeded for contest list cache', e);
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIME_KEY);
    }
    return contests;
  } catch (err) {
    if (cachedData) {
      console.warn('API request failed, using expired cache as fallback', err);
      try {
        return JSON.parse(cachedData);
      } catch (e) {}
    }
    throw err;
  }
}

// ═══════════════════════════════════════
// ATCODER API INTEGRATION
// ═══════════════════════════════════════

export function getAtCoderRank(rating) {
  if (rating === 0) return 'Grey';
  if (rating < 400) return 'Grey';
  if (rating < 800) return 'Brown';
  if (rating < 1200) return 'Green';
  if (rating < 1600) return 'Cyan';
  if (rating < 2000) return 'Blue';
  if (rating < 2400) return 'Yellow';
  if (rating < 2800) return 'Orange';
  return 'Red';
}

export async function fetchAtCoderUserRating(handle) {
  const path = `/users/${encodeURIComponent(handle)}/history/json`;
  
  if (isLocal) {
    const response = await fetch(getAtCoderUrl(path));
    if (!response.ok) {
      throw new Error(`AtCoder user '${handle}' not found or rating history is unavailable.`);
    }
    const history = await response.json();
    if (!Array.isArray(history)) {
      throw new Error(`Invalid response for user '${handle}'.`);
    }
    return history.map(h => ({
      contestId: h.ContestScreenName,
      contestName: h.ContestName,
      rank: h.Place,
      oldRating: h.OldRating,
      newRating: h.NewRating,
      ratingUpdateTimeSeconds: Math.floor(new Date(h.EndTime).getTime() / 1000)
    }));
  }

  const targetUrl = `https://atcoder.jp${path}`;
  
  // 1. Try corsproxy.io first (fast and does not rate-limit localhosts; URL must be unencoded)
  try {
    const response = await fetch(`https://corsproxy.io/?${targetUrl}`);
    if (response.ok) {
      const history = await response.json();
      if (Array.isArray(history)) {
        return history.map(h => ({
          contestId: h.ContestScreenName,
          contestName: h.ContestName,
          rank: h.Place,
          oldRating: h.OldRating,
          newRating: h.NewRating,
          ratingUpdateTimeSeconds: Math.floor(new Date(h.EndTime).getTime() / 1000)
        }));
      }
    }
  } catch (err) {
    console.warn('Corsproxy.io failed, trying fallback to allorigins...', err);
  }

  // 2. Fallback to allorigins proxy
  try {
    const response = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`);
    if (response.ok) {
      const history = await response.json();
      if (Array.isArray(history)) {
        return history.map(h => ({
          contestId: h.ContestScreenName,
          contestName: h.ContestName,
          rank: h.Place,
          oldRating: h.OldRating,
          newRating: h.NewRating,
          ratingUpdateTimeSeconds: Math.floor(new Date(h.EndTime).getTime() / 1000)
        }));
      }
    }
  } catch (err) {
    console.warn('Allorigins proxy failed, trying fallback to codetabs...', err);
  }

  // 3. Fallback to codetabs proxy
  try {
    const response = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
    if (response.ok) {
      const history = await response.json();
      if (Array.isArray(history)) {
        return history.map(h => ({
          contestId: h.ContestScreenName,
          contestName: h.ContestName,
          rank: h.Place,
          oldRating: h.OldRating,
          newRating: h.NewRating,
          ratingUpdateTimeSeconds: Math.floor(new Date(h.EndTime).getTime() / 1000)
        }));
      }
    }
  } catch (err) {
    console.error('All proxies failed.', err);
  }

  throw new Error(`AtCoder user '${handle}' not found or rating history could not be fetched due to CORS proxy blockages.`);
}

export async function fetchAtCoderUserInfo(handle) {
  const history = await fetchAtCoderUserRating(handle);
  const currentRating = history.length > 0 ? history[history.length - 1].newRating : 0;
  const maxRating = history.length > 0 ? Math.max(...history.map(h => h.newRating)) : 0;

  const rank = getAtCoderRank(currentRating);
  const maxRank = getAtCoderRank(maxRating);

  return {
    profile: {
      handle,
      rank,
      maxRank,
      rating: currentRating,
      maxRating,
      avatar: 'https://img.atcoder.jp/assets/icon/avatar.png',
      contestCount: history.length
    },
    history
  };
}

export async function fetchAtCoderSubmissions(handle) {
  const path = `/atcoder-api/v3/user/submissions?user=${encodeURIComponent(handle)}&from_second=0`;
  
  if (isLocal) {
    const response = await fetch(getKenkooooUrl(path));
    if (!response.ok) {
      throw new Error(`Failed to fetch AtCoder submissions for user '${handle}'.`);
    }
    return await response.json();
  }

  const targetUrl = `https://kenkoooo.com${path}`;
  try {
    const response = await fetch(`https://corsproxy.io/?${targetUrl}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    console.warn('Corsproxy failed for submissions, attempting direct fetch...', err);
  }
  
  const response = await fetch(targetUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch AtCoder submissions for user '${handle}'.`);
  }
  return await response.json();
}

export async function fetchAtCoderContestList(bypassCache = false) {
  const CACHE_KEY = 'at_contests_cache';
  const CACHE_TIME_KEY = 'at_contests_cache_time';
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

  if (!bypassCache && cachedData && cachedTime && (Date.now() - parseInt(cachedTime, 10) < CACHE_DURATION)) {
    try {
      return JSON.parse(cachedData);
    } catch (e) {
      console.error('Failed to parse cached AtCoder contests', e);
    }
  }

  try {
    const path = '/atcoder/resources/contests.json';
    let data;
    
    if (isLocal) {
      const response = await fetch(getKenkooooUrl(path));
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      data = await response.json();
    } else {
      const targetUrl = `https://kenkoooo.com${path}`;
      try {
        const response = await fetch(`https://corsproxy.io/?${targetUrl}`);
        if (response.ok) {
          data = await response.json();
        } else {
          throw new Error();
        }
      } catch (e) {
        console.warn('Corsproxy failed for AtCoder contests list, attempting direct fetch...', e);
        const response = await fetch(targetUrl);
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        data = await response.json();
      }
    }
    
    // Map AtCoder contests to Codeforces shape
    const now = Math.floor(Date.now() / 1000);
    const contests = data.map(c => {
      const start = c.start_epoch_second;
      const duration = c.duration_second;
      const end = start + duration;
      
      let phase = 'FINISHED';
      if (start > now) {
        phase = 'BEFORE';
      } else if (start <= now && end > now) {
        phase = 'CODING';
      }

      return {
        id: c.id,
        name: c.title,
        type: 'AtCoder',
        phase: phase,
        frozen: false,
        durationSeconds: duration,
        startTimeSeconds: start,
        relativeTimeSeconds: now - start
      };
    });

    // Sort newest first
    contests.sort((a, b) => (b.startTimeSeconds || 0) - (a.startTimeSeconds || 0));

    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(contests));
      localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
    } catch (e) {
      console.warn('LocalStorage quota exceeded for AtCoder cache', e);
    }
    return contests;
  } catch (err) {
    if (cachedData) {
      try {
        return JSON.parse(cachedData);
      } catch (e) {}
    }
    throw err;
  }
}

export async function fetchLeetCodeUserInfo(handle) {
  const cleanHandle = handle.trim();
  const profileUrl = getLeetCodeUrl(`/${cleanHandle}`);
  const solvedUrl = getLeetCodeUrl(`/${cleanHandle}/solved`);
  const contestUrl = getLeetCodeUrl(`/${cleanHandle}/contest`);

  const [profileRes, solvedRes, contestRes] = await Promise.all([
    fetch(profileUrl),
    fetch(solvedUrl),
    fetch(contestUrl)
  ]);

  if (!profileRes.ok) {
    throw new Error(`User '${handle}' not found on LeetCode.`);
  }

  const profileData = await profileRes.json();
  const solvedData = solvedRes.ok ? await solvedRes.json() : { solvedProblem: 0, easySolved: 0, mediumSolved: 0, hardSolved: 0 };
  const contestData = contestRes.ok ? await contestRes.json() : { contestRating: 1500, contestGlobalRanking: 0, contestParticipation: [] };

  const currentRating = contestData.contestRating ? Math.round(contestData.contestRating) : 1500;
  
  const history = (contestData.contestParticipation || [])
    .filter(c => c.attended)
    .map(c => ({
      contestId: c.contest.title.toLowerCase().replace(/ /g, '-'),
      contestName: c.contest.title,
      rank: c.ranking,
      rating: Math.round(c.rating),
      problemsSolved: c.problemsSolved,
      totalProblems: c.totalProblems,
      startTime: c.contest.startTime,
      newRating: Math.round(c.rating),
      oldRating: 0
    }));

  history.sort((a, b) => a.startTime - b.startTime);

  for (let i = 1; i < history.length; i++) {
    history[i].oldRating = history[i - 1].newRating;
  }
  if (history.length > 0) {
    history[0].oldRating = 1500;
  }

  const maxRating = history.length > 0 ? Math.max(...history.map(h => h.newRating)) : currentRating;

  const getLeetCodeRankName = (r) => {
    if (r >= 2200) return 'Guardian';
    if (r >= 1600) return 'Knight';
    return 'Standard';
  };

  const rank = getLeetCodeRankName(currentRating);
  const maxRank = getLeetCodeRankName(maxRating);

  return {
    profile: {
      handle: cleanHandle,
      name: profileData.name || cleanHandle,
      rank,
      maxRank,
      rating: currentRating,
      maxRating,
      avatar: profileData.avatar || 'https://assets.leetcode.com/users/default_avatar.jpg',
      contestCount: history.length,
      solvedStats: {
        easy: solvedData.easySolved || 0,
        medium: solvedData.mediumSolved || 0,
        hard: solvedData.hardSolved || 0,
        total: solvedData.solvedProblem || 0
      }
    },
    history
  };
}

export async function fetchLeetCodeSubmissions(handle) {
  const url = getLeetCodeUrl(`/${handle.trim()}/acSubmission?limit=100`);
  const response = await fetch(url);
  if (!response.ok) {
    return [];
  }
  const data = await response.json();
  return data.submission || [];
}

export async function fetchLeetCodeContestList(history = []) {
  // Try to load cached preprocessed contests
  let cached = null;
  try {
    const dataStr = localStorage.getItem('lc_all_contests_cache');
    const timeStr = localStorage.getItem('lc_all_contests_cache_time');
    if (dataStr && timeStr && (Date.now() - Number(timeStr) < 24 * 60 * 60 * 1000)) {
      cached = JSON.parse(dataStr);
    }
  } catch (e) {
    console.warn('Failed to parse cached LeetCode contests', e);
  }

  let rawData = [];
  if (cached) {
    rawData = cached;
  } else {
    try {
      const res = await fetch('https://raw.githubusercontent.com/zerotrac/leetcode_problem_rating/main/data.json');
      if (res.ok) {
        const fullData = await res.json();
        
        // Group problems by contest
        const contestMap = {};
        fullData.forEach(p => {
          const slug = p.ContestSlug;
          if (!slug) return;
          if (!contestMap[slug]) {
            let startTimeSeconds = 0;
            const matchWeekly = slug.match(/^weekly-contest-(\d+)$/);
            const matchBiweekly = slug.match(/^biweekly-contest-(\d+)$/);
            if (matchWeekly) {
              const num = parseInt(matchWeekly[1], 10);
              startTimeSeconds = 1717295400 + (num - 400) * 7 * 24 * 3600;
            } else if (matchBiweekly) {
              const num = parseInt(matchBiweekly[1], 10);
              startTimeSeconds = 1715437800 + (num - 130) * 14 * 24 * 3600;
            }
            contestMap[slug] = {
              id: slug,
              name: p.ContestID_en || slug,
              startTimeSeconds,
              durationSeconds: 5400,
              type: 'LeetCode',
              phase: 'FINISHED',
              problems: []
            };
          }
          
          // Deduplicate problem index listings inside same contest
          const existingProblems = contestMap[slug].problems;
          const idx = p.ProblemIndex || 'Q1';
          if (!existingProblems.some(ep => ep.index === idx)) {
            existingProblems.push({
              index: idx,
              title: p.Title || '',
              titleSlug: p.TitleSlug || '',
              rating: p.Rating ? Math.round(p.Rating) : null
            });
          }
        });

        // Convert map to list and sort by startTimeSeconds descending (newest first)
        const contestList = Object.values(contestMap).sort((a, b) => b.startTimeSeconds - a.startTimeSeconds);
        
        // Cache it
        localStorage.setItem('lc_all_contests_cache', JSON.stringify(contestList));
        localStorage.setItem('lc_all_contests_cache_time', String(Date.now()));
        rawData = contestList;
      }
    } catch (err) {
      console.warn('Failed to fetch all contests list from Github, using fallback', err);
    }
  }

  // Fallback if fetch failed and no cache exists
  if (rawData.length === 0) {
    rawData = history.map(h => ({
      id: h.contestId,
      name: h.contestName,
      startTimeSeconds: h.startTime,
      durationSeconds: 5400,
      type: 'LeetCode',
      phase: 'FINISHED',
      problems: [
        { index: 'Q1', title: 'Question 1', titleSlug: '', rating: null },
        { index: 'Q2', title: 'Question 2', titleSlug: '', rating: null },
        { index: 'Q3', title: 'Question 3', titleSlug: '', rating: null },
        { index: 'Q4', title: 'Question 4', titleSlug: '', rating: null }
      ]
    }));
  }

  // Map user history results on top of all contests list
  const historyMap = {};
  history.forEach(h => {
    historyMap[h.contestId] = h;
  });

  return rawData.map(c => {
    const userContest = historyMap[c.id];
    return {
      ...c,
      problemsSolved: userContest ? userContest.problemsSolved : 0,
      totalProblems: c.problems?.length || 4,
      attended: userContest ? userContest.attended : false,
      userRating: userContest ? userContest.rating : null,
      userRanking: userContest ? userContest.ranking : null
    };
  });
}

