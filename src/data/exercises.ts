import { Exercise, ExerciseCategory } from "../types";

export const exercises: Exercise[] = [
  { id: "str-pushups", name: "Push-ups", category: ExerciseCategory.Strength, muscleGroups: ["Chest", "Triceps", "Shoulders", "Core"], description: "Classic bodyweight push-up targeting the upper body.", caloriesPerMinute: 7, imageEmoji: "💪" },
  { id: "str-pullups", name: "Pull-ups", category: ExerciseCategory.Strength, muscleGroups: ["Back", "Biceps", "Forearms", "Shoulders"], description: "Upper-body pull exercise using a bar.", caloriesPerMinute: 8, imageEmoji: "🏋️" },
  { id: "str-squats", name: "Squats", category: ExerciseCategory.Strength, muscleGroups: ["Quadriceps", "Glutes", "Hamstrings", "Core"], description: "Fundamental lower-body compound movement.", caloriesPerMinute: 8, imageEmoji: "🦵" },
  { id: "str-deadlifts", name: "Deadlifts", category: ExerciseCategory.Strength, muscleGroups: ["Back", "Glutes", "Hamstrings", "Core", "Forearms"], description: "Full-body lift focusing on the posterior chain.", caloriesPerMinute: 9, imageEmoji: "🏗️" },
  { id: "str-benchpress", name: "Bench Press", category: ExerciseCategory.Strength, muscleGroups: ["Chest", "Triceps", "Shoulders"], description: "Barbell press performed on a flat bench.", caloriesPerMinute: 7, imageEmoji: "🛋️" },
  { id: "str-bicepcurls", name: "Bicep Curls", category: ExerciseCategory.Strength, muscleGroups: ["Biceps", "Forearms"], description: "Isolation exercise for the biceps.", caloriesPerMinute: 5, imageEmoji: "💪" },
  { id: "str-lunges", name: "Lunges", category: ExerciseCategory.Strength, muscleGroups: ["Quadriceps", "Glutes", "Hamstrings", "Calves"], description: "Unilateral leg exercise improving balance and strength.", caloriesPerMinute: 7, imageEmoji: "🚶" },
  { id: "str-shoulderpress", name: "Shoulder Press", category: ExerciseCategory.Strength, muscleGroups: ["Shoulders", "Triceps", "Upper Back"], description: "Overhead pressing movement for shoulder development.", caloriesPerMinute: 6, imageEmoji: "🙆" },
  { id: "str-plank", name: "Plank", category: ExerciseCategory.Strength, muscleGroups: ["Core", "Shoulders", "Glutes"], description: "Isometric core exercise performed in a push-up position.", caloriesPerMinute: 4, imageEmoji: "🧱" },
  { id: "str-rows", name: "Barbell Rows", category: ExerciseCategory.Strength, muscleGroups: ["Back", "Biceps", "Forearms", "Core"], description: "Bent-over rowing movement for back thickness.", caloriesPerMinute: 7, imageEmoji: "🔩" },
  { id: "car-running", name: "Running", category: ExerciseCategory.Cardio, muscleGroups: ["Quadriceps", "Hamstrings", "Calves", "Core"], description: "Outdoor or treadmill running at a moderate pace.", caloriesPerMinute: 11, imageEmoji: "🏃" },
  { id: "car-cycling", name: "Cycling", category: ExerciseCategory.Cardio, muscleGroups: ["Quadriceps", "Hamstrings", "Calves", "Glutes"], description: "Stationary or outdoor cycling workout.", caloriesPerMinute: 9, imageEmoji: "🚴" },
  { id: "car-swimming", name: "Swimming", category: ExerciseCategory.Cardio, muscleGroups: ["Full Body"], description: "Full-body water-based cardiovascular exercise.", caloriesPerMinute: 10, imageEmoji: "🏊" },
  { id: "car-jumprope", name: "Jump Rope", category: ExerciseCategory.Cardio, muscleGroups: ["Calves", "Shoulders", "Core", "Forearms"], description: "High-intensity skipping rope cardio.", caloriesPerMinute: 12, imageEmoji: "⏭️" },
  { id: "car-hiit", name: "HIIT", category: ExerciseCategory.Cardio, muscleGroups: ["Full Body"], description: "High-intensity interval training with short rest periods.", caloriesPerMinute: 13, imageEmoji: "🔥" },
  { id: "car-rowing", name: "Rowing", category: ExerciseCategory.Cardio, muscleGroups: ["Back", "Legs", "Arms", "Core"], description: "Machine or water rowing for full-body cardio.", caloriesPerMinute: 10, imageEmoji: "🚣" },
  { id: "car-stairclimbing", name: "Stair Climbing", category: ExerciseCategory.Cardio, muscleGroups: ["Quadriceps", "Glutes", "Calves"], description: "Climbing stairs or using a stair machine.", caloriesPerMinute: 9, imageEmoji: "🪜" },
  { id: "car-elliptical", name: "Elliptical", category: ExerciseCategory.Cardio, muscleGroups: ["Quadriceps", "Hamstrings", "Arms", "Core"], description: "Low-impact machine cardio mimicking running.", caloriesPerMinute: 8, imageEmoji: "🔄" },
  { id: "car-walking", name: "Brisk Walking", category: ExerciseCategory.Cardio, muscleGroups: ["Quadriceps", "Hamstrings", "Calves", "Glutes"], description: "Fast-paced walking for steady-state cardio.", caloriesPerMinute: 5, imageEmoji: "🚶‍♂️" },
  { id: "flx-yoga", name: "Yoga", category: ExerciseCategory.Flexibility, muscleGroups: ["Full Body"], description: "Mind-body practice combining poses and breathwork.", caloriesPerMinute: 4, imageEmoji: "🧘" },
  { id: "flx-stretching", name: "Stretching", category: ExerciseCategory.Flexibility, muscleGroups: ["Full Body"], description: "Static or dynamic stretches for improved flexibility.", caloriesPerMinute: 3, imageEmoji: "🤸" },
  { id: "flx-pilates", name: "Pilates", category: ExerciseCategory.Flexibility, muscleGroups: ["Core", "Glutes", "Back", "Legs"], description: "Controlled movements focusing on core stability.", caloriesPerMinute: 5, imageEmoji: "🎯" },
  { id: "flx-foamrolling", name: "Foam Rolling", category: ExerciseCategory.Flexibility, muscleGroups: ["Full Body"], description: "Self-myofascial release using a foam roller.", caloriesPerMinute: 2, imageEmoji: "🧽" },
  { id: "flx-taichi", name: "Tai Chi", category: ExerciseCategory.Flexibility, muscleGroups: ["Full Body"], description: "Slow, flowing martial art emphasizing balance and calm.", caloriesPerMinute: 3, imageEmoji: "☯️" },
  { id: "flx-barre", name: "Barre", category: ExerciseCategory.Flexibility, muscleGroups: ["Legs", "Glutes", "Core", "Arms"], description: "Ballet-inspired workout blending strength and flexibility.", caloriesPerMinute: 5, imageEmoji: "🩰" },
  { id: "flx-mobility", name: "Mobility Drills", category: ExerciseCategory.Flexibility, muscleGroups: ["Hips", "Shoulders", "Ankles", "Thoracic Spine"], description: "Joint-specific movements to improve range of motion.", caloriesPerMinute: 3, imageEmoji: "🔧" },
  { id: "flx-yogaflow", name: "Vinyasa Flow", category: ExerciseCategory.Flexibility, muscleGroups: ["Full Body"], description: "Dynamic yoga linking breath with continuous movement.", caloriesPerMinute: 6, imageEmoji: "🌊" },
  { id: "spt-basketball", name: "Basketball", category: ExerciseCategory.Sports, muscleGroups: ["Legs", "Core", "Shoulders", "Arms"], description: "Fast-paced court sport with running and jumping.", caloriesPerMinute: 10, imageEmoji: "🏀" },
  { id: "spt-soccer", name: "Soccer", category: ExerciseCategory.Sports, muscleGroups: ["Legs", "Core", "Cardiovascular"], description: "Field sport involving sprinting, kicking, and agility.", caloriesPerMinute: 10, imageEmoji: "⚽" },
  { id: "spt-tennis", name: "Tennis", category: ExerciseCategory.Sports, muscleGroups: ["Arms", "Shoulders", "Legs", "Core"], description: "Racquet sport demanding quick lateral movements.", caloriesPerMinute: 9, imageEmoji: "🎾" },
  { id: "spt-boxing", name: "Boxing", category: ExerciseCategory.Sports, muscleGroups: ["Arms", "Shoulders", "Core", "Legs"], description: "Combat sport combining punches with footwork.", caloriesPerMinute: 11, imageEmoji: "🥊" },
  { id: "spt-martialarts", name: "Martial Arts", category: ExerciseCategory.Sports, muscleGroups: ["Full Body"], description: "Discipline-based combat training like karate or judo.", caloriesPerMinute: 10, imageEmoji: "🥋" },
  { id: "spt-volleyball", name: "Volleyball", category: ExerciseCategory.Sports, muscleGroups: ["Shoulders", "Arms", "Legs", "Core"], description: "Team court sport with jumping and overhead hitting.", caloriesPerMinute: 6, imageEmoji: "🏐" },
  { id: "spt-badminton", name: "Badminton", category: ExerciseCategory.Sports, muscleGroups: ["Arms", "Shoulders", "Legs", "Core"], description: "Racquet sport requiring speed and agility.", caloriesPerMinute: 7, imageEmoji: "🏸" },
];

export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((e) => e.id === id);
}

export function getExercisesByCategory(category: ExerciseCategory): Exercise[] {
  return exercises.filter((e) => e.category === category);
}
