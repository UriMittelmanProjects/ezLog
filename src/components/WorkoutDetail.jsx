import { MUSCLE_COLORS, MUSCLE_ICONS, getDuration, formatDate } from "../lib/constants";

export default function WorkoutDetail({ workout, onBack, onEdit, onDelete }) {
  const muscles = workout.muscle_groups ?? [];
  const lifts = workout.lifts ?? [];

  return (
    <div>
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="detail-title">{formatDate(workout.date)}</div>

        <div className="detail-meta-row">
          {workout.start_time && (
            <div className="detail-meta-item">
              <div className="detail-meta-label">Start</div>
              <div className="detail-meta-value">{workout.start_time}</div>
            </div>
          )}
          {workout.end_time && (
            <div className="detail-meta-item">
              <div className="detail-meta-label">End</div>
              <div className="detail-meta-value">{workout.end_time}</div>
            </div>
          )}
          <div className="detail-meta-item">
            <div className="detail-meta-label">Duration</div>
            <div className="detail-meta-value">{getDuration(workout.start_time, workout.end_time)}</div>
          </div>
        </div>

        {muscles.length > 0 && (
          <div className="muscle-chips" style={{ marginTop: 12 }}>
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

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="btn-ghost" style={{ flex: 1 }} onClick={onEdit}>Edit Workout</button>
          <button className="btn-danger" onClick={() => onDelete(workout.id)}>Delete</button>
        </div>
      </div>

      <div className="section-header">
        <div className="section-title">Lifts · {lifts.length}</div>
      </div>

      <div className="lift-rows">
        {lifts.length === 0 && (
          <div className="not-logged-msg">
            <div className="not-logged-text">No lifts logged yet. Edit this session to add lifts.</div>
          </div>
        )}
        {lifts.map(l => (
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
  );
}
