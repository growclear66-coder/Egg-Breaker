export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  level: number;
  clicks: number;
  totalClicks: number;
  lastLogin: string; // ISO date string
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  level: number;
}

export enum GameState {
  LOADING,
  AUTH,
  PLAYING,
  ERROR
}

export interface LevelConfig {
  hp: number;
  skin: 'standard' | 'gold' | 'diamond' | 'obsidian';
  name: string;
}
