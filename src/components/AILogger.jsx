import { useState, useRef } from "react";
import { parseLiftMessage } from "../lib/gemini";
import { formatDate } from "../lib/constants";

const INITIAL_MSG = {
  role: "ai",
  text: "Ready to log. Send me your lifts — typos and shorthand are fine. I'll use your defaults for anything unspecified.",
  parsed: null,
};

export default function AILogger({ activeWorkout, onAddLifts }) {
  const [aiMsg, setAiMsg] = useState("");
  const [history, setHistory] = useState([INITIAL_MSG]);
  const [defaultSets, setDefaultSets] = useState(2);
  const [defaultReps, setDefaultReps] = useState("6-8");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();

  async function sendMessage() {
    const msg = aiMsg.trim();
    if (!msg || loading) return;

    const userMsg = { role: "user", text: msg };
    setHistory(h => [...h, userMsg]);
    setAiMsg("");
    setLoading(true);

    try {
      const result = await parseLiftMessage(msg, { sets: defaultSets, reps: defaultReps });
      const aiResp = { role: "ai", text: result.reply, parsed: result.lifts };
      setHistory(h => [...h, aiResp]);

      if (activeWorkout && result.lifts?.length > 0) {
        await onAddLifts(activeWorkout.id, result.lifts);
      }
    } catch (e) {
      setHistory(h => [...h, {
        role: "ai",
        text: `Sorry, I hit an error: ${e.message}. Try again or check your API key.`,
        parsed: null,
      }]);
    }
    setLoading(false);
  }

  function cycleReps() {
    setDefaultReps(r => r === "6-8" ? "8-10" : r === "8-10" ? "10-12" : "6-8");
  }

  return (
    <div className="ai-screen">
      <div className="ai-header">
        <div className="page-title" style={{ fontSize: 30 }}>AI Logger</div>
        <div className="ai-badge">Gemini</div>
      </div>

      {activeWorkout ? (
        <div className="active-workout-banner">
          <div className="active-workout-dot" />
          <div>
            <div className="active-workout-text">Active: {formatDate(activeWorkout.date)}</div>
            <div className="active-workout-sub">Lifts will log to this session</div>
          </div>
        </div>
      ) : (
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "10px 14px", marginBottom: 16, fontFamily: "var(--font-display)", fontSize: 12, color: "var(--text-dim)", letterSpacing: "0.05em" }}>
          No active session — create one first to auto-save lifts
        </div>
      )}

      <div className="preset-row">
        <div>
          <div className="preset-label">Default Preset</div>
          <div className="preset-value">{defaultSets} sets · {defaultReps} reps</div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setDefaultSets(s => Math.max(1, s - 1))}>−</button>
          <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={() => setDefaultSets(s => s + 1)}>+</button>
          <button className="btn-ghost" style={{ padding: "5px 10px", fontSize: 11 }} onClick={cycleReps}>{defaultReps}</button>
        </div>
      </div>

      <div className="ai-chat-history">
        {history.map((msg, i) =>
          msg.role === "user" ? (
            <div key={i} className="chat-msg-user">
              <div className="bubble">{msg.text}</div>
            </div>
          ) : (
            <div key={i} className="chat-msg-ai">
              <div className="ai-avatar">⚡</div>
              <div className="bubble">
                {msg.text}
                {msg.parsed?.map((p, j) => (
                  <div key={j} className="parsed-lift-card">
                    <div>
                      <div className="parsed-lift-name">{p.name}</div>
                      <div className="parsed-lift-detail">{p.sets} sets · {p.reps} reps</div>
                      {p.notes && <div className="parse-note">{p.notes}</div>}
                    </div>
                    {p.weight && <div className="parsed-lift-weight">{p.weight}lbs</div>}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
        {loading && (
          <div className="chat-msg-ai">
            <div className="ai-avatar">⚡</div>
            <div className="bubble" style={{ color: "var(--text-muted)", fontStyle: "italic" }}>Parsing…</div>
          </div>
        )}
      </div>

      <div className="ai-input-area">
        <textarea
          ref={inputRef}
          className="ai-input"
          placeholder={`e.g. "chst press 185 failed set 3, lat fly 190 3 sets"`}
          value={aiMsg}
          onChange={e => setAiMsg(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          rows={2}
        />
        <button className="ai-send-btn" disabled={loading || !aiMsg.trim()} onClick={sendMessage}>↑</button>
      </div>
    </div>
  );
}
