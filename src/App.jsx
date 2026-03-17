import { useState } from "react";
import "./styles/global.css";

import { useAuth } from "./hooks/useAuth";
import { useWorkouts } from "./hooks/useWorkouts";
import { useLiftHistory } from "./hooks/useLiftHistory";

import Auth from "./components/Auth";
import WorkoutList from "./components/WorkoutList";
import WorkoutDetail from "./components/WorkoutDetail";
import WorkoutEdit from "./components/WorkoutEdit";
import NewWorkoutModal from "./components/NewWorkoutModal";
import AILogger from "./components/AILogger";
import LiftSearch from "./components/LiftSearch";

function StatusBar() {
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  return (
    <div className="status-bar">
      <span>{time}</span>
      <span>●●●●● WiFi ■■■</span>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, signInWithEmail, signUpWithEmail, signOut } = useAuth();
  const { workouts, loading: wLoading, createWorkout, updateWorkout, deleteWorkout, addLift, updateLift, deleteLift } = useWorkouts(user?.id);
  const { history: liftHistory } = useLiftHistory(user?.id);

  const [tab, setTab] = useState("workouts");
  const [view, setView] = useState("list");
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [showNewWorkout, setShowNewWorkout] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Keep selectedWorkout in sync with live workouts data
  const liveSelected = selectedWorkout
    ? workouts.find(w => w.id === selectedWorkout.id) ?? selectedWorkout
    : null;

  // The most recent workout is the "active" one for AI Logger
  const activeWorkout = workouts[0] ?? null;

  async function handleDeleteWorkout(id) {
    await deleteWorkout(id);
    setDeleteConfirmId(null);
    setView("list");
    setSelectedWorkout(null);
  }

  async function handleAddLiftsFromAI(workoutId, lifts) {
    for (const lift of lifts) {
      await addLift(workoutId, {
        name: lift.name,
        sets: lift.sets,
        reps: lift.reps,
        weight: lift.weight ?? 0,
        notes: lift.notes ?? "",
      });
    }
  }

  if (authLoading) {
    return (
      <div className="app">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 844 }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app">
        <Auth onSignIn={signInWithEmail} onSignUp={signUpWithEmail} />
      </div>
    );
  }

  return (
    <div className="app">
      <StatusBar />

      <div className="screen">
        {/* WORKOUTS TAB */}
        {tab === "workouts" && view === "list" && (
          <WorkoutList
            workouts={workouts}
            onView={w => { setSelectedWorkout(w); setView("detail"); }}
            onEdit={w => { setSelectedWorkout(w); setView("edit"); }}
            onDelete={id => setDeleteConfirmId(id)}
            onNew={() => setShowNewWorkout(true)}
          />
        )}

        {tab === "workouts" && view === "detail" && liveSelected && (
          <WorkoutDetail
            workout={liveSelected}
            onBack={() => { setView("list"); setSelectedWorkout(null); }}
            onEdit={() => setView("edit")}
            onDelete={id => setDeleteConfirmId(id)}
          />
        )}

        {tab === "workouts" && view === "edit" && liveSelected && (
          <WorkoutEdit
            workout={liveSelected}
            onBack={() => setView("detail")}
            onSave={updateWorkout}
            onAddLift={addLift}
            onUpdateLift={updateLift}
            onDeleteLift={deleteLift}
          />
        )}

        {/* AI LOGGER TAB */}
        {tab === "ai" && (
          <AILogger
            activeWorkout={activeWorkout}
            onAddLifts={handleAddLiftsFromAI}
          />
        )}

        {/* SEARCH TAB */}
        {tab === "search" && (
          <LiftSearch liftHistory={liftHistory} />
        )}
      </div>

      {/* NAV */}
      <div className="nav">
        {[
          { id: "workouts", icon: "📋", label: "Sessions" },
          { id: "ai", icon: "⚡", label: "AI Log" },
          { id: "search", icon: "🔍", label: "Lifts" },
        ].map(n => (
          <button
            key={n.id}
            className={`nav-item ${tab === n.id ? "active" : ""}`}
            onClick={() => {
              setTab(n.id);
              if (n.id !== "workouts") { setView("list"); setSelectedWorkout(null); }
            }}
          >
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </button>
        ))}
      </div>

      {/* Sign out (small, tucked in nav) */}
      <div style={{ position: "absolute", top: 14, right: 28 }}>
        <button
          onClick={signOut}
          style={{ background: "none", border: "none", color: "var(--text-muted)", fontFamily: "var(--font-display)", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}
        >
          Sign Out
        </button>
      </div>

      {/* NEW WORKOUT MODAL */}
      {showNewWorkout && (
        <NewWorkoutModal
          onClose={() => setShowNewWorkout(false)}
          onCreate={createWorkout}
        />
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirmId && (
        <div className="confirm-dialog">
          <div className="confirm-box">
            <div className="confirm-title">Delete Session?</div>
            <div className="confirm-sub">This will permanently remove the workout and all its logged lifts. This cannot be undone.</div>
            <div className="confirm-actions">
              <button className="btn-ghost" style={{ padding: 12 }} onClick={() => setDeleteConfirmId(null)}>Cancel</button>
              <button className="btn-danger" style={{ padding: 12, flex: 1 }} onClick={() => handleDeleteWorkout(deleteConfirmId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {wLoading && (
        <div style={{ position: "absolute", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "6px 14px", fontFamily: "var(--font-display)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.1em" }}>
          SYNCING…
        </div>
      )}
    </div>
  );
}
