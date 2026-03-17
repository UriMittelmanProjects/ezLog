export const MUSCLE_ICONS = {
  Chest: "◉",
  Shoulders: "◈",
  Triceps: "◤",
  Back: "◈",
  Biceps: "◎",
  Legs: "◆",
  Glutes: "◇",
  Core: "⬡",
};

export const MUSCLE_COLORS = {
  Chest: "#f59e0b",
  Shoulders: "#3b82f6",
  Triceps: "#10b981",
  Back: "#8b5cf6",
  Biceps: "#ef4444",
  Legs: "#f97316",
  Glutes: "#ec4899",
  Core: "#06b6d4",
};

export const MUSCLES_ALL = [
  "Chest",
  "Shoulders",
  "Triceps",
  "Back",
  "Biceps",
  "Legs",
  "Glutes",
  "Core",
];

export const KNOWN_LIFTS = [
  "Chest Press",
  "Incline DB Press",
  "Lat Fly Machine",
  "Lateral Raise",
  "Overhead Press",
  "Tricep Pushdown",
  "Deadlift",
  "Pull-ups",
  "Hammer Curls",
  "Cable Row",
  "Squat",
  "Leg Press",
  "Romanian Deadlift",
  "Hip Thrust",
  "Bench Press",
  "Barbell Row",
  "Face Pull",
  "Preacher Curl",
];

export function getDuration(start, end) {
  if (!start || !end) return "–";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) return "–";
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
}

export function formatDate(d) {
  if (!d) return "";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function today() {
  return new Date().toISOString().split("T")[0];
}
