import { useState } from "react";
import { MUSCLES_ALL } from "../lib/constants";

export default function WorkoutEdit({ workout, onBack, onSave, onAddLift, onUpdateLift, onDeleteLift }) {
  const lifts = workout.lifts ?? [];

  const [date, setDate] = useState(workout.date ?? "");
  const [startTime, setStartTime] = useState(workout.start_time ?? "");
  const [endTime, setEndTime] = useState(workout.end_time ?? "");
  const [muscles, setMuscles] = useState(workout.muscle_groups ?? []);
  const [saving, setSaving] = useState(false);
  const [liftEdits, setLiftEdits] = useState(
    lifts.reduce((acc, l) => ({
      ...acc,
      [l.id]: { name: l.name, sets: l.sets, reps: l.reps, weight: l.weight ?? "", notes: l.notes ?? "" }
    }), {})
  );
  const [newLift, setNewLift] = useState({ name: "", sets: 3, reps: "8-10", weight: "", notes: "" });
  const [showAddLift, setShowAddLift] = useState(false);

  function toggleMuscle(m) {
    setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }

  async function handleSave() {
    setSaving(true);
    await onSave(workout.id, { date, start_time: startTime || null, end_time: endTime || null, muscles });
    for (const [id, vals] of Object.entries(liftEdits)) {
      await onUpdateLift(id, {
        name: vals.name,
        sets: Number(vals.sets),
        reps: vals.reps,
        weight: vals.weight ? Number(vals.weight) : 0,
        notes: vals.notes,
      });
    }
    setSaving(false);
    onBack();
  }

  async function handleAddLift() {
    if (!newLift.name.trim()) return;
    await onAddLift(workout.id, {
      name: newLift.name.trim(),
      sets: Number(newLift.sets),
      reps: newLift.reps,
      weight: newLift.weight ? Number(newLift.weight) : 0,
      notes: newLift.notes,
    });
    setNewLift({ name: "", sets: 3, reps: "8-10", weight: "", notes: "" });
    setShowAddLift(false);
  }

  function updateLiftField(id, field, val) {
    setLiftEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: val } }));
  }

  return (
    <div>
      <div className="detail-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <div className="detail-title">Edit</div>
      </div>

      <div style={{ padding: "12px 20px" }}>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start</label>
            <input className="form-input" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">End</label>
            <input className="form-input" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Muscle Groups</label>
          <div className="muscle-toggle-grid">
            {MUSCLES_ALL.map(m => (
              <button key={m} className={`muscle-toggle ${muscles.includes(m) ? "active" : ""}`} onClick={() => toggleMuscle(m)}>{m}</button>
            ))}
          </div>
        </div>

        <div className="divider" />

        <div className="section-header" style={{ padding: "0 0 10px" }}>
          <div className="section-title">Lifts</div>
          <button className="btn-amber" style={{ fontSize: 11, padding: "6px 10px" }} onClick={() => setShowAddLift(v => !v)}>+ Add</button>
        </div>

        {showAddLift && (
          <div className="lift-row" style={{ flexDirection: "column", alignItems: "stretch", gap: 8, marginBottom: 8 }}>
            <input className="form-input" style={{ padding: "6px 10px", fontSize: 13 }} placeholder="Exercise name" value={newLift.name} onChange={e => setNewLift(v => ({ ...v, name: e.target.value }))} />
            <div style={{ display: "flex", gap: 6 }}>
              <input className="form-input" style={{ padding: "5px 8px", fontSize: 12, width: 60 }} placeholder="Sets" value={newLift.sets} onChange={e => setNewLift(v => ({ ...v, sets: e.target.value }))} />
              <input className="form-input" style={{ padding: "5px 8px", fontSize: 12, width: 60 }} placeholder="Reps" value={newLift.reps} onChange={e => setNewLift(v => ({ ...v, reps: e.target.value }))} />
              <input className="form-input" style={{ padding: "5px 8px", fontSize: 12, flex: 1 }} placeholder="lbs" value={newLift.weight} onChange={e => setNewLift(v => ({ ...v, weight: e.target.value }))} />
            </div>
            <input className="form-input" style={{ padding: "5px 8px", fontSize: 12 }} placeholder="Notes (optional)" value={newLift.notes} onChange={e => setNewLift(v => ({ ...v, notes: e.target.value }))} />
            <div style={{ display: "flex", gap: 6 }}>
              <button className="btn-amber" style={{ flex: 1, justifyContent: "center" }} onClick={handleAddLift}>Add Lift</button>
              <button className="btn-ghost" onClick={() => setShowAddLift(false)}>Cancel</button>
            </div>
          </div>
        )}

        <div className="lift-rows" style={{ padding: 0, gap: 8 }}>
          {lifts.map(l => {
            const ed = liftEdits[l.id] ?? {};
            return (
              <div key={l.id} className="lift-row" style={{ gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <input className="form-input" style={{ padding: "6px 10px", fontSize: 13, marginBottom: 6 }} value={ed.name ?? ""} onChange={e => updateLiftField(l.id, "name", e.target.value)} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <input className="form-input" style={{ padding: "5px 8px", fontSize: 12, width: 60 }} value={ed.sets ?? ""} placeholder="Sets" onChange={e => updateLiftField(l.id, "sets", e.target.value)} />
                    <input className="form-input" style={{ padding: "5px 8px", fontSize: 12, width: 60 }} value={ed.reps ?? ""} placeholder="Reps" onChange={e => updateLiftField(l.id, "reps", e.target.value)} />
                    <input className="form-input" style={{ padding: "5px 8px", fontSize: 12, flex: 1 }} value={ed.weight ?? ""} placeholder="lbs" onChange={e => updateLiftField(l.id, "weight", e.target.value)} />
                  </div>
                  <input className="form-input" style={{ padding: "5px 8px", fontSize: 12, marginTop: 6 }} value={ed.notes ?? ""} placeholder="Notes" onChange={e => updateLiftField(l.id, "notes", e.target.value)} />
                </div>
                <button className="btn-icon" style={{ color: "var(--red)", borderColor: "rgba(239,68,68,0.3)" }} onClick={() => onDeleteLift(l.id)}>✕</button>
              </div>
            );
          })}
        </div>

        <div style={{ height: 16 }} />
        <button className="btn-amber" disabled={saving} style={{ width: "100%", justifyContent: "center", padding: 12, fontSize: 14 }} onClick={handleSave}>
          {saving ? "Saving…" : "Save Changes"}
        </button>
        <div style={{ height: 16 }} />
      </div>
    </div>
  );
}
