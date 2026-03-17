import { useState, useRef, useEffect } from "react";

const DB = {
  workouts: [
    {
      id: 1,
      date: "2025-03-13",
      startTime: "06:45",
      endTime: "08:10",
      mirrorPic: null,
      muscleGroups: [
        { name: "Chest", sets: 12 },
        { name: "Shoulders", sets: 9 },
        { name: "Triceps", sets: 6 },
      ],
      lifts: [
        { id: 1, name: "Chest Press", sets: 4, reps: "6-8", weight: 185, notes: "" },
        { id: 2, name: "Incline DB Press", sets: 3, reps: "8", weight: 75, notes: "" },
        { id: 3, name: "Lat Fly Machine", sets: 3, reps: "12", weight: 190, notes: "Drop set last set" },
        { id: 4, name: "Lateral Raise", sets: 3, reps: "15", weight: 25, notes: "" },
        { id: 5, name: "Overhead Press", sets: 3, reps: "6-8", weight: 135, notes: "Failed early set 3" },
        { id: 6, name: "Tricep Pushdown", sets: 3, reps: "12", weight: 60, notes: "" },
      ],
    },
    {
      id: 2,
      date: "2025-03-11",
      startTime: "17:30",
      endTime: "18:45",
      mirrorPic: null,
      muscleGroups: [
        { name: "Back", sets: 15 },
        { name: "Biceps", sets: 9 },
      ],
      lifts: [
        { id: 7, name: "Deadlift", sets: 5, reps: "5", weight: 315, notes: "" },
        { id: 8, name: "Pull-ups", sets: 4, reps: "8", weight: 0, notes: "Bodyweight" },
        { id: 9, name: "Hammer Curls", sets: 3, reps: "10", weight: 50, notes: "" },
        { id: 10, name: "Cable Row", sets: 3, reps: "12", weight: 150, notes: "" },
      ],
    },
    {
      id: 3,
      date: "2025-03-09",
      startTime: "08:00",
      endTime: "09:20",
      mirrorPic: null,
      muscleGroups: [
        { name: "Legs", sets: 18 },
        { name: "Glutes", sets: 6 },
      ],
      lifts: [
        { id: 11, name: "Squat", sets: 5, reps: "5", weight: 275, notes: "" },
        { id: 12, name: "Leg Press", sets: 4, reps: "10", weight: 450, notes: "" },
        { id: 13, name: "Romanian Deadlift", sets: 3, reps: "10", weight: 185, notes: "" },
        { id: 14, name: "Hip Thrust", sets: 3, reps: "12", weight: 225, notes: "" },
      ],
    },
  ],
  liftHistory: {
    "Chest Press": [
      { date: "2025-02-17", weight: 165 },
      { date: "2025-02-24", weight: 170 },
      { date: "2025-03-03", weight: 180 },
      { date: "2025-03-10", weight: 183 },
      { date: "2025-03-13", weight: 185 },
    ],
    "Deadlift": [
      { date: "2025-02-10", weight: 295 },
      { date: "2025-02-17", weight: 300 },
      { date: "2025-02-24", weight: 305 },
      { date: "2025-03-04", weight: 310 },
      { date: "2025-03-11", weight: 315 },
    ],
    "Squat": [
      { date: "2025-02-12", weight: 245 },
      { date: "2025-02-19", weight: 255 },
      { date: "2025-02-26", weight: 260 },
      { date: "2025-03-05", weight: 265 },
      { date: "2025-03-09", weight: 275 },
    ],
  },
};

const MUSCLE_ICONS = {
  Chest: "◉",
  Shoulders: "◈",
  Triceps: "◤",
  Back: "◈",
  Biceps: "◎",
  Legs: "◆",
  Glutes: "◇",
  Core: "⬡",
};

const MUSCLE_COLORS = {
  Chest: "#f59e0b",
  Shoulders: "#3b82f6",
  Triceps: "#10b981",
  Back: "#8b5cf6",
  Biceps: "#ef4444",
  Legs: "#f97316",
  Glutes: "#ec4899",
  Core: "#06b6d4",
};

function getDuration(start, end) {
  if (!start || !end) return "–";
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  if (mins <= 0) return "–";
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;
}

