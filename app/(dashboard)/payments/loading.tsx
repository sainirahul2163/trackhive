export default function PaymentsLoading() {
  return (
    <div className="space-y-5 max-w-7xl animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-28 bg-white/[0.06] rounded-lg" />
          <div className="h-4 w-60 bg-white/[0.04] rounded-lg" />
        </div>
        <div className="flex gap-2">
          <div className="h-9 w-24 bg-white/[0.04] rounded-lg" />
          <div className="h-9 w-32 bg-white/[0.06] rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-[#111111] p-4 space-y-3">
            <div className="h-3 w-20 bg-white/[0.06] rounded" />
            <div className="h-6 w-20 bg-white/[0.08] rounded" />
            <div className="h-3 w-16 bg-white/[0.04] rounded" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => <div key={i} className="h-9 w-24 bg-white/[0.04] rounded-lg" />)}
      </div>
      <div className="rounded-xl border border-white/[0.06] bg-[#111111] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.04] flex gap-3">
          <div className="h-4 w-28 bg-white/[0.06] rounded" />
          <div className="h-4 w-20 ml-auto bg-white/[0.04] rounded" />
        </div>
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-white/[0.03]">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 w-28 bg-white/[0.06] rounded" />
              <div className="h-3 w-20 bg-white/[0.04] rounded" />
            </div>
            <div className="h-3.5 w-16 bg-white/[0.04] rounded" />
            <div className="h-5 w-16 bg-white/[0.04] rounded-full" />
            <div className="h-3.5 w-20 bg-white/[0.04] rounded" />
            <div className="h-7 w-20 bg-white/[0.04] rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  )
}
