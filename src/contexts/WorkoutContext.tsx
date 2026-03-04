import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Workout, DailySummary } from "../types";
import { getWorkouts, saveWorkouts, getSteps, saveSteps } from "../utils/storage";
import { isToday, toISODateString } from "../utils/dateHelpers";

interface WorkoutContextValue {
  workouts: Workout[];
  todaySteps: number;
  loading: boolean;
  addWorkout: (workout: Omit<Workout, "id">) => Promise<void>;
  deleteWorkout: (id: string) => Promise<void>;
  updateSteps: (steps: number) => Promise<void>;
  getTodaySummary: () => DailySummary;
}

const WorkoutContext = createContext<WorkoutContextValue | undefined>(undefined);

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [todaySteps, setTodaySteps] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const todayKey = toISODateString(new Date());
        const [savedWorkouts, savedSteps] = await Promise.all([
          getWorkouts(),
          getSteps(todayKey),
        ]);
        if (!cancelled) {
          setWorkouts(savedWorkouts);
          setTodaySteps(savedSteps);
        }
      } catch (err) {
        console.error("WorkoutContext: failed to load", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const addWorkout = useCallback(async (workout: Omit<Workout, "id">) => {
    const newWorkout: Workout = {
      ...workout,
      id: `w-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    };
    const updated = [newWorkout, ...workouts];
    setWorkouts(updated);
    await saveWorkouts(updated);
  }, [workouts]);

  const deleteWorkout = useCallback(async (id: string) => {
    const updated = workouts.filter((w) => w.id !== id);
    setWorkouts(updated);
    await saveWorkouts(updated);
  }, [workouts]);

  const updateSteps = useCallback(async (newSteps: number) => {
    const todayKey = toISODateString(new Date());
    const total = todaySteps + newSteps;
    setTodaySteps(total);
    await saveSteps(todayKey, total);
  }, [todaySteps]);

  const getTodaySummary = useCallback((): DailySummary => {
    const todayKey = toISODateString(new Date());
    const todayWorkouts = workouts.filter((w) => isToday(w.date));
    return {
      date: todayKey,
      totalCalories: todayWorkouts.reduce((s, w) => s + w.caloriesBurned, 0),
      totalDuration: todayWorkouts.reduce((s, w) => s + w.duration, 0),
      workoutCount: todayWorkouts.length,
      steps: todaySteps,
    };
  }, [workouts, todaySteps]);

  const value = useMemo<WorkoutContextValue>(
    () => ({ workouts, todaySteps, loading, addWorkout, deleteWorkout, updateSteps, getTodaySummary }),
    [workouts, todaySteps, loading, addWorkout, deleteWorkout, updateSteps, getTodaySummary]
  );

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};

export function useWorkouts(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext);
  if (!ctx) throw new Error("useWorkouts must be used within a WorkoutProvider");
  return ctx;
}
