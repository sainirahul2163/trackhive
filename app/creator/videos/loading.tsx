export default function VideosLoading() {
  return (
    <div style={{ maxWidth: "1000px", display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ height: "28px", width: "140px", borderRadius: "6px", backgroundColor: "rgba(255,255,255,0.06)", animation: "pulse 1.6s infinite" }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "10px" }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{ height: "68px", borderRadius: "12px", backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.06)", animation: `pulse 1.6s infinite ${i*0.1}s` }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px,1fr))", gap: "14px" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={{ borderRadius: "14px", border: "1px solid rgba(255,255,255,0.07)", backgroundColor: "#111111", overflow: "hidden", animation: `pulse 1.6s infinite ${i*0.08}s` }}>
            <div style={{ aspectRatio: "16/9", backgroundColor: "rgba(255,255,255,0.03)" }} />
            <div style={{ padding: "12px" }}>
              <div style={{ height: "14px", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.05)", marginBottom: "8px" }} />
              <div style={{ height: "10px", width: "60%", borderRadius: "4px", backgroundColor: "rgba(255,255,255,0.04)" }} />
            </div>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}
