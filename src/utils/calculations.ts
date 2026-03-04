import { Workout, WorkoutType } from "../types";

export function calculateCalories(
  durationMinutes: number,
  caloriesPerMinute: number
): number {
  return Math.round(durationMinutes * caloriesPerMinute);
}

export function calculateStreak(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;
  const workoutDates = new Set(workouts.map((w) => w.date.slice(0, 10)));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const key = toDateKey(cursor);
    if (!workoutDates.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function getWeeklyData(
  workouts: Workout[]
): { day: string; count: number; calories: number }[] {
  const result: { day: string; count: number; calories: number }[] = [];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const dayWorkouts = workouts.filter((w) => w.date.slice(0, 10) === key);
    result.push({
      day: dayNames[d.getDay()],
      count: dayWorkouts.length,
      calories: dayWorkouts.reduce((s, w) => s + w.caloriesBurned, 0),
    });
  }
  return result;
}

export function getMonthlyData(
  workouts: Workout[]
): { day: string; calories: number }[] {
  const result: { day: string; calories: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const key = toDateKey(d);
    const dayCalories = workouts
      .filter((w) => w.date.slice(0, 10) === key)
      .reduce((s, w) => s + w.caloriesBurned, 0);
    result.push({ day: `${d.getMonth() + 1}/${d.getDate()}`, calories: dayCalories });
  }
  return result;
}

export function getMostCommonWorkoutType(workouts: Workout[]): WorkoutType | null {
  if (workouts.length === 0) return null;
  const counts = new Map<WorkoutType, number>();
  for (const w of workouts) counts.set(w.type, (counts.get(w.type) ?? 0) + 1);
  let maxType: WorkoutType = workouts[0].type;
  let maxCount = 0;
  for (const [type, count] of counts) {
    if (count > maxCount) { maxCount = count; maxType = type; }
  }
  return maxType;
}

export function getAverageDuration(workouts: Workout[]): number {
  if (workouts.length === 0) return 0;
  return Math.round(workouts.reduce((s, w) => s + w.duration, 0) / workouts.length);
}

export function getTotalCalories(workouts: Workout[]): number {
  return workouts.reduce((s, w) => s + w.caloriesBurned, 0);
}

function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
