import { createClient } from '@supabase/supabase-js';

const URL_KEY = 'cf_supabase_url';
const ANON_KEY_KEY = 'cf_supabase_key';

export function getSupabaseCredentials() {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey) {
    return { url: envUrl, key: envKey, source: 'env' };
  }

  const localUrl = localStorage.getItem(URL_KEY) || '';
  const localKey = localStorage.getItem(ANON_KEY_KEY) || '';

  if (localUrl && localKey) {
    return { url: localUrl, key: localKey, source: 'local' };
  }

  return null;
}

export function saveSupabaseCredentials(url, key) {
  if (url && key) {
    localStorage.setItem(URL_KEY, url.trim());
    localStorage.setItem(ANON_KEY_KEY, key.trim());
    // Force recreation of client on next retrieval
    supabaseClient = null;
    return true;
  }
  return false;
}

export function clearSupabaseCredentials() {
  localStorage.removeItem(URL_KEY);
  localStorage.removeItem(ANON_KEY_KEY);
  supabaseClient = null;
}

let supabaseClient = null;

export function getSupabaseClient() {
  const creds = getSupabaseCredentials();
  if (!creds) return null;
  
  if (!supabaseClient) {
    supabaseClient = createClient(creds.url, creds.key);
  }
  return supabaseClient;
}

export function isSupabaseConfigured() {
  return getSupabaseCredentials() !== null;
}

// Fetch all user contest data from Supabase for a given platform
export async function fetchCloudContestData(handle, platform = 'codeforces') {
  const client = getSupabaseClient();
  if (!client) return {};

  const { data, error } = await client
    .from('codetrack_contest_data')
    .select('contest_id, status, note, favourite, problem_overrides')
    .eq('handle', handle.toLowerCase())
    .eq('platform', platform);

  if (error) {
    throw error;
  }

  const result = {};
  data.forEach(row => {
    result[row.contest_id] = {
      status: row.status || '',
      note: row.note || '',
      favourite: !!row.favourite,
      problemOverrides: row.problem_overrides || {}
    };
  });
  return result;
}

// Upsert a single contest tracking record to Supabase
export async function upsertCloudContestData(handle, contestId, updates, platform = 'codeforces') {
  const client = getSupabaseClient();
  if (!client) return;

  const payload = {
    handle: handle.toLowerCase(),
    platform,
    contest_id: String(contestId),
    status: updates.status !== undefined ? updates.status : '',
    note: updates.note !== undefined ? updates.note : '',
    favourite: updates.favourite !== undefined ? !!updates.favourite : false,
    problem_overrides: updates.problemOverrides !== undefined ? updates.problemOverrides : {},
    updated_at: new Date().toISOString()
  };

  const { error } = await client
    .from('codetrack_contest_data')
    .upsert(payload, { onConflict: 'handle,platform,contest_id' });

  if (error) {
    throw error;
  }
}
