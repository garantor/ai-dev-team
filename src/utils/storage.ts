import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Workout, UserSettings } from "../types";

export const WORKOUTS_KEY = "@fittrack/workouts";
export const SETTINGS_KEY = "@fittrack/settings";
export const STEPS_KEY = "@fittrack/steps";

export const DEFAULT_SETTINGS: UserSettings = {
  userName: "",
  dailyStepGoal: 10_000,
  dailyCalorieGoal: 500,
  weeklyWorkoutGoal: 5,
};

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw !== null ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function removeItem(key: string): Promise<void> {
  await AsyncStorage.removeItem(key);
}

export async function getWorkouts(): Promise<Workout[]> {
  return (await getItem<Workout[]>(WORKOUTS_KEY)) ?? [];
}

export async function saveWorkouts(workouts: Workout[]): Promise<void> {
  await setItem(WORKOUTS_KEY, workouts);
}

export async function getSettings(): Promise<UserSettings> {
  return (await getItem<UserSettings>(SETTINGS_KEY)) ?? { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  await setItem(SETTINGS_KEY, settings);
}

export async function getSteps(date: string): Promise<number> {
  return (await getItem<number>(`${STEPS_KEY}:${date}`)) ?? 0;
}

export async function saveSteps(date: string, steps: number): Promise<void> {
  await setItem(`${STEPS_KEY}:${date}`, steps);
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.clear();
}