function formatDate(d) {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0f0f10;
    --surface: #1a1a1e;
    --surface2: #222228;
    --surface3: #2a2a32;
    --border: #2e2e38;
    --amber: #f59e0b;
    --amber-dim: #92620a;
    --amber-glow: rgba(245,158,11,0.12);
    --text: #f0ede8;
    --text-dim: #8a8898;
    --text-muted: #52505e;
    --red: #ef4444;
    --green: #22c55e;
    --blue: #3b82f6;
    --font-display: 'Barlow Condensed', sans-serif;
    --font-body: 'Barlow', sans-serif;
    --radius: 6px;
    --radius-lg: 10px;
  }

  body { background: var(--bg); font-family: var(--font-body); color: var(--text); -webkit-font-smoothing: antialiased; }

  .app {
    width: 390px;
    min-height: 844px;
    margin: 24px auto;
    background: var(--bg);
    border-radius: 44px;
    overflow: hidden;
    border: 1px solid #333;
    box-shadow: 0 40px 100px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.04) inset;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  .status-bar {
    background: var(--bg);
    padding: 14px 28px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--text);
    flex-shrink: 0;
  }

  .screen { flex: 1; overflow-y: auto; overflow-x: hidden; scrollbar-width: none; }
  .screen::-webkit-scrollbar { display: none; }

  .nav {
    background: var(--bg);
    border-top: 1px solid var(--border);
    padding: 8px 0 20px;
    display: flex;
    justify-content: space-around;
    flex-shrink: 0;
  }

  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 6px 16px;
    cursor: pointer;
    transition: all 0.15s;
    border: none;
    background: none;
  }

  .nav-icon {
    font-size: 20px;
    line-height: 1;
    transition: all 0.15s;
  }

  .nav-label {
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--text-muted);
    transition: all 0.15s;
  }

  .nav-item.active .nav-label { color: var(--amber); }
  .nav-item.active .nav-icon { filter: drop-shadow(0 0 6px var(--amber)); }

  /* HEADER */
  .page-header {
    padding: 20px 20px 0;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .page-title {
    font-family: var(--font-display);
    font-size: 36px;
    font-weight: 900;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    line-height: 1;
    color: var(--text);
  }

  .page-subtitle {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-dim);
    margin-top: 4px;
  }

  /* BUTTONS */
  .btn-amber {
    background: var(--amber);
    color: #0f0f10;
    border: none;
    border-radius: var(--radius);
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 8px 14px;
    cursor: pointer;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .btn-amber:hover { background: #fbbf24; }

  .btn-ghost {
    background: transparent;
    color: var(--text-dim);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-ghost:hover { border-color: var(--amber); color: var(--amber); }

  .btn-danger {
    background: transparent;
    color: var(--red);
    border: 1px solid rgba(239,68,68,0.3);
    border-radius: var(--radius);
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 6px 12px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .btn-icon {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text-dim);
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    transition: all 0.15s;
    flex-shrink: 0;
  }
  .btn-icon:hover { border-color: var(--amber); color: var(--amber); }

  /* WORKOUT LIST */
  .workout-list { padding: 16px 20px; display: flex; flex-direction: column; gap: 10px; }

  .workout-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.15s;
    position: relative;
    overflow: hidden;
  }
  .workout-card::before {
    content: '';
    position: absolute;
    left: 0; top: 0; bottom: 0;
    width: 3px;
    background: var(--amber);
    border-radius: 3px 0 0 3px;
  }
  .workout-card:hover { border-color: var(--amber-dim); background: var(--surface2); }

  .workout-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
  }

  .workout-date {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 800;
    letter-spacing: 0.02em;
    color: var(--text);
  }

  .workout-meta {
    display: flex;
    gap: 12px;
    margin-bottom: 10px;
  }

  .meta-pill {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-dim);
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .meta-pill span { color: var(--text); font-weight: 700; }

  .muscle-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 12px;
  }

  .muscle-chip {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 4px;
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .card-actions {
    display: flex;
    gap: 8px;
    padding-top: 10px;
    border-top: 1px solid var(--border);
  }

  /* WORKOUT DETAIL */
  .detail-header {
    padding: 20px 20px 0;
  }

  .back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--amber);
    cursor: pointer;
    background: none;
    border: none;
    margin-bottom: 16px;
  }

  .detail-title {
    font-family: var(--font-display);
    font-size: 42px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    line-height: 1;
    color: var(--text);
  }

  .detail-meta-row {
    display: flex;
    gap: 16px;
    margin: 12px 0;
    flex-wrap: wrap;
  }

  .detail-meta-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .detail-meta-label {
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .detail-meta-value {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 800;
    color: var(--text);
  }

  .section-header {
    padding: 16px 20px 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .section-title {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 800;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .lift-rows { padding: 0 20px; display: flex; flex-direction: column; gap: 6px; }

  .lift-row {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .lift-name {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.03em;
    color: var(--text);
  }

  .lift-note {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 2px;
  }

  .lift-stats {
    text-align: right;
    flex-shrink: 0;
    margin-left: 12px;
  }

  .lift-weight {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 800;
    color: var(--amber);
    line-height: 1;
  }

  .lift-sets-reps {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: var(--text-dim);
    margin-top: 1px;
  }

  /* AI LOGGER */
  .ai-screen { padding: 20px; }

  .ai-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
  }

  .ai-badge {
    background: var(--amber);
    color: #0f0f10;
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 3px 7px;
    border-radius: 3px;
  }

  .active-workout-banner {
    background: var(--amber-glow);
    border: 1px solid var(--amber-dim);
    border-radius: var(--radius);
    padding: 10px 14px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .active-workout-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--amber);
    box-shadow: 0 0 8px var(--amber);
    flex-shrink: 0;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .active-workout-text {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--amber);
  }
  .active-workout-sub {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--text-dim);
  }

  .preset-row {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 14px;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .preset-label {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
    margin-bottom: 2px;
  }

  .preset-value {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 800;
    color: var(--text);
  }

  .ai-chat-history {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
  }

  .chat-msg-user {
    display: flex;
    justify-content: flex-end;
  }

  .chat-msg-user .bubble {
    background: var(--amber);
    color: #0f0f10;
    border-radius: 14px 14px 4px 14px;
    padding: 10px 14px;
    max-width: 80%;
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 500;
  }

  .chat-msg-ai { display: flex; gap: 8px; align-items: flex-start; }

  .ai-avatar {
    width: 28px; height: 28px;
    background: var(--surface3);
    border: 1px solid var(--amber-dim);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .chat-msg-ai .bubble {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 4px 14px 14px 14px;
    padding: 10px 14px;
    max-width: 82%;
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--text);
    line-height: 1.5;
  }

  .parsed-lift-card {
    background: var(--surface3);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 8px 12px;
    margin-top: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .parsed-lift-name {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 700;
    color: var(--text);
  }

  .parsed-lift-detail {
    font-family: var(--font-display);
    font-size: 11px;
    color: var(--text-dim);
    margin-top: 1px;
  }

  .parsed-lift-weight {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 800;
    color: var(--amber);
  }

  .parse-note {
    font-family: var(--font-body);
    font-size: 11px;
    color: #f97316;
    background: rgba(249,115,22,0.08);
    border: 1px solid rgba(249,115,22,0.2);
    border-radius: 4px;
    padding: 4px 8px;
    margin-top: 6px;
  }

  .ai-input-area {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    gap: 10px;
    align-items: flex-end;
    transition: border-color 0.15s;
  }
  .ai-input-area:focus-within { border-color: var(--amber-dim); }

  .ai-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--text);
    resize: none;
    min-height: 20px;
    max-height: 80px;
    line-height: 1.4;
  }
  .ai-input::placeholder { color: var(--text-muted); }

  .ai-send-btn {
    width: 32px; height: 32px;
    background: var(--amber);
    border: none;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    font-size: 14px;
    flex-shrink: 0;
    transition: all 0.15s;
  }
  .ai-send-btn:hover { background: #fbbf24; }

  /* SEARCH */
  .search-screen { padding: 20px; }

  .search-input-wrapper {
    position: relative;
    margin-bottom: 16px;
  }

  .search-icon {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    font-size: 14px;
    pointer-events: none;
  }

  .search-input {
    width: 100%;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 12px 12px 12px 38px;
    font-family: var(--font-body);
    font-size: 15px;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s;
  }
  .search-input:focus { border-color: var(--amber-dim); }
  .search-input::placeholder { color: var(--text-muted); }

  .search-results { display: flex; flex-direction: column; gap: 8px; }

  .lift-search-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 14px 16px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .lift-search-card:hover { border-color: var(--amber-dim); background: var(--surface2); }

  .lift-search-name {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 800;
    letter-spacing: 0.03em;
    color: var(--text);
    margin-bottom: 8px;
  }

  .lift-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }

  .lift-stat-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .lift-stat-label {
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
  }

  .lift-stat-value {
    font-family: var(--font-display);
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
  }

  .lift-stat-accent { color: var(--amber); }
  .lift-stat-green { color: var(--green); }

  /* LIFT DETAIL */
  .chart-area {
    padding: 0 20px;
    margin-top: 8px;
  }

  .chart-container {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 16px;
    height: 160px;
    position: relative;
    overflow: hidden;
  }

  .chart-svg { width: 100%; height: 100%; }

  /* LOG WORKOUT MODAL */
  .modal-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.7);
    backdrop-filter: blur(4px);
    z-index: 100;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .modal-sheet {
    background: var(--surface);
    border-radius: 20px 20px 0 0;
    border-top: 1px solid var(--border);
    padding: 20px;
    max-height: 85%;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .modal-sheet::-webkit-scrollbar { display: none; }

  .modal-handle {
    width: 36px; height: 4px;
    background: var(--border);
    border-radius: 2px;
    margin: 0 auto 20px;
  }

  .modal-title {
    font-family: var(--font-display);
    font-size: 28px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 20px;
  }

  .form-group { margin-bottom: 16px; }

  .form-label {
    font-family: var(--font-display);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--text-muted);
    display: block;
    margin-bottom: 6px;
  }

  .form-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 10px 12px;
    font-family: var(--font-body);
    font-size: 15px;
    color: var(--text);
    outline: none;
    transition: border-color 0.15s;
  }
  .form-input:focus { border-color: var(--amber-dim); }

  .form-row { display: flex; gap: 10px; }
  .form-row .form-group { flex: 1; }

  .muscle-toggle-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }

  .muscle-toggle {
    padding: 5px 12px;
    border-radius: 4px;
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border: 1px solid var(--border);
    background: var(--surface2);
    color: var(--text-dim);
    transition: all 0.15s;
  }
  .muscle-toggle.active {
    border-color: var(--amber);
    background: var(--amber-glow);
    color: var(--amber);
  }

  .ai-infer-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    cursor: pointer;
    margin-top: 8px;
  }

  .toggle-track {
    width: 36px; height: 20px;
    border-radius: 10px;
    background: var(--surface3);
    border: 1px solid var(--border);
    position: relative;
    transition: all 0.2s;
    flex-shrink: 0;
  }
  .toggle-track.on { background: var(--amber); border-color: var(--amber); }

  .toggle-thumb {
    width: 14px; height: 14px;
    border-radius: 50%;
    background: var(--text-muted);
    position: absolute;
    top: 2px;
    left: 2px;
    transition: all 0.2s;
  }
  .toggle-track.on .toggle-thumb {
    left: 18px;
    background: #0f0f10;
  }

  .toggle-label {
    font-family: var(--font-display);
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--text);
  }
  .toggle-sub {
    font-family: var(--font-body);
    font-size: 11px;
    color: var(--text-dim);
  }

  .divider {
    height: 1px;
    background: var(--border);
    margin: 16px 0;
  }

  .empty-state {
    text-align: center;
    padding: 40px 20px;
  }

  .empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
    opacity: 0.3;
  }

  .empty-text {
    font-family: var(--font-display);
    font-size: 16px;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: var(--text-muted);
  }

  .badge-green {
    background: rgba(34,197,94,0.12);
    border: 1px solid rgba(34,197,94,0.25);
    color: var(--green);
    font-family: var(--font-display);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 2px 7px;
    border-radius: 3px;
  }

  .confirm-dialog {
    position: absolute;
    inset: 0;
    z-index: 200;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 30px;
  }

  .confirm-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    width: 100%;
  }

  .confirm-title {
    font-family: var(--font-display);
    font-size: 22px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin-bottom: 8px;
  }

  .confirm-sub {
    font-family: var(--font-body);
    font-size: 13px;
    color: var(--text-dim);
    margin-bottom: 20px;
  }

  .confirm-actions { display: flex; gap: 10px; }
  .confirm-actions button { flex: 1; padding: 10px; }

  .pill-tabs {
    display: flex;
    gap: 4px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 3px;
    margin-bottom: 16px;
  }

  .pill-tab {
    flex: 1;
    padding: 7px;
    text-align: center;
    font-family: var(--font-display);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--text-dim);
    cursor: pointer;
    border-radius: 4px;
    transition: all 0.15s;
    border: none;
    background: none;
  }

  .pill-tab.active {
    background: var(--amber);
    color: #0f0f10;
  }

  .not-logged-msg {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-lg);
    padding: 24px;
    text-align: center;
  }
  .not-logged-icon { font-size: 28px; margin-bottom: 8px; opacity: 0.4; }
  .not-logged-text {
    font-family: var(--font-display);
    font-size: 14px;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: var(--text-dim);
  }
