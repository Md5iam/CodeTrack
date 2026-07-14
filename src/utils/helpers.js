export function getContestDivision(name) {
  if (name.includes('Div. 1 + Div. 2') || name.includes('Div. 1+2')) return 'Div. 1 + Div. 2';
  if (name.includes('Div. 1')) return 'Div. 1';
  if (name.includes('Div. 2')) return 'Div. 2';
  if (name.includes('Div. 3')) return 'Div. 3';
  if (name.includes('Div. 4')) return 'Div. 4';
  if (name.includes('Educational')) return 'Educational';
  if (name.includes('Global Round')) return 'Global Round';
  if (name.includes('Kotlin Heroes')) return 'Kotlin Heroes';
  return 'Other';
}

export function formatUnixDate(timestamp) {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function processContestSubmissions(submissions = [], ratingHistory = [], contestsList = []) {
  // 1. Group submissions by contestId
  const contestSubmissions = {};
  submissions.forEach(sub => {
    const cid = sub.contestId;
    if (!cid) return;
    if (!contestSubmissions[cid]) {
      contestSubmissions[cid] = [];
    }
    contestSubmissions[cid].push(sub);
  });

  // 2. Identify official contests from ratingHistory
  const officialContests = new Set();
  ratingHistory.forEach(r => {
    if (r.contestId) officialContests.add(r.contestId);
  });

  // 3. Create a map of contests by id for quick duration lookup
  const contestDurations = {};
  contestsList.forEach(c => {
    contestDurations[c.id] = c.durationSeconds || 7200; // default 2 hours
  });

  const processed = {};

  Object.keys(contestSubmissions).forEach(cidStr => {
    const cid = parseInt(cidStr, 10);
    const subs = contestSubmissions[cid];
    const duration = contestDurations[cid] || 7200;

    const attempted = new Set();
    const solvedDuring = new Set();
    const solvedTotal = new Set();

    let hasVirtual = false;
    let hasOfficialSub = false;
    let hasPractice = false;

    subs.forEach(sub => {
      const pIndex = sub.problem.index;
      attempted.add(pIndex);

      const pType = sub.author.participantType;
      if (pType === 'CONTESTANT' || pType === 'OUT_OF_COMPETITION') {
        hasOfficialSub = true;
      } else if (pType === 'VIRTUAL') {
        hasVirtual = true;
      } else if (pType === 'PRACTICE') {
        hasPractice = true;
      }

      if (sub.verdict === 'OK') {
        solvedTotal.add(pIndex);
        // Solved during contest if:
        // - participantType is official contestant/virtual/out of competition, and
        // - relativeTimeSeconds is within contest duration
        const isDuring = (pType === 'CONTESTANT' || pType === 'VIRTUAL' || pType === 'OUT_OF_COMPETITION') && 
                         (sub.relativeTimeSeconds !== undefined && sub.relativeTimeSeconds <= duration);
        
        if (isDuring) {
          solvedDuring.add(pIndex);
        }
      }
    });

    const solvedAfter = new Set();
    solvedTotal.forEach(pIndex => {
      if (!solvedDuring.has(pIndex)) {
        solvedAfter.add(pIndex);
      }
    });

    // Determine participation type
    let participation = 'NONE';
    if (officialContests.has(cid) || hasOfficialSub) {
      participation = 'OFFICIAL';
    } else if (hasVirtual) {
      participation = 'VIRTUAL';
    } else if (hasPractice || subs.length > 0) {
      participation = 'PRACTICE';
    }

    processed[cid] = {
      participation,
      solvedDuring: solvedDuring.size,
      solvedAfter: solvedAfter.size,
      totalSolved: solvedTotal.size,
      totalAttempted: attempted.size,
      attemptedProblems: Array.from(attempted),
      solvedProblems: Array.from(solvedTotal),
      solvedDuringProblems: Array.from(solvedDuring)
    };
  });

  return processed;
}

export function calculateDashboardStats(userInfo, ratingHistory = [], processedSubmissions = {}, userContestData = {}) {
  const currentRating = userInfo?.rating || 0;
  const maxRating = userInfo?.maxRating || 0;
  const totalOfficial = ratingHistory?.length || 0;

  // Calculate total virtual contests
  let totalVirtual = 0;
  Object.values(processedSubmissions).forEach(data => {
    if (data.participation === 'VIRTUAL') {
      totalVirtual++;
    }
  });

  // Calculate total unique problems solved
  const uniqueSolvedProblems = new Set();
  Object.keys(processedSubmissions).forEach(cid => {
    const data = processedSubmissions[cid];
    data.solvedProblems.forEach(pIndex => {
      uniqueSolvedProblems.add(`${cid}-${pIndex}`);
    });
  });
  const totalUniqueSolved = uniqueSolvedProblems.size;

  // Completed & Needing Upsolving contests
  let completedContests = 0;
  let needUpsolvingContests = 0;

  Object.values(userContestData).forEach(data => {
    if (data.status === 'Completed') {
      completedContests++;
    } else if (data.status === 'Need to Upsolve' || data.status === 'Upsolving') {
      needUpsolvingContests++;
    }
  });

  return {
    currentRating,
    maxRating,
    rank: userInfo?.rank || 'unrated',
    maxRank: userInfo?.maxRank || 'unrated',
    avatar: userInfo?.avatar || '',
    titlePhoto: userInfo?.titlePhoto || '',
    totalOfficial,
    totalVirtual,
    totalUniqueSolved,
    completedContests,
    needUpsolvingContests
  };
}

export function getRankColorClass(rank = '') {
  const r = rank.toLowerCase();
  if (r.includes('legendary grandmaster') || r.includes('tourist')) return 'rank-legendary';
  if (r.includes('international grandmaster')) return 'rank-intl-grandmaster';
  if (r.includes('grandmaster')) return 'rank-grandmaster';
  if (r.includes('international master')) return 'rank-intl-master';
  if (r.includes('master')) return 'rank-master';
  if (r.includes('candidate master')) return 'rank-candidate-master';
  if (r.includes('expert')) return 'rank-expert';
  if (r.includes('specialist')) return 'rank-specialist';
  if (r.includes('pupil')) return 'rank-pupil';
  if (r.includes('newbie')) return 'rank-newbie';
  return 'rank-unrated';
}
