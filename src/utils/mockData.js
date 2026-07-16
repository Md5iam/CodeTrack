export const MOCK_USER_INFO = {
  handle: 'cp_legend',
  rating: 2154,
  maxRating: 2240,
  rank: 'master',
  maxRank: 'master',
  avatar: 'https://userpic.codeforces.org/no-avatar.jpg',
  titlePhoto: 'https://userpic.codeforces.org/no-title-photo.jpg',
  firstName: 'Code',
  lastName: 'Tracker',
  country: 'Bangladesh',
  city: 'Dhaka',
  organization: 'Competitive Programmers Association'
};

export const MOCK_RATING_HISTORY = [
  { contestId: 1900, contestName: 'Codeforces Round 910 (Div. 2)', handle: 'cp_legend', rank: 450, ratingUpdateTimeSeconds: 1700667300, oldRating: 1450, newRating: 1530 },
  { contestId: 1910, contestName: 'Codeforces Round 915 (Div. 2)', handle: 'cp_legend', rank: 250, ratingUpdateTimeSeconds: 1702913700, oldRating: 1530, newRating: 1640 },
  { contestId: 1920, contestName: 'Codeforces Round 920 (Div. 3)', handle: 'cp_legend', rank: 25, ratingUpdateTimeSeconds: 1705332900, oldRating: 1640, newRating: 1795 },
  { contestId: 1930, contestName: 'Codeforces Round 925 (Div. 2)', handle: 'cp_legend', rank: 180, ratingUpdateTimeSeconds: 1707838500, oldRating: 1795, newRating: 1880 },
  { contestId: 1940, contestName: 'Educational Codeforces Round 162 (Rated for Div. 2)', handle: 'cp_legend', rank: 540, ratingUpdateTimeSeconds: 1708702500, oldRating: 1880, newRating: 1860 },
  { contestId: 1950, contestName: 'Codeforces Round 937 (Div. 4)', handle: 'cp_legend', rank: 5, ratingUpdateTimeSeconds: 1711640100, oldRating: 1860, newRating: 2020 },
  { contestId: 1980, contestName: 'Codeforces Round 950 (Div. 3)', handle: 'cp_legend', rank: 12, ratingUpdateTimeSeconds: 1717428900, oldRating: 2020, newRating: 2154 }
];

export const MOCK_CONTESTS = [
  { id: 1989, name: 'Educational Codeforces Round 167 (Rated for Div. 2)', type: 'CF', phase: 'FINISHED', frozen: false, durationSeconds: 7200, startTimeSeconds: 1719498900 },
  { id: 1980, name: 'Codeforces Round 950 (Div. 3)', type: 'CF', phase: 'FINISHED', frozen: false, durationSeconds: 7200, startTimeSeconds: 1717428900 },
  { id: 1970, name: 'Codeforces Round 945 (Div. 2)', type: 'CF', phase: 'FINISHED', frozen: false, durationSeconds: 7200, startTimeSeconds: 1715957700 },
  { id: 1960, name: 'Codeforces Round 940 (Div. 1 + Div. 2)', type: 'CF', phase: 'FINISHED', frozen: false, durationSeconds: 7200, startTimeSeconds: 1713710700 },
  { id: 1950, name: 'Codeforces Round 937 (Div. 4)', type: 'CF', phase: 'FINISHED', frozen: false, durationSeconds: 7200, startTimeSeconds: 1711640100 },
  { id: 1940, name: 'Educational Codeforces Round 162 (Rated for Div. 2)', type: 'CF', phase: 'FINISHED', frozen: false, durationSeconds: 7200, startTimeSeconds: 1708702500 },
  { id: 1930, name: 'Codeforces Round 925 (Div. 2)', type: 'CF', phase: 'FINISHED', frozen: false, durationSeconds: 7200, startTimeSeconds: 1707838500 },
  { id: 1920, name: 'Codeforces Round 920 (Div. 3)', type: 'CF', phase: 'FINISHED', frozen: false, durationSeconds: 7200, startTimeSeconds: 1705332900 },
  { id: 1910, name: 'Codeforces Round 915 (Div. 2)', type: 'CF', phase: 'FINISHED', frozen: false, durationSeconds: 7200, startTimeSeconds: 1702913700 },
  { id: 1900, name: 'Codeforces Round 910 (Div. 2)', type: 'CF', phase: 'FINISHED', frozen: false, durationSeconds: 7200, startTimeSeconds: 1700667300 }
];