`;

function WeightChart({ data }) {
  if (!data || data.length < 2) return null;
  const weights = data.map(d => d.weight);
  const min = Math.min(...weights) - 10;
  const max = Math.max(...weights) + 10;
  const W = 300, H = 110;
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (W - 30) + 15;
    const y = H - ((d.weight - min) / (max - min)) * (H - 20) - 5;
    return [x, y];
  });
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = path + ` L${pts[pts.length - 1][0]},${H} L${pts[0][0]},${H} Z`;

  return (
    <div className="chart-container">
      <div style={{ fontFamily: "var(--font-display)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>WEIGHT PROGRESSION (LBS)</div>
      <svg className="chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#chartGrad)" />
        <path d={path} fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="4" fill="#f59e0b" />
            <text x={x} y={y - 8} textAnchor="middle" fill="#f0ede8" fontSize="9" fontFamily="Barlow Condensed" fontWeight="700">{data[i].weight}</text>
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontFamily: "var(--font-display)", fontSize: 9, color: "var(--text-muted)", fontWeight: 600 }}>
            {new Date(d.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("workouts");
  const [workouts, setWorkouts] = useState(DB.workouts);
  const [view, setView] = useState("list"); // list | detail | edit | liftDetail
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showNewWorkout, setShowNewWorkout] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [aiMsg, setAiMsg] = useState("");
  const [aiHistory, setAiHistory] = useState([
    {
      role: "ai",
      text: "Ready to log. Send me your lifts — typos and shorthand are fine. I'll use your defaults (2 sets · 6–8 reps) for anything unspecified.",
      parsed: null,
    }
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLift, setSelectedLift] = useState(null);
  const [aiInfer, setAiInfer] = useState(true);
  const [newWorkout, setNewWorkout] = useState({ date: "2025-03-15", startTime: "", endTime: "", muscles: [], aiInfer: true });
  const [defaultSets, setDefaultSets] = useState(2);
  const [defaultReps, setDefaultReps] = useState("6-8");
  const inputRef = useRef();

  const allLifts = ["Chest Press", "Incline DB Press", "Lat Fly Machine", "Lateral Raise", "Overhead Press", "Tricep Pushdown", "Deadlift", "Pull-ups", "Hammer Curls", "Cable Row", "Squat", "Leg Press", "Romanian Deadlift", "Hip Thrust", "Bench Press", "Barbell Row", "Face Pull", "Preacher Curl"];

  function sendAiMessage() {
    const msg = aiMsg.trim();
    if (!msg) return;
    const userMsg = { role: "user", text: msg };
    let parsed = null;
    let responseText = "";

    // Simulate AI parsing
    if (msg.toLowerCase().includes("chst press") || msg.toLowerCase().includes("chest press")) {
      parsed = [
        { name: "Chest Press", sets: 2, reps: "6-8", weight: 170, note: "Failed early set 2 — noted" },
        { name: "Lat Fly Machine", sets: 3, reps: "6-8", weight: 190, note: "3 sets · using preset reps (6-8)" },
      ];
      responseText = `Got it — parsed 2 lifts. "chst press" → Chest Press, 2 sets (your preset). "lat fly mach" → Lat Fly Machine, 3 sets (you specified) · used preset 6–8 reps. Noted early failure on Chest Press set 2. Logged to today's workout.`;
    } else if (msg.toLowerCase().includes("squat")) {
      parsed = [{ name: "Squat", sets: defaultSets, reps: defaultReps, weight: 275, note: "" }];
      responseText = `Logged: Squat · ${defaultSets} sets · ${defaultReps} reps · 275 lbs → added to today's session.`;
    } else {
      parsed = [{ name: "Custom Lift", sets: defaultSets, reps: defaultReps, weight: null, note: "Weight not specified" }];
      responseText = `Logged with your defaults (${defaultSets} sets · ${defaultReps} reps). Weight wasn't mentioned — add it manually if needed.`;
    }

    const aiResp = { role: "ai", text: responseText, parsed };
    setAiHistory(h => [...h, userMsg, aiResp]);
    setAiMsg("");
  }

  const filteredLifts = searchQuery.length > 0
    ? allLifts.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
    : allLifts.slice(0, 6);

  function getLiftStats(name) {
    const hist = DB.liftHistory[name];
    if (!hist) return null;
    const last = hist[hist.length - 1];
    const prev = hist[hist.length - 2];
    const weeklyIncrease = hist.length > 1 ? ((last.weight - hist[0].weight) / ((hist.length - 1) * 0.5)).toFixed(1) : 0;
    return { lastDate: last.date, lastWeight: last.weight, weeklyIncrease, prevWeight: prev?.weight };
  }

  function deleteWorkout(id) {
    setWorkouts(w => w.filter(x => x.id !== id));
    setShowDeleteConfirm(null);
    setView("list");
    setSelectedWorkout(null);
  }

  const MUSCLES_ALL = ["Chest", "Shoulders", "Triceps", "Back", "Biceps", "Legs", "Glutes", "Core"];

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="status-bar">
          <span>9:41</span>
          <span>●●●●● WiFi ■■■</span>
        </div>

        {/* SCREENS */}
        <div className="screen">

          {/* ── WORKOUTS TAB ── */}
          {tab === "workouts" && view === "list" && (
            <div>
              <div className="page-header">
                <div>
                  <div className="page-title">Sessions</div>
                  <div className="page-subtitle">{workouts.length} logged workouts</div>
                </div>
                <button className="btn-amber" onClick={() => setShowNewWorkout(true)}>+ New</button>
              </div>
              <div className="workout-list">
                {workouts.map(w => (
                  <div key={w.id} className="workout-card">
                    <div className="workout-card-top">
                      <div className="workout-date">{formatDate(w.date)}</div>
                    </div>
                    <div className="workout-meta">
                      <div className="meta-pill">⏱ <span>{getDuration(w.startTime, w.endTime)}</span></div>
                      {w.startTime && <div className="meta-pill">🕐 <span>{w.startTime}</span></div>}
                      <div className="meta-pill">🏋️ <span>{w.lifts.length} lifts</span></div>
                    </div>
                    <div className="muscle-chips">
                      {w.muscleGroups.map(mg => (
                        <div key={mg.name} className="muscle-chip" style={{
                          background: MUSCLE_COLORS[mg.name] + "18",
                          border: `1px solid ${MUSCLE_COLORS[mg.name]}40`,
                          color: MUSCLE_COLORS[mg.name],
                        }}>
                          {MUSCLE_ICONS[mg.name] || "◉"} {mg.name} · {mg.sets}s
                        </div>
                      ))}
                    </div>
                    <div className="card-actions">
                      <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setSelectedWorkout(w); setView("detail"); }}>View</button>
                      <button className="btn-ghost" style={{ flex: 1 }} onClick={() => { setSelectedWorkout(w); setView("edit"); }}>Edit</button>
                      <button className="btn-danger" onClick={() => setShowDeleteConfirm(w.id)}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "workouts" && view === "detail" && selectedWorkout && (
            <div>
              <div className="detail-header">
                <button className="back-btn" onClick={() => { setView("list"); setSelectedWorkout(null); }}>← Back</button>
                <div className="detail-title">{formatDate(selectedWorkout.date)}</div>
                <div className="detail-meta-row">
                  {selectedWorkout.startTime && (
                    <div className="detail-meta-item">
                      <div className="detail-meta-label">Start</div>
                      <div className="detail-meta-value">{selectedWorkout.startTime}</div>
                    </div>
                  )}
                  {selectedWorkout.endTime && (
                    <div className="detail-meta-item">
                      <div className="detail-meta-label">End</div>
                      <div className="detail-meta-value">{selectedWorkout.endTime}</div>
                    </div>
                  )}
                  <div className="detail-meta-item">
                    <div className="detail-meta-label">Duration</div>
                    <div className="detail-meta-value">{getDuration(selectedWorkout.startTime, selectedWorkout.endTime)}</div>
                  </div>
                </div>
                <div className="muscle-chips" style={{ marginTop: 12 }}>
                  {selectedWorkout.muscleGroups.map(mg => (
                    <div key={mg.name} className="muscle-chip" style={{
                      background: MUSCLE_COLORS[mg.name] + "18",
                      border: `1px solid ${MUSCLE_COLORS[mg.name]}40`,
                      color: MUSCLE_COLORS[mg.name],
                    }}>
                      {MUSCLE_ICONS[mg.name] || "◉"} {mg.name} · {mg.sets}s
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  <button className="btn-ghost" style={{ flex: 1 }} onClick={() => setView("edit")}>Edit Workout</button>
                  <button className="btn-danger" onClick={() => setShowDeleteConfirm(selectedWorkout.id)}>Delete</button>
                </div>
              </div>
              <div className="section-header">
                <div className="section-title">Lifts · {selectedWorkout.lifts.length}</div>
              </div>
              <div className="lift-rows">
                {selectedWorkout.lifts.map(l => (
                  <div key={l.id} className="lift-row">
                    <div>
                      <div className="lift-name">{l.name}</div>
                      {l.notes && <div className="lift-note">{l.notes}</div>}
                    </div>
                    <div className="lift-stats">
                      <div className="lift-weight">{l.weight > 0 ? `${l.weight}lbs` : "BW"}</div>
                      <div className="lift-sets-reps">{l.sets}×{l.reps}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ height: 24 }} />
            </div>
          )}

          {tab === "workouts" && view === "edit" && selectedWorkout && (
            <div>
              <div className="detail-header">
                <button className="back-btn" onClick={() => setView("detail")}>← Back</button>
                <div className="detail-title">Edit</div>
              </div>
              <div style={{ padding: "12px 20px" }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Date</label>
                    <input className="form-input" type="date" defaultValue={selectedWorkout.date} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Start</label>
                    <input className="form-input" type="time" defaultValue={selectedWorkout.startTime} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">End</label>
                    <input className="form-input" type="time" defaultValue={selectedWorkout.endTime} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Muscle Groups</label>
                  <div className="muscle-toggle-grid">
                    {MUSCLES_ALL.map(m => (
                      <button key={m} className={`muscle-toggle ${selectedWorkout.muscleGroups.find(x => x.name === m) ? "active" : ""}`}>{m}</button>
                    ))}
                  </div>
                </div>
                <div className="divider" />
                <div className="section-header" style={{ padding: "0 0 10px" }}>
                  <div className="section-title">Lifts</div>
                  <button className="btn-amber" style={{ fontSize: 11, padding: "6px 10px" }}>+ Add</button>
                </div>
                <div className="lift-rows" style={{ padding: 0 }}>
                  {selectedWorkout.lifts.map(l => (
                    <div key={l.id} className="lift-row" style={{ gap: 10 }}>
                      <div style={{ flex: 1 }}>
                        <input className="form-input" style={{ padding: "6px 10px", fontSize: 13, marginBottom: 6 }} defaultValue={l.name} />
                        <div style={{ display: "flex", gap: 6 }}>
                          <input className="form-input" style={{ padding: "5px 8px", fontSize: 12, width: 60 }} defaultValue={l.sets} placeholder="Sets" />
                          <input className="form-input" style={{ padding: "5px 8px", fontSize: 12, width: 60 }} defaultValue={l.reps} placeholder="Reps" />
                          <input className="form-input" style={{ padding: "5px 8px", fontSize: 12, flex: 1 }} defaultValue={l.weight || ""} placeholder="lbs" />
                        </div>
                        <input className="form-input" style={{ padding: "5px 8px", fontSize: 12, marginTop: 6 }} defaultValue={l.notes} placeholder="Notes (drop set, failure...)" />
                      </div>
                      <button className="btn-icon" style={{ color: "var(--red)", borderColor: "rgba(239,68,68,0.3)" }}>✕</button>
                    </div>
                  ))}
                </div>
                <div style={{ height: 16 }} />
                <button className="btn-amber" style={{ width: "100%", justifyContent: "center", padding: 12, fontSize: 14 }} onClick={() => setView("detail")}>
                  Save Changes
                </button>
                <div style={{ height: 16 }} />
              </div>
            </div>
          )}

          {/* ── AI LOGGER TAB ── */}
          {tab === "ai" && (
            <div className="ai-screen">
              <div className="ai-header">
                <div className="page-title" style={{ fontSize: 30 }}>AI Logger</div>
                <div className="ai-badge">Beta</div>
              </div>

              <div className="active-workout-banner">
                <div className="active-workout-dot" />
                <div>
                  <div className="active-workout-text">Active: Mar 15 · Chest Day</div>
                  <div className="active-workout-sub">Lifts will log here by default</div>
                </div>
              </div>

              <div className="preset-row">
                <div>
                  <div className="preset-label">Default Preset</div>
                  <div className="preset-value">{defaultSets} sets · {defaultReps} reps</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }}
                    onClick={() => setDefaultSets(s => Math.max(1, s - 1))}>−</button>
                  <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }}
                    onClick={() => setDefaultSets(s => s + 1)}>+</button>
                  <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }}
                    onClick={() => setDefaultReps(r => r === "6-8" ? "8-10" : r === "8-10" ? "10-12" : "6-8")}>
                    {defaultReps}
                  </button>
                </div>
              </div>

              <div className="ai-chat-history">
                {aiHistory.map((msg, i) => (
                  msg.role === "user" ? (
                    <div key={i} className="chat-msg-user">
                      <div className="bubble">{msg.text}</div>
                    </div>
                  ) : (
                    <div key={i} className="chat-msg-ai">
                      <div className="ai-avatar">⚡</div>
                      <div className="bubble">
                        {msg.text}
                        {msg.parsed && msg.parsed.map((p, j) => (
                          <div key={j} className="parsed-lift-card">
                            <div>
                              <div className="parsed-lift-name">{p.name}</div>
                              <div className="parsed-lift-detail">{p.sets} sets · {p.reps} reps</div>
                              {p.note && <div className="parse-note">{p.note}</div>}
                            </div>
                            {p.weight && <div className="parsed-lift-weight">{p.weight}lbs</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>

              <div className="ai-input-area">
                <textarea
                  ref={inputRef}
                  className="ai-input"
                  placeholder={`Try: "chst press 170 failed early second set lat fly mach 190 3 sets"`}
                  value={aiMsg}
                  onChange={e => setAiMsg(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendAiMessage(); } }}
                  rows={2}
                />
                <button className="ai-send-btn" onClick={sendAiMessage}>↑</button>
              </div>
            </div>
          )}

          {/* ── SEARCH TAB ── */}
          {tab === "search" && !selectedLift && (
            <div className="search-screen">
              <div className="page-title" style={{ marginBottom: 16 }}>Lifts</div>
              <div className="search-input-wrapper">
                <span className="search-icon">🔍</span>
                <input
                  className="search-input"
                  placeholder="Search lifts..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="search-results">
                {filteredLifts.map(name => {
                  const stats = getLiftStats(name);
                  if (!stats) {
                    return (
                      <div key={name} className="lift-search-card" onClick={() => setSelectedLift(name)}>
                        <div className="lift-search-name">{name}</div>
                        <div className="not-logged-msg" style={{ padding: "12px", background: "var(--surface2)", border: "none" }}>
                          <div className="not-logged-text" style={{ fontSize: 12 }}>This lift has not yet been logged in a workout</div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div key={name} className="lift-search-card" onClick={() => setSelectedLift(name)}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                        <div className="lift-search-name">{name}</div>
                        <span className="badge-green">+{stats.weeklyIncrease} lbs/wk</span>
                      </div>
                      <div className="lift-stats-grid">
                        <div className="lift-stat-item">
                          <div className="lift-stat-label">Last Weight</div>
                          <div className="lift-stat-value lift-stat-accent">{stats.lastWeight} lbs</div>
                        </div>
                        <div className="lift-stat-item">
                          <div className="lift-stat-label">Last Done</div>
                          <div className="lift-stat-value">{formatDate(stats.lastDate)}</div>
                        </div>
                        <div className="lift-stat-item">
                          <div className="lift-stat-label">Weekly Gain</div>
                          <div className="lift-stat-value lift-stat-green">+{stats.weeklyIncrease} lbs</div>
                        </div>
                        <div className="lift-stat-item">
                          <div className="lift-stat-label">Last Chest Day</div>
                          <div className="lift-stat-value" style={{ fontSize: 12 }}>Mar 13</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {filteredLifts.length === 0 && (
                  <div className="not-logged-msg">
                    <div className="not-logged-icon">🏋️</div>
                    <div className="not-logged-text">This lift has not yet been logged in a workout</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "search" && selectedLift && (
            <div>
              <div className="detail-header">
                <button className="back-btn" onClick={() => setSelectedLift(null)}>← Lifts</button>
                <div className="detail-title" style={{ fontSize: 34 }}>{selectedLift}</div>
                {(() => {
                  const stats = getLiftStats(selectedLift);
                  if (!stats) return (
                    <div style={{ marginTop: 16 }}>
                      <div className="not-logged-msg">
                        <div className="not-logged-icon">📋</div>
                        <div className="not-logged-text">This lift has not yet been logged in a workout</div>
                      </div>
                    </div>
                  );
                  return (
                    <>
                      <div className="detail-meta-row">
                        <div className="detail-meta-item">
                          <div className="detail-meta-label">Last Weight</div>
                          <div className="detail-meta-value" style={{ color: "var(--amber)" }}>{stats.lastWeight} lbs</div>
                        </div>
                        <div className="detail-meta-item">
                          <div className="detail-meta-label">Weekly Gain</div>
                          <div className="detail-meta-value" style={{ color: "var(--green)" }}>+{stats.weeklyIncrease} lbs</div>
                        </div>
                        <div className="detail-meta-item">
                          <div className="detail-meta-label">Last Session</div>
                          <div className="detail-meta-value" style={{ fontSize: 14 }}>{formatDate(stats.lastDate)}</div>
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
              {DB.liftHistory[selectedLift] && (
                <div className="chart-area" style={{ marginTop: 16 }}>
                  <div className="section-title" style={{ marginBottom: 8 }}>Progress Chart</div>
                  <WeightChart data={DB.liftHistory[selectedLift]} />
                </div>
              )}
              <div style={{ height: 24 }} />
            </div>
          )}

        </div>

        {/* NAV */}
        <div className="nav">
          {[
            { id: "workouts", icon: "📋", label: "Sessions" },
            { id: "ai", icon: "⚡", label: "AI Log" },
            { id: "search", icon: "🔍", label: "Lifts" },
          ].map(n => (
            <button key={n.id} className={`nav-item ${tab === n.id ? "active" : ""}`}
              onClick={() => { setTab(n.id); if (n.id !== "workouts") { setView("list"); setSelectedWorkout(null); } if (n.id !== "search") setSelectedLift(null); }}>
              <span className="nav-icon">{n.icon}</span>
              <span className="nav-label">{n.label}</span>
            </button>
          ))}
        </div>

        {/* NEW WORKOUT MODAL */}
        {showNewWorkout && (
          <div className="modal-overlay" onClick={() => setShowNewWorkout(false)}>
            <div className="modal-sheet" onClick={e => e.stopPropagation()}>
              <div className="modal-handle" />
              <div className="modal-title">New Session</div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" defaultValue="2025-03-15" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Start (optional)</label>
                  <input className="form-input" type="time" />
                </div>
                <div className="form-group">
                  <label className="form-label">End (optional)</label>
                  <input className="form-input" type="time" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Mirror Photo (optional)</label>
                <button className="btn-ghost" style={{ width: "100%", padding: 12, textAlign: "center", borderStyle: "dashed" }}>📷 Add Photo</button>
              </div>
              <div className="form-group">
                <label className="form-label">Muscle Groups (optional)</label>
                <div className="muscle-toggle-grid">
                  {MUSCLES_ALL.map(m => (
                    <button key={m} className={`muscle-toggle ${newWorkout.muscles.includes(m) ? "active" : ""}`}
                      onClick={() => setNewWorkout(w => ({
                        ...w,
                        muscles: w.muscles.includes(m) ? w.muscles.filter(x => x !== m) : [...w.muscles, m]
                      }))}>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="ai-infer-toggle" onClick={() => setNewWorkout(w => ({ ...w, aiInfer: !w.aiInfer }))}>
                <div className={`toggle-track ${newWorkout.aiInfer ? "on" : ""}`}>
                  <div className="toggle-thumb" />
                </div>
                <div>
                  <div className="toggle-label">AI Muscle Inference</div>
                  <div className="toggle-sub">Auto-detect muscle groups from logged lifts</div>
                </div>
              </div>
              <div style={{ height: 16 }} />
              <button className="btn-amber" style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15 }}
                onClick={() => setShowNewWorkout(false)}>
                Create Session
              </button>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        {showDeleteConfirm && (
          <div className="confirm-dialog">
            <div className="confirm-box">
              <div className="confirm-title">Delete Session?</div>
              <div className="confirm-sub">This will permanently remove the workout and all its logged lifts. This cannot be undone.</div>
              <div className="confirm-actions">
                <button className="btn-ghost" style={{ padding: 12 }} onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                <button className="btn-danger" style={{ padding: 12, flex: 1 }} onClick={() => deleteWorkout(showDeleteConfirm)}>Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
