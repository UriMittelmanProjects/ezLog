import { MUSCLE_COLORS, MUSCLE_ICONS, getDuration, formatDate } from "../lib/constants";

export default function WorkoutList({ workouts, onView, onEdit, onDelete, onNew }) {
  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Sessions</div>
          <div className="page-subtitle">{workouts.length} logged workout{workouts.length !== 1 ? "s" : ""}</div>
        </div>
        <button className="btn-amber" onClick={onNew}>+ New</button>
      </div>

      <div className="workout-list">
        {workouts.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🏋️</div>
            <div className="empty-text">No sessions yet. Log your first workout!</div>
          </div>
        )}

        {workouts.map(w => {
          const muscles = w.muscle_groups ?? [];
          const lifts = w.lifts ?? [];

          return (
            <div key={w.id} className="workout-card">
              <div className="workout-card-top">
                <div className="workout-date">{formatDate(w.date)}</div>
              </div>

              <div className="workout-meta">
                <div className="meta-pill">⏱ <span>{getDuration(w.start_time, w.end_time)}</span></div>
                {w.start_time && <div className="meta-pill">🕐 <span>{w.start_time}</span></div>}
                <div className="meta-pill">🏋️ <span>{lifts.length} lift{lifts.length !== 1 ? "s" : ""}</span></div>
              </div>

              {muscles.length > 0 && (
                <div className="muscle-chips">
                  {muscles.map(name => (
                    <div key={name} className="muscle-chip" style={{
                      background: (MUSCLE_COLORS[name] || "#888") + "18",
                      border: `1px solid ${(MUSCLE_COLORS[name] || "#888")}40`,
                      color: MUSCLE_COLORS[name] || "#888",
                    }}>
                      {MUSCLE_ICONS[name] || "◉"} {name}
                    </div>
                  ))}
                </div>
              )}

              <div className="card-actions">
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => onView(w)}>View</button>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => onEdit(w)}>Edit</button>
                <button className="btn-danger" onClick={() => onDelete(w.id)}>Delete</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