export const MOCK_SUBMISSIONS = [
  { id: 200001, contestId: 1980, creationTimeSeconds: 1717429500, relativeTimeSeconds: 600, verdict: 'OK', problem: { index: 'A', name: 'Problem A' }, author: { participantType: 'CONTESTANT' } },
  { id: 200002, contestId: 1980, creationTimeSeconds: 1717430400, relativeTimeSeconds: 1500, verdict: 'OK', problem: { index: 'B', name: 'Problem B' }, author: { participantType: 'CONTESTANT' } },
  { id: 200003, contestId: 1980, creationTimeSeconds: 1717431600, relativeTimeSeconds: 2700, verdict: 'WRONG_ANSWER', problem: { index: 'C', name: 'Problem C' }, author: { participantType: 'CONTESTANT' } },
  { id: 200004, contestId: 1980, creationTimeSeconds: 1717432200, relativeTimeSeconds: 3300, verdict: 'OK', problem: { index: 'C', name: 'Problem C' }, author: { participantType: 'CONTESTANT' } },
  { id: 200005, contestId: 1980, creationTimeSeconds: 1717434000, relativeTimeSeconds: 5100, verdict: 'OK', problem: { index: 'D', name: 'Problem D' }, author: { participantType: 'CONTESTANT' } },
  { id: 200006, contestId: 1980, creationTimeSeconds: 1717500000, relativeTimeSeconds: 71100, verdict: 'OK', problem: { index: 'E', name: 'Problem E' }, author: { participantType: 'PRACTICE' } },

  { id: 200011, contestId: 1989, creationTimeSeconds: 1719500000, relativeTimeSeconds: 1100, verdict: 'OK', problem: { index: 'A', name: 'Problem A' }, author: { participantType: 'VIRTUAL' } },
  { id: 200012, contestId: 1989, creationTimeSeconds: 1719502000, relativeTimeSeconds: 3100, verdict: 'OK', problem: { index: 'B', name: 'Problem B' }, author: { participantType: 'VIRTUAL' } },
  { id: 200013, contestId: 1989, creationTimeSeconds: 1719505000, relativeTimeSeconds: 6100, verdict: 'TIME_LIMIT_EXCEEDED', problem: { index: 'C', name: 'Problem C' }, author: { participantType: 'VIRTUAL' } },

  { id: 200021, contestId: 1970, creationTimeSeconds: 1716000000, relativeTimeSeconds: 42300, verdict: 'OK', problem: { index: 'A', name: 'Problem A' }, author: { participantType: 'PRACTICE' } },
  { id: 200022, contestId: 1970, creationTimeSeconds: 1716010000, relativeTimeSeconds: 52300, verdict: 'OK', problem: { index: 'B', name: 'Problem B' }, author: { participantType: 'PRACTICE' } },

  { id: 200031, contestId: 1950, creationTimeSeconds: 1711640500, relativeTimeSeconds: 400, verdict: 'OK', problem: { index: 'A', name: 'Problem A' }, author: { participantType: 'CONTESTANT' } },
  { id: 200032, contestId: 1950, creationTimeSeconds: 1711641000, relativeTimeSeconds: 900, verdict: 'OK', problem: { index: 'B', name: 'Problem B' }, author: { participantType: 'CONTESTANT' } },
  { id: 200033, contestId: 1950, creationTimeSeconds: 1711641500, relativeTimeSeconds: 1400, verdict: 'OK', problem: { index: 'C', name: 'Problem C' }, author: { participantType: 'CONTESTANT' } },
  { id: 200034, contestId: 1950, creationTimeSeconds: 1711642000, relativeTimeSeconds: 1900, verdict: 'OK', problem: { index: 'D', name: 'Problem D' }, author: { participantType: 'CONTESTANT' } },
  { id: 200035, contestId: 1950, creationTimeSeconds: 1711642500, relativeTimeSeconds: 2400, verdict: 'OK', problem: { index: 'E', name: 'Problem E' }, author: { participantType: 'CONTESTANT' } },
  { id: 200036, contestId: 1950, creationTimeSeconds: 1711643000, relativeTimeSeconds: 2900, verdict: 'OK', problem: { index: 'F', name: 'Problem F' }, author: { participantType: 'CONTESTANT' } }
];

