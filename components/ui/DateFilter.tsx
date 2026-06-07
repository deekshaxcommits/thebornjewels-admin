'use client'

import { useState } from 'react'
import { Calendar, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DateFilterState {
    from: string
    to: string
    preset: string
}

const PRESETS = [
    { label: 'Today', value: 'today' },
    { label: 'Yesterday', value: 'yesterday' },
    { label: 'Last 7 days', value: '7d' },
    { label: 'This month', value: 'month' },
    { label: 'Last month', value: 'last_month' },
    { label: 'Last 3 months', value: '3m' },
    { label: 'This year', value: 'year' },
]

export function getDateRange(preset: string): { from: Date; to: Date } {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    switch (preset) {
        case 'today':
            return { from: today, to: new Date(today.getTime() + 86400000 - 1) }
        case 'yesterday': {
            const y = new Date(today); y.setDate(y.getDate() - 1)
            return { from: y, to: new Date(today.getTime() - 1) }
        }
        case '7d': {
            const f = new Date(today); f.setDate(f.getDate() - 6)
            return { from: f, to: new Date(today.getTime() + 86400000 - 1) }
        }
        case 'month': {
            const f = new Date(now.getFullYear(), now.getMonth(), 1)
            return { from: f, to: new Date(today.getTime() + 86400000 - 1) }
        }
        case 'last_month': {
            const f = new Date(now.getFullYear(), now.getMonth() - 1, 1)
            const t = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
            return { from: f, to: t }
        }
        case '3m': {
            const f = new Date(today); f.setMonth(f.getMonth() - 3)
            return { from: f, to: new Date(today.getTime() + 86400000 - 1) }
        }
        case 'year': {
            const f = new Date(now.getFullYear(), 0, 1)
            return { from: f, to: new Date(today.getTime() + 86400000 - 1) }
        }
        default:
            return { from: new Date(0), to: new Date() }
    }
}

/** Returns true if `date` falls within [from, to]. Pass empty strings to skip filtering. */
export function isInDateRange(dateStr: string, from: string, to: string, preset: string): boolean {
    if (!preset && !from && !to) return true
    const d = new Date(dateStr)
    if (preset) {
        const { from: f, to: t } = getDateRange(preset)
        return d >= f && d <= t
    }
    if (from && d < new Date(from)) return false
    if (to && d > new Date(to + 'T23:59:59')) return false
    return true
}

interface Props {
    value: DateFilterState
    onChange: (v: DateFilterState) => void
    className?: string
}

export default function DateFilter({ value, onChange, className }: Props) {
    const [open, setOpen] = useState(false)

    const clear = () => onChange({ from: '', to: '', preset: '' })
    const active = value.preset || value.from || value.to

    const label = value.preset
        ? PRESETS.find(p => p.value === value.preset)?.label
        : value.from || value.to
            ? `${value.from || '...'} → ${value.to || '...'}`
            : 'Date'

    return (
        <div className={cn('relative', className)}>
            <button
                onClick={() => setOpen(v => !v)}
                className={cn(
                    'flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors',
                    active ? 'border-amber-400 bg-amber-50 text-amber-800' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                )}
            >
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">{label}</span>
                <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                {active && (
                    <span
                        onClick={(e) => { e.stopPropagation(); clear() }}
                        className="ml-0.5 text-amber-600 hover:text-red-500"
                    >
                        <X className="h-3 w-3" />
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                    <div className="absolute top-full mt-1.5 left-0 z-20 bg-white border border-gray-200 rounded-xl shadow-lg w-64 p-3">
                        {/* Quick presets */}
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Quick filters</p>
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {PRESETS.map(p => (
                                <button
                                    key={p.value}
                                    onClick={() => { onChange({ from: '', to: '', preset: p.value }); setOpen(false) }}
                                    className={cn(
                                        'text-xs px-2.5 py-1 rounded-full border transition-colors',
                                        value.preset === p.value ? 'bg-amber-100 border-amber-400 text-amber-800' : 'border-gray-200 text-gray-600 hover:border-amber-300'
                                    )}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>

                        {/* Custom range */}
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Custom range</p>
                        <div className="space-y-2">
                            <div>
                                <label className="text-xs text-gray-500 block mb-0.5">From</label>
                                <input
                                    type="date"
                                    value={value.from}
                                    onChange={e => onChange({ ...value, preset: '', from: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 block mb-0.5">To</label>
                                <input
                                    type="date"
                                    value={value.to}
                                    onChange={e => onChange({ ...value, preset: '', to: e.target.value })}
                                    className="w-full border border-gray-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-300"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end mt-3">
                            <button onClick={() => { clear(); setOpen(false) }} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
