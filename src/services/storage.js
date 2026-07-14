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
