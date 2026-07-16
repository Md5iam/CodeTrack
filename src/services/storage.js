const HANDLE_KEY = 'cf_handle';
const CONTEST_DATA_KEY = 'cf_contest_user_data';

export function getHandle() {
  return localStorage.getItem(HANDLE_KEY) || '';
}

export function saveHandle(handle) {
  localStorage.setItem(HANDLE_KEY, handle.trim());
}

export function removeHandle() {
  localStorage.removeItem(HANDLE_KEY);
}

export function getContestUserData() {
  try {
    const data = localStorage.getItem(CONTEST_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to parse contest user data from localStorage', e);
    return {};
  }
}

export function saveContestUserData(data) {
  try {
    localStorage.setItem(CONTEST_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save contest user data to localStorage', e);
  }
}

export function updateContestStatus(contestId, status) {
  const data = getContestUserData();
  if (!data[contestId]) data[contestId] = {};
  data[contestId].status = status;
  saveContestUserData(data);
  return data;
}

export function updateContestNote(contestId, note) {
  const data = getContestUserData();
  if (!data[contestId]) data[contestId] = {};
  data[contestId].note = note;
  saveContestUserData(data);
  return data;
}

export function toggleContestFavourite(contestId) {
  const data = getContestUserData();
  if (!data[contestId]) data[contestId] = {};
  data[contestId].favourite = !data[contestId].favourite;
  saveContestUserData(data);
  return data;
}

// AtCoder Storage Helpers
const AT_HANDLE_KEY = 'at_handle';
const AT_CONTEST_DATA_KEY = 'at_contest_user_data';

export function getAtCoderHandle() {
  return localStorage.getItem(AT_HANDLE_KEY) || '';
}

export function saveAtCoderHandle(handle) {
  localStorage.setItem(AT_HANDLE_KEY, handle.trim());
}

export function removeAtCoderHandle() {
  localStorage.removeItem(AT_HANDLE_KEY);
}

export function getAtCoderContestUserData() {
  try {
    const data = localStorage.getItem(AT_CONTEST_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to parse AtCoder contest user data from localStorage', e);
    return {};
  }
}

export function saveAtCoderContestUserData(data) {
  try {
    localStorage.setItem(AT_CONTEST_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save AtCoder contest user data to localStorage', e);
  }
}

export function updateAtCoderContestStatus(contestId, status) {
  const data = getAtCoderContestUserData();
  if (!data[contestId]) data[contestId] = {};
  data[contestId].status = status;
  saveAtCoderContestUserData(data);
  return data;
}

export function updateAtCoderContestNote(contestId, note) {
  const data = getAtCoderContestUserData();
  if (!data[contestId]) data[contestId] = {};
  data[contestId].note = note;
  saveAtCoderContestUserData(data);
  return data;
}

export function toggleAtCoderContestFavourite(contestId) {
  const data = getAtCoderContestUserData();
  if (!data[contestId]) data[contestId] = {};
  data[contestId].favourite = !data[contestId].favourite;
  saveAtCoderContestUserData(data);
  return data;
}

export function updateProblemOverride(contestId, problemIndex, override, platform = 'codeforces') {
  let data;
  if (platform === 'codeforces') data = getContestUserData();
  else if (platform === 'atcoder') data = getAtCoderContestUserData();
  else data = getLeetCodeContestUserData();

  if (!data[contestId]) data[contestId] = {};
  if (!data[contestId].problemOverrides) data[contestId].problemOverrides = {};
  
  if (override === 'default') {
    delete data[contestId].problemOverrides[problemIndex];
  } else {
    data[contestId].problemOverrides[problemIndex] = override;
  }
  
  if (platform === 'codeforces') {
    saveContestUserData(data);
  } else if (platform === 'atcoder') {
    saveAtCoderContestUserData(data);
  } else {
    saveLeetCodeContestUserData(data);
  }
  return data;
}

// LeetCode Storage Helpers
const LC_HANDLE_KEY = 'lc_handle';
const LC_CONTEST_DATA_KEY = 'lc_contest_user_data';

export function getLeetCodeHandle() {
  return localStorage.getItem(LC_HANDLE_KEY) || '';
}

export function saveLeetCodeHandle(handle) {
  localStorage.setItem(LC_HANDLE_KEY, handle.trim());
}

export function removeLeetCodeHandle() {
  localStorage.removeItem(LC_HANDLE_KEY);
}

export function getLeetCodeContestUserData() {
  try {
    const data = localStorage.getItem(LC_CONTEST_DATA_KEY);
    return data ? JSON.parse(data) : {};
  } catch (e) {
    console.error('Failed to parse LeetCode contest user data from localStorage', e);
    return {};
  }
}

export function saveLeetCodeContestUserData(data) {
  try {
    localStorage.setItem(LC_CONTEST_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save LeetCode contest user data to localStorage', e);
  }
}

export function updateLeetCodeContestStatus(contestId, status) {
  const data = getLeetCodeContestUserData();
  if (!data[contestId]) data[contestId] = {};
  data[contestId].status = status;
  saveLeetCodeContestUserData(data);
  return data;
}

export function updateLeetCodeContestNote(contestId, note) {
  const data = getLeetCodeContestUserData();
  if (!data[contestId]) data[contestId] = {};
  data[contestId].note = note;
  saveLeetCodeContestUserData(data);
  return data;
}

export function toggleLeetCodeContestFavourite(contestId) {
  const data = getLeetCodeContestUserData();
  if (!data[contestId]) data[contestId] = {};
  data[contestId].favourite = !data[contestId].favourite;
  saveLeetCodeContestUserData(data);
  return data;
}

export function getLeetCodeApiUrl() {
  return localStorage.getItem('lc_custom_api_url') || 'https://alfa-leetcode-api.onrender.com';
}

export function saveLeetCodeApiUrl(url) {
  if (url && url.trim()) {
    localStorage.setItem('lc_custom_api_url', url.trim().replace(/\/$/, ''));
  } else {
    localStorage.removeItem('lc_custom_api_url');
  }
}
