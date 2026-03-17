export default function WeightChart({ data }) {
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
      <div style={{ fontFamily: "var(--font-display)", fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
        Weight Progression (lbs)
      </div>
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
            <text x={x} y={y - 8} textAnchor="middle" fill="#f0ede8" fontSize="9" fontFamily="Barlow Condensed" fontWeight="700">
              {data[i].weight}
            </text>
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
