import { db } from '../firebaseConfig';
import { doc, getDoc, setDoc, updateDoc, increment, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { UserProfile, LevelConfig } from '../types';

// Fallback storage for Demo Mode (when Firebase isn't configured)
const DEMO_STORAGE_KEY = 'egg_breaker_demo_user';

export const getLevelConfig = (level: number): LevelConfig => {
  // Level Scaling Algorithm
  const baseHp = 10;
  const growthFactor = 1.2;
  const hp = Math.floor(baseHp * Math.pow(level, growthFactor));
  
  let skin: LevelConfig['skin'] = 'standard';
  let name = 'Chicken Egg';

  if (level > 100) { skin = 'obsidian'; name = 'Obsidian Egg'; }
  else if (level > 50) { skin = 'diamond'; name = 'Diamond Egg'; }
  else if (level > 20) { skin = 'gold'; name = 'Golden Egg'; }

  return { hp, skin, name };
};

export const initializeUser = async (uid: string, email: string | null, displayName: string | null): Promise<UserProfile> => {
  // Force local storage for demo user or if DB is missing
  if (!db || uid === 'demo-user-123') {
    // Demo Mode Logic
    const stored = localStorage.getItem(DEMO_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    
    const newUser: UserProfile = {
      uid,
      email,
      displayName: displayName || 'Guest Clicker',
      photoURL: null,
      level: 1,
      clicks: 0,
      totalClicks: 0,
      lastLogin: new Date().toISOString()
    };
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(newUser));
    return newUser;
  }

  // Real Firebase Logic
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data() as UserProfile;
      await updateDoc(userRef, { lastLogin: new Date().toISOString() });
      return data;
    } else {
      const newUser: UserProfile = {
        uid,
        email,
        displayName: displayName || `User ${uid.substring(0, 5)}`,
        photoURL: null,
        level: 1,
        clicks: 0,
        totalClicks: 0,
        lastLogin: new Date().toISOString()
      };
      await setDoc(userRef, newUser);
      return newUser;
    }
  } catch (error) {
    console.error("Error accessing Firestore:", error);
    // Fallback to local user if firestore fails (e.g. permission denied)
    return {
        uid,
        email,
        displayName: displayName || 'Offline User',
        photoURL: null,
        level: 1,
        clicks: 0,
        totalClicks: 0,
        lastLogin: new Date().toISOString()
    };
  }
};

export const saveProgress = async (user: UserProfile) => {
  if (!db || user.uid === 'demo-user-123') {
    localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(user));
    return;
  }

  try {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      level: user.level,
      clicks: user.clicks,
      totalClicks: user.totalClicks
    });
  } catch (error) {
    console.error("Failed to save progress to cloud:", error);
    // Optionally save to local storage as backup
  }
};

export const fetchLeaderboard = async () => {
  if (!db) return [];
  try {
    const q = query(collection(db, 'users'), orderBy('level', 'desc'), limit(10));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => d.data() as UserProfile);
  } catch (e) {
    console.warn("Leaderboard fetch failed", e);
    return [];
  }
};