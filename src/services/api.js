const BASE_URL = 'https://codeforces.com/api';

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

export async function fetchContestList() {
  const CACHE_KEY = 'cf_contests_cache';
  const CACHE_TIME_KEY = 'cf_contests_cache_time';
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

  const cachedData = localStorage.getItem(CACHE_KEY);
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);

  if (cachedData && cachedTime && (Date.now() - parseInt(cachedTime, 10) < CACHE_DURATION)) {
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
