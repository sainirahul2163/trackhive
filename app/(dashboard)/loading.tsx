export default function DashboardLoading() {
  return (
    <div className="space-y-5 max-w-7xl animate-pulse">
      {/* Header skeleton */}
      <div className="space-y-2">
        <div className="h-6 w-40 bg-white/[0.06] rounded-lg" />
        <div className="h-4 w-64 bg-white/[0.04] rounded-lg" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-[#111111] p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-white/[0.06] rounded" />
              <div className="w-7 h-7 rounded-lg bg-white/[0.04]" />
            </div>
            <div className="h-6 w-16 bg-white/[0.08] rounded" />
            <div className="h-3 w-24 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="space-y-2">
            <div className="h-4 w-32 bg-white/[0.06] rounded" />
            <div className="h-3 w-48 bg-white/[0.04] rounded" />
          </div>
          <div className="h-8 w-32 bg-white/[0.04] rounded-lg" />
        </div>
        <div className="h-[220px] bg-white/[0.03] rounded-xl" />
      </div>

      {/* Table skeleton */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
          <div className="h-4 w-28 bg-white/[0.06] rounded" />
          <div className="h-4 w-16 bg-white/[0.04] rounded" />
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.03]">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-36 bg-white/[0.06] rounded" />
              <div className="h-3 w-24 bg-white/[0.04] rounded" />
            </div>
            <div className="h-3.5 w-14 bg-white/[0.04] rounded" />
            <div className="h-3.5 w-14 bg-white/[0.04] rounded" />
            <div className="h-3.5 w-14 bg-white/[0.04] rounded" />
            <div className="h-3.5 w-10 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
