import { useState } from "react";
import { KNOWN_LIFTS, formatDate } from "../lib/constants";
import WeightChart from "./WeightChart";

function getLiftStats(history) {
  if (!history || history.length === 0) return null;
  const last = history[history.length - 1];
  const prev = history[history.length - 2];
  const weeklyIncrease =
    history.length > 1
      ? ((last.weight - history[0].weight) / ((history.length - 1) * 0.5)).toFixed(1)
      : "0.0";
  return { lastDate: last.date, lastWeight: last.weight, weeklyIncrease, prevWeight: prev?.weight };
}

export default function LiftSearch({ liftHistory }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLift, setSelectedLift] = useState(null);

  // Merge known lifts with any lifts in history not in the known list
  const historyNames = Object.keys(liftHistory);
  const allNames = [...new Set([...KNOWN_LIFTS, ...historyNames])];

  const filtered = searchQuery.length > 0
    ? allNames.filter(l => l.toLowerCase().includes(searchQuery.toLowerCase()))
    : allNames.slice(0, 8);

  if (selectedLift) {
    const hist = liftHistory[selectedLift] ?? null;
    const stats = getLiftStats(hist);

    return (
      <div>
        <div className="detail-header">
          <button className="back-btn" onClick={() => setSelectedLift(null)}>← Lifts</button>
          <div className="detail-title" style={{ fontSize: 34 }}>{selectedLift}</div>

          {!stats ? (
            <div style={{ marginTop: 16 }}>
              <div className="not-logged-msg">
                <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>📋</div>
                <div className="not-logged-text">Not yet logged in any workout.</div>
              </div>
            </div>
          ) : (
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
          )}
        </div>

        {hist && hist.length >= 2 && (
          <div className="chart-area" style={{ marginTop: 16 }}>
            <div className="section-title" style={{ marginBottom: 8 }}>Progress Chart</div>
            <WeightChart data={hist} />
          </div>
        )}

        <div style={{ height: 24 }} />
      </div>
    );
  }

  return (
    <div className="search-screen">
      <div className="page-title" style={{ marginBottom: 16 }}>Lifts</div>

      <div className="search-input-wrapper">
        <span className="search-icon">🔍</span>
        <input
          className="search-input"
          placeholder="Search lifts…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="search-results">
        {filtered.map(name => {
          const stats = getLiftStats(liftHistory[name]);
          return (
            <div key={name} className="lift-search-card" onClick={() => setSelectedLift(name)}>
              {!stats ? (
                <>
                  <div className="lift-search-name">{name}</div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.08em" }}>Not logged yet</div>
                </>
              ) : (
                <>
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
                    {stats.prevWeight && (
                      <div className="lift-stat-item">
                        <div className="lift-stat-label">Prev Weight</div>
                        <div className="lift-stat-value">{stats.prevWeight} lbs</div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="not-logged-msg">
            <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.4 }}>🏋️</div>
            <div className="not-logged-text">No lifts match "{searchQuery}"</div>
          </div>
        )}
      </div>
    </div>
  );
}