export const MOCK_ATCODER_CONTESTS = [
  { id: 'abc358', name: 'AtCoder Beginner Contest 358', type: 'AtCoder', phase: 'FINISHED', frozen: false, durationSeconds: 6000, startTimeSeconds: 1718458800 },
  { id: 'abc352', name: 'AtCoder Beginner Contest 352', type: 'AtCoder', phase: 'FINISHED', frozen: false, durationSeconds: 6000, startTimeSeconds: 1714826400 },
  { id: 'abc351', name: 'AtCoder Beginner Contest 351', type: 'AtCoder', phase: 'FINISHED', frozen: false, durationSeconds: 6000, startTimeSeconds: 1714221600 },
  { id: 'arc175', name: 'AtCoder Regular Contest 175', type: 'AtCoder', phase: 'FINISHED', frozen: false, durationSeconds: 7200, startTimeSeconds: 1711285200 },
  { id: 'agc065', name: 'AtCoder Grand Contest 065', type: 'AtCoder', phase: 'FINISHED', frozen: false, durationSeconds: 10800, startTimeSeconds: 1702818000 }
];

export const MOCK_ATCODER_RATING_HISTORY = [
  { contestId: 'agc065', contestName: 'AtCoder Grand Contest 065', rank: 450, ratingUpdateTimeSeconds: 1702818000, oldRating: 1500, newRating: 1580 },
  { contestId: 'arc175', contestName: 'AtCoder Regular Contest 175', rank: 320, ratingUpdateTimeSeconds: 1711285200, oldRating: 1580, newRating: 1650 },
  { contestId: 'abc351', contestName: 'AtCoder Beginner Contest 351', rank: 110, ratingUpdateTimeSeconds: 1714221600, oldRating: 1650, newRating: 1790 },
  { contestId: 'abc352', contestName: 'AtCoder Beginner Contest 352', rank: 80, ratingUpdateTimeSeconds: 1714826400, oldRating: 1790, newRating: 1910 },
  { contestId: 'abc358', contestName: 'AtCoder Beginner Contest 358', rank: 45, ratingUpdateTimeSeconds: 1718458800, oldRating: 1910, newRating: 2050 }
];

export const MOCK_LEETCODE_CONTESTS = [
  { id: 'weekly-contest-400', name: 'Weekly Contest 400', type: 'LeetCode', phase: 'FINISHED', durationSeconds: 5400, startTimeSeconds: 1717293600, problemsSolved: 3, totalProblems: 4 },
  { id: 'biweekly-contest-130', name: 'Biweekly Contest 130', type: 'LeetCode', phase: 'FINISHED', durationSeconds: 5400, startTimeSeconds: 1715439600, problemsSolved: 4, totalProblems: 4 },
  { id: 'weekly-contest-390', name: 'Weekly Contest 390', type: 'LeetCode', phase: 'FINISHED', durationSeconds: 5400, startTimeSeconds: 1710640800, problemsSolved: 2, totalProblems: 4 },
  { id: 'weekly-contest-380', name: 'Weekly Contest 380', type: 'LeetCode', phase: 'FINISHED', durationSeconds: 5400, startTimeSeconds: 1704592800, problemsSolved: 1, totalProblems: 4 }
];

export const MOCK_LEETCODE_RATING_HISTORY = [
  { contestId: 'weekly-contest-380', contestName: 'Weekly Contest 380', rank: 12050, ratingUpdateTimeSeconds: 1704592800, oldRating: 1500, newRating: 1475, problemsSolved: 1, totalProblems: 4 },
  { contestId: 'weekly-contest-390', contestName: 'Weekly Contest 390', rank: 4500, ratingUpdateTimeSeconds: 1710640800, oldRating: 1475, newRating: 1585, problemsSolved: 2, totalProblems: 4 },
  { contestId: 'biweekly-contest-130', contestName: 'Biweekly Contest 130', rank: 850, ratingUpdateTimeSeconds: 1715439600, oldRating: 1585, newRating: 1750, problemsSolved: 4, totalProblems: 4 },
  { contestId: 'weekly-contest-400', contestName: 'Weekly Contest 400', rank: 2300, ratingUpdateTimeSeconds: 1717293600, oldRating: 1750, newRating: 1820, problemsSolved: 3, totalProblems: 4 }
];
