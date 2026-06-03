export default function CreatorLoading() {
  return (
    <div style={{ maxWidth: "1000px", display: "flex", flexDirection: "column", gap: "20px" }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ height: "22px", width: "160px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.06)", marginBottom: "8px", animation: "pulse 1.6s ease-in-out infinite" }} />
          <div style={{ height: "13px", width: "240px", borderRadius: "5px", backgroundColor: "rgba(255,255,255,0.04)", animation: "pulse 1.6s ease-in-out infinite 0.2s" }} />
        </div>
        <div style={{ height: "36px", width: "120px", borderRadius: "9px", backgroundColor: "rgba(255,255,255,0.05)", animation: "pulse 1.6s ease-in-out infinite 0.1s" }} />
      </div>

      {/* Stat cards skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "10px" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ height: "72px", borderRadius: "12px", backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.06)", animation: `pulse 1.6s ease-in-out infinite ${i * 0.1}s` }} />
        ))}
      </div>

      {/* Chart skeleton */}
      <div style={{ height: "220px", borderRadius: "14px", backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.06)", animation: "pulse 1.6s ease-in-out infinite 0.3s" }} />

      {/* List skeletons */}
      {[0,1,2].map(i => (
        <div key={i} style={{ height: "80px", borderRadius: "12px", backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.06)", animation: `pulse 1.6s ease-in-out infinite ${0.4 + i * 0.1}s` }} />
      ))}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
