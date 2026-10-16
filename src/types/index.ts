export interface IUser {
  _id: string;
  name: string;
  username: string;
  habit: string;         // "smoking" | "alcohol" | "custom"
  customHabit?: string;
  quitStartTime: string; // ISO date string
  points: number;
  streak: number;
  lastCheckin?: string;  // ISO date string
  moneySavedPerDay: number;
  createdAt: string;
}

export interface ILeaderboardEntry {
  _id: string;
  name: string;
  habit: string;
  points: number;
  streak: number;
  rank: number;
}

export interface IBadge {
  id: string;
  icon: string;
  name: string;
  description: string;
  unlocked: boolean;
}

export interface ILevel {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
}

export interface ISOSActivity {
  id: string;
  title: string;
  description: string;
  duration: string;
  emoji: string;
  steps: string[];
}
