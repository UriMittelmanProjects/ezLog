import { useState } from "react";
import { MUSCLES_ALL, today } from "../lib/constants";

export default function NewWorkoutModal({ onClose, onCreate }) {
  const [date, setDate] = useState(today());
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [muscles, setMuscles] = useState([]);
  const [aiInfer, setAiInfer] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  function toggleMuscle(m) {
    setMuscles(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m]);
  }

  async function handleCreate() {
    setSaving(true);
    setError(null);
    try {
      await onCreate({ date, start_time: startTime || null, end_time: endTime || null, muscles, ai_infer: aiInfer });
      onClose();
    } catch (e) {
      setError(e.message);
    }
    setSaving(false);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">New Session</div>

        {error && <div className="error-msg">{error}</div>}

        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Start (optional)</label>
            <input className="form-input" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">End (optional)</label>
            <input className="form-input" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Muscle Groups (optional)</label>
          <div className="muscle-toggle-grid">
            {MUSCLES_ALL.map(m => (
              <button key={m} className={`muscle-toggle ${muscles.includes(m) ? "active" : ""}`} onClick={() => toggleMuscle(m)}>{m}</button>
            ))}
          </div>
        </div>

        <div className="ai-infer-toggle" onClick={() => setAiInfer(v => !v)}>
          <div className={`toggle-track ${aiInfer ? "on" : ""}`}>
            <div className="toggle-thumb" />
          </div>
          <div>
            <div className="toggle-label">AI Muscle Inference</div>
            <div className="toggle-sub">Auto-detect muscle groups from logged lifts</div>
          </div>
        </div>

        <div style={{ height: 16 }} />
        <button
          className="btn-amber"
          disabled={saving}
          style={{ width: "100%", justifyContent: "center", padding: 14, fontSize: 15 }}
          onClick={handleCreate}
        >
          {saving ? "Creating…" : "Create Session"}
        </button>
      </div>
    </div>
  );
}
