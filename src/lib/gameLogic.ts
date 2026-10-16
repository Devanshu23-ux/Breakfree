import { IBadge, ILevel, ISOSActivity } from '@/types';

// ─── LEVELS ────────────────────────────────────────────────────────────────
export const LEVELS: ILevel[] = [
  { level: 1, name: 'Starter',   minPoints: 0,    maxPoints: 99   },
  { level: 2, name: 'Fighter',   minPoints: 100,  maxPoints: 299  },
  { level: 3, name: 'Warrior',   minPoints: 300,  maxPoints: 599  },
  { level: 4, name: 'Champion',  minPoints: 600,  maxPoints: 999  },
  { level: 5, name: 'Legend',    minPoints: 1000, maxPoints: 99999},
];

export function getLevel(points: number): ILevel {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (points >= LEVELS[i].minPoints) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getLevelProgress(points: number): number {
  const lvl = getLevel(points);
  if (lvl.level === 5) return 100;
  const range = lvl.maxPoints - lvl.minPoints + 1;
  const earned = points - lvl.minPoints;
  return Math.min(100, Math.floor((earned / range) * 100));
}

export function getNextLevel(points: number): ILevel | null {
  const lvl = getLevel(points);
  return LEVELS.find(l => l.level === lvl.level + 1) ?? null;
}

// ─── BADGES ────────────────────────────────────────────────────────────────
export function getBadges(user: {
  points: number;
  streak: number;
  quitStartTime: string;
}): IBadge[] {
  const daysFree = getDaysFree(user.quitStartTime);

  return [
    {
      id: 'first_step',
      icon: '🌱',
      name: 'First Step',
      description: 'Complete your first free day',
      unlocked: daysFree >= 1,
    },
    {
      id: 'on_fire',
      icon: '🔥',
      name: 'On Fire',
      description: 'Maintain a 7-day streak',
      unlocked: user.streak >= 7,
    },
    {
      id: 'one_month',
      icon: '💪',
      name: 'One Month Strong',
      description: 'Stay free for 30 days',
      unlocked: daysFree >= 30,
    },
    {
      id: 'point_master',
      icon: '⭐',
      name: 'Point Master',
      description: 'Earn 500 points',
      unlocked: user.points >= 500,
    },
    {
      id: 'legend',
      icon: '👑',
      name: 'Legend',
      description: 'Reach Level 5',
      unlocked: getLevel(user.points).level === 5,
    },
    {
      id: 'sos_hero',
      icon: '🆘',
      name: 'SOS Hero',
      description: 'Earn 100+ points',
      unlocked: user.points >= 100,
    },
  ];
}

// ─── TIME HELPERS ───────────────────────────────────────────────────────────
export function getDaysFree(quitStartTime: string): number {
  const diff = Date.now() - new Date(quitStartTime).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export function getMoneySaved(moneySavedPerDay: number, quitStartTime: string): number {
  return Math.floor(getDaysFree(quitStartTime) * moneySavedPerDay);
}

export function getTimeFree(quitStartTime: string): {
  days: number; hours: number; minutes: number; seconds: number;
} {
  const diff = Math.max(0, Date.now() - new Date(quitStartTime).getTime());
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

// ─── STREAK LOGIC ───────────────────────────────────────────────────────────
export function computeCheckinResult(lastCheckin: string | null | undefined, currentStreak: number): {
  newStreak: number;
  bonusPoints: number;
  alreadyCheckedIn: boolean;
} {
  const now = new Date();
  const todayStr = now.toDateString();

  if (lastCheckin) {
    const lastDate = new Date(lastCheckin);
    if (lastDate.toDateString() === todayStr) {
      return { newStreak: currentStreak, bonusPoints: 0, alreadyCheckedIn: true };
    }
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (lastDate.toDateString() === yesterday.toDateString()) {
      const newStreak = currentStreak + 1;
      const bonusPoints = newStreak === 7 ? 200 : newStreak === 30 ? 500 : 0;
      return { newStreak, bonusPoints, alreadyCheckedIn: false };
    }
  }
  // First checkin or streak broken
  return { newStreak: 1, bonusPoints: 0, alreadyCheckedIn: false };
}

// ─── SOS ACTIVITIES ────────────────────────────────────────────────────────
export const SOS_ACTIVITIES: ISOSActivity[] = [
  {
    id: 'deep_breathing',
    emoji: '🌬️',
    title: 'Box Breathing',
    description: 'A powerful technique to calm your mind instantly',
    duration: '5 minutes',
    steps: [
      'Sit comfortably and close your eyes',
      'Inhale slowly for 4 counts',
      'Hold your breath for 4 counts',
      'Exhale slowly for 4 counts',
      'Hold empty for 4 counts',
      'Repeat 5–6 times',
    ],
  },
  {
    id: 'cold_water',
    emoji: '💧',
    title: 'Cold Water Reset',
    description: 'Splash cold water on your face to break the craving cycle',
    duration: '2 minutes',
    steps: [
      'Go to the nearest sink',
      'Run cold water over your wrists for 30 seconds',
      'Splash cold water on your face',
      'Take 5 deep breaths',
      'Drink a full glass of water slowly',
    ],
  },
  {
    id: 'count_backwards',
    emoji: '🔢',
    title: 'Count Backwards',
    description: 'Distract your brain by focusing on counting',
    duration: '3 minutes',
    steps: [
      'Find a quiet spot',
      'Close your eyes',
      'Count backwards from 100 by 3s: 100, 97, 94...',
      'If you lose track, start again from where you lost it',
      'Keep going until the craving passes',
    ],
  },
  {
    id: 'quick_stretch',
    emoji: '🧘',
    title: 'Quick Stretch',
    description: 'Release tension trapped in your body',
    duration: '5 minutes',
    steps: [
      'Stand up straight',
      'Roll your shoulders backward 5 times',
      'Slowly tilt your head left, hold 10 seconds',
      'Tilt right, hold 10 seconds',
      'Reach arms overhead, hold 15 seconds',
      'Bend forward to touch your toes, hold 10 seconds',
    ],
  },
  {
    id: 'doodle',
    emoji: '✏️',
    title: 'Doodle It Out',
    description: 'Let your hand wander — no artistic skill needed',
    duration: '5 minutes',
    steps: [
      'Grab any piece of paper and a pen',
      'Draw random shapes without lifting your pen',
      'Shade in random sections',
      'Write the name of the craving and cross it out',
      'Draw how you will feel tomorrow without giving in',
    ],
  },
  {
    id: 'walk',
    emoji: '🚶',
    title: 'Quick Walk',
    description: 'Change your environment to break the craving',
    duration: '5 minutes',
    steps: [
      'Stand up immediately',
      'Walk to a different room or step outside',
      'Focus on what you see around you',
      'Count 5 things you see, 4 you can touch, 3 you hear',
      'Keep walking until the urge fades',
    ],
  },
];
