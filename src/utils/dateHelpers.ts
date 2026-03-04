import {
  format,
  isToday as fnsIsToday,
  isYesterday,
  isSameDay as fnsIsSameDay,
  startOfWeek,
  endOfWeek,
  parseISO,
} from "date-fns";
import type { Workout } from "../types";

function toDate(value: string | Date): Date {
  return typeof value === "string" ? parseISO(value) : value;
}

export function formatDate(date: string | Date): string {
  return format(toDate(date), "MMM d, yyyy");
}

export function formatTime(date: string | Date): string {
  return format(toDate(date), "h:mm a");
}

export function formatRelative(date: string | Date): string {
  const d = toDate(date);
  if (fnsIsToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return formatDate(d);
}

export function isToday(date: string | Date): boolean {
  return fnsIsToday(toDate(date));
}

export function isSameDay(date1: string | Date, date2: string | Date): boolean {
  return fnsIsSameDay(toDate(date1), toDate(date2));
}

export function getWeekBoundaries(): { start: Date; end: Date } {
  const now = new Date();
  return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
}

export function getDayName(date: Date): string {
  return format(date, "EEE");
}

export function toISODateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function groupByDate(workouts: Workout[]): { title: string; data: Workout[] }[] {
  const map = new Map<string, Workout[]>();
  for (const w of workouts) {
    const key = w.date.slice(0, 10);
    const list = map.get(key);
    if (list) list.push(w);
    else map.set(key, [w]);
  }
  const sortedKeys = [...map.keys()].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );
  return sortedKeys.map((key) => ({ title: formatRelative(key), data: map.get(key)! }));
}
