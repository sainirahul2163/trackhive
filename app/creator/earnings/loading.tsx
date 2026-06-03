export default function EarningsLoading() {
  return (
    <div style={{ maxWidth: "900px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ height: "28px", width: "140px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.06)", animation: "pulse 1.6s infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "10px" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ height: "68px", borderRadius: "12px", backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.06)", animation: `pulse 1.6s infinite ${i*0.1}s` }} />
        ))}
      </div>
      <div style={{ height: "220px", borderRadius: "14px", backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.06)", animation: "pulse 1.6s infinite 0.3s" }} />
      <div style={{ height: "320px", borderRadius: "14px", backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.06)", animation: "pulse 1.6s infinite 0.4s" }} />
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}
