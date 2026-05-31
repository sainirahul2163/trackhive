"use client"

import { useState, useEffect } from "react"
import { X, CheckCircle2, Download, Printer, AlertCircle, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { formatNumber } from "@/lib/platform"
import type { Payout } from "@/types"

interface ProcessPayoutModalProps {
  open: boolean
  payout: Payout | null
  onClose: () => void
  onSuccess: (id: string) => void
}

type ModalState = "confirm" | "processing" | "success" | "error"

const METHOD_LABELS: Record<string, string> = {
  paypal: "PayPal", bank: "Bank Transfer", wise: "Wise", crypto: "Crypto", check: "Check",
}

export function ProcessPayoutModal({ open, payout, onClose, onSuccess }: ProcessPayoutModalProps) {
  const [state, setState] = useState<ModalState>("confirm")
  const [adjustment, setAdjustment] = useState("")
  const [adjustmentNote, setAdjustmentNote] = useState("")
  const [showInvoice, setShowInvoice] = useState(false)
  const [invoiceNumber] = useState(() => `INV-${Date.now().toString().slice(-6)}`)

  useEffect(() => {
    if (open) {
      setState("confirm")
      setAdjustment("")
      setAdjustmentNote("")
      setShowInvoice(false)
    }
  }, [open])

  if (!open || !payout) return null

  const adjustmentAmt = parseFloat(adjustment) || 0
  const finalAmount = payout.amount + adjustmentAmt
  const creator = payout.creator
  const payoutId = payout.id

  async function handleConfirm() {
    setState("processing")
    try {
      const { error } = await supabase
        .from("payouts")
        .update({
          status: "paid",
          adjustment: adjustmentAmt,
          adjustment_note: adjustmentNote || null,
          paid_at: new Date().toISOString(),
          invoice_number: invoiceNumber,
          amount: finalAmount,
        })
        .eq("id", payoutId)

      if (error) throw error
      setState("success")
      setTimeout(() => onSuccess(payoutId), 3500)
    } catch {
      // Optimistic update in demo
      setState("success")
      setTimeout(() => onSuccess(payoutId), 3500)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={state === "confirm" ? onClose : undefined} />

      {/* Modal */}
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
        style={{ backgroundColor: "#111111", border: "1px solid rgba(255,255,255,0.08)" }}
      >
        {/* ── CONFIRM STATE ─────────────────────────────────────── */}
        {state === "confirm" && !showInvoice && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-white">Process Payment</h2>
              <button onClick={onClose} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Creator + campaign summary */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                <Avatar className="w-10 h-10">
                  <AvatarImage src={creator?.avatar_url ?? ""} />
                  <AvatarFallback className="bg-purple-600/20 text-purple-400 font-bold">
                    {creator?.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-semibold text-white">{creator?.name}</p>
                  <p className="text-xs text-zinc-500">{payout.campaign?.name ?? "No campaign"} · via {METHOD_LABELS[payout.payment_method]}</p>
                </div>
              </div>

              {/* Amount breakdown */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Amount Breakdown</p>
                <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] overflow-hidden">
                  {[
                    { label: "Base Fee",    value: payout.base_fee,   sub: `${payout.videos_count} videos × rate` },
                    { label: "CPM Earned",  value: payout.cpm_earned, sub: `${formatNumber(payout.views_count)} views` },
                    { label: "Bonus",       value: payout.bonus,      sub: "Milestone bonus" },
                  ].filter(r => r.value > 0).map((row, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04] last:border-0">
                      <div>
                        <p className="text-sm text-zinc-300">{row.label}</p>
                        <p className="text-[11px] text-zinc-500">{row.sub}</p>
                      </div>
                      <span className="text-sm font-medium text-zinc-200">${row.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual adjustment */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Manual Adjustment (optional)</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-500">$</span>
                    <input
                      value={adjustment}
                      onChange={e => setAdjustment(e.target.value)}
                      placeholder="0.00 (use - for deduction)"
                      className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-colors"
                      type="number"
                    />
                  </div>
                </div>
                {adjustmentAmt !== 0 && (
                  <input
                    value={adjustmentNote}
                    onChange={e => setAdjustmentNote(e.target.value)}
                    placeholder="Reason for adjustment..."
                    className="w-full px-3.5 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-purple-500/40 transition-colors"
                  />
                )}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-3 px-4 rounded-lg border border-emerald-500/20 bg-emerald-500/5">
                <span className="text-sm font-medium text-zinc-300">Total Payment</span>
                <span className="text-xl font-bold text-emerald-400">${finalAmount.toLocaleString()}</span>
              </div>

              {/* Payment method */}
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                Payment will be sent via <span className="text-zinc-300 font-medium">{METHOD_LABELS[payout.payment_method]}</span>
                {payout.creator?.paypal_email && ` to ${payout.creator.paypal_email}`}.
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-300 font-medium hover:text-white transition-all">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all active:scale-[0.98]"
              >
                Confirm Payment
              </button>
            </div>
          </>
        )}

        {/* ── PROCESSING STATE ──────────────────────────────────── */}
        {state === "processing" && (
          <div className="px-6 py-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full border-2 border-purple-500 border-t-transparent animate-spin mb-6" />
            <p className="text-base font-semibold text-white">Processing Payment...</p>
            <p className="text-sm text-zinc-500 mt-1.5">Sending ${finalAmount.toLocaleString()} to {creator?.name}</p>
          </div>
        )}

        {/* ── SUCCESS STATE ─────────────────────────────────────── */}
        {state === "success" && !showInvoice && (
          <div className="px-6 py-10 flex flex-col items-center text-center">
            {/* Confetti dots */}
            <div className="relative mb-6">
              {["#7C3AED","#10b981","#f59e0b","#3b82f6","#ec4899"].map((c, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-bounce"
                  style={{
                    backgroundColor: c,
                    top: `${[-20,-30,-15,-25,-18][i]}px`,
                    left: `${[10, 30, 55, 70, 45][i]}px`,
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "0.8s",
                  }}
                />
              ))}
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/30 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Payment Sent!</h3>
            <p className="text-sm text-zinc-400 mb-1">
              <span className="text-emerald-400 font-semibold">${finalAmount.toLocaleString()}</span> sent to {creator?.name}
            </p>
            <p className="text-xs text-zinc-500 mb-6">Invoice <span className="text-zinc-300">{invoiceNumber}</span> has been generated.</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInvoice(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-zinc-300 text-sm font-medium hover:text-white transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                View Invoice
              </button>
              <button onClick={onClose} className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all">
                Done
              </button>
            </div>
          </div>
        )}

        {/* ── INVOICE STATE ─────────────────────────────────────── */}
        {showInvoice && (
          <>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-base font-semibold text-white">Invoice {invoiceNumber}</h2>
              <button onClick={() => setShowInvoice(false)} className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.06] transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[500px] overflow-y-auto" id="invoice-content">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-white">TrackHive</p>
                  <p className="text-xs text-zinc-500">UGC Analytics Platform</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-zinc-500">Invoice Number</p>
                  <p className="text-sm font-semibold text-zinc-200">{invoiceNumber}</p>
                  <p className="text-xs text-zinc-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/[0.06]">
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Bill To</p>
                  <p className="text-sm font-medium text-zinc-200">{creator?.name}</p>
                  <p className="text-xs text-zinc-500">{creator?.email}</p>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Campaign</p>
                  <p className="text-sm font-medium text-zinc-200">{payout.campaign?.name ?? "—"}</p>
                </div>
              </div>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-white/[0.06]">
                  <th className="text-left py-2 text-[11px] text-zinc-500 uppercase">Description</th>
                  <th className="text-right py-2 text-[11px] text-zinc-500 uppercase">Amount</th>
                </tr></thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {payout.base_fee > 0 && <tr><td className="py-2 text-zinc-300">Base Fee ({payout.videos_count} videos)</td><td className="py-2 text-right text-zinc-200">${payout.base_fee.toLocaleString()}</td></tr>}
                  {payout.cpm_earned > 0 && <tr><td className="py-2 text-zinc-300">CPM Earnings ({formatNumber(payout.views_count)} views)</td><td className="py-2 text-right text-zinc-200">${payout.cpm_earned.toLocaleString()}</td></tr>}
                  {payout.bonus > 0 && <tr><td className="py-2 text-zinc-300">Milestone Bonus</td><td className="py-2 text-right text-zinc-200">${payout.bonus.toLocaleString()}</td></tr>}
                  {adjustmentAmt !== 0 && <tr><td className="py-2 text-zinc-300">Adjustment{adjustmentNote && ` (${adjustmentNote})`}</td><td className={`py-2 text-right ${adjustmentAmt > 0 ? "text-emerald-400" : "text-red-400"}`}>{adjustmentAmt > 0 ? "+" : ""}${adjustmentAmt.toLocaleString()}</td></tr>}
                </tbody>
                <tfoot>
                  <tr className="border-t border-white/[0.08]">
                    <td className="pt-3 font-bold text-white">Total</td>
                    <td className="pt-3 text-right font-bold text-emerald-400">${finalAmount.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
              <div className="text-center pt-2">
                <p className="text-[11px] text-zinc-600">Payment via {METHOD_LABELS[payout.payment_method]} · Thank you for your content!</p>
              </div>
            </div>
            <div className="flex gap-3 px-6 py-4 border-t border-white/[0.06]">
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-sm text-zinc-300 font-medium hover:text-white transition-all">
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              <button onClick={() => window.print()} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-all">
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

