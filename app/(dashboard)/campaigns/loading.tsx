export default function CampaignsLoading() {
  return (
    <div className="space-y-5 max-w-7xl animate-pulse">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-6 w-32 bg-white/[0.06] rounded-lg" />
          <div className="h-4 w-52 bg-white/[0.04] rounded-lg" />
        </div>
        <div className="h-9 w-36 bg-white/[0.06] rounded-lg" />
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-[#111111] p-4 space-y-3">
            <div className="h-3 w-20 bg-white/[0.06] rounded" />
            <div className="h-6 w-16 bg-white/[0.08] rounded" />
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {[...Array(5)].map((_, i) => <div key={i} className="h-9 w-24 bg-white/[0.04] rounded-lg" />)}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-white/[0.06] bg-[#111111] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-32 bg-white/[0.06] rounded" />
              <div className="h-5 w-14 bg-white/[0.04] rounded-full" />
            </div>
            <div className="h-3 w-24 bg-white/[0.04] rounded" />
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-16 bg-white/[0.04] rounded" />
                <div className="h-3 w-10 bg-white/[0.04] rounded" />
              </div>
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full" />
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[...Array(3)].map((_, j) => <div key={j} className="h-10 bg-white/[0.04] rounded-lg" />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
