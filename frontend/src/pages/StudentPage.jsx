import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Zap, Calendar, TrendingUp, AlertTriangle, XCircle, CheckCircle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadialBarChart, RadialBar, Cell, PieChart, Pie, Legend
} from 'recharts'

const EASE_COLORS = { again: '#ef4444', hard: '#f59e0b', good: '#5b6af7', easy: '#22c55e' }

function Skeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-8 w-48 shimmer-bg rounded-xl" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[...Array(4)].map((_,i) => <div key={i} className="h-24 shimmer-bg rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(2)].map((_,i) => <div key={i} className="h-64 shimmer-bg rounded-2xl" />)}
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, icon: Icon, color = 'text-ink-50' }) {
  return (
    <div className="card-sm">
      <div className="flex items-start justify-between mb-3">
        <p className="label">{label}</p>
        {Icon && <Icon size={15} className="text-ink-500" />}
      </div>
      <p className={`stat-value ${color}`}>{value}</p>
      {sub && <p className="text-xs text-ink-400 mt-1">{sub}</p>}
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-ink-800 border border-ink-600 rounded-xl px-4 py-3 text-sm shadow-xl">
      <p className="font-display font-medium text-ink-100 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono">{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function StudentPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`http://localhost:3001/api/stats/${id}`, { credentials: 'include' })
      .then(r => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="max-w-5xl mx-auto animate-fade-up"><Skeleton /></div>
  if (!data) return <div className="text-center py-20 text-ink-400">Student data not found.</div>

  const { summary, charts, validation, studentName, deckType, weekWindow } = data
  const easeData = [
    { name: 'Again', value: charts.easeDistribution.again, fill: EASE_COLORS.again },
    { name: 'Hard', value: charts.easeDistribution.hard, fill: EASE_COLORS.hard },
    { name: 'Good', value: charts.easeDistribution.good, fill: EASE_COLORS.good },
    { name: 'Easy', value: charts.easeDistribution.easy, fill: EASE_COLORS.easy },
  ]
  const retColor = summary.retention >= 70 ? 'text-success' : summary.retention >= 40 ? 'text-warning' : 'text-danger'

  return (
    <div className="max-w-5xl mx-auto space-y-7 animate-fade-up">
      {/* Header */}
      <div>
        <button onClick={() => navigate('/compare')} className="btn-ghost flex items-center gap-2 mb-4 -ml-2">
          <ArrowLeft size={15} /> Back
        </button>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink-50">{studentName}</h1>
              <span className={`badge ${deckType === 'vocabulary' ? 'bg-brand/20 text-brand-300' : 'bg-warning/15 text-warning'}`}>
                {deckType}
              </span>
            </div>
            <p className="text-ink-400 text-xs md:text-sm">
              Week of {weekWindow.start} — data from {weekWindow.dataStart} to {weekWindow.dataEnd}
            </p>
          </div>
        </div>
      </div>

      {/* Validation flags */}
      {validation.flags.length > 0 && (
        <div className="space-y-2">
          {validation.flags.map((f, i) => (
            <div key={i} className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm border ${
              f.level === 'error' ? 'bg-danger/10 border-danger/20 text-danger' : 'bg-warning/10 border-warning/20 text-warning'
            }`}>
              {f.level === 'error' ? <XCircle size={15} className="mt-0.5 flex-shrink-0" /> : <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />}
              {f.message}
            </div>
          ))}
        </div>
      )}
      {validation.flags.length === 0 && (
        <div className="flex items-center gap-2 text-success text-sm">
          <CheckCircle size={15} /> All validation checks passed
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Retention rate" value={`${summary.retention}%`} sub="Good + Easy" icon={TrendingUp} color={retColor} />
        <StatCard label="Cards reviewed" value={summary.totalReviews} sub={`${summary.activeDays} active days`} icon={Zap} />
        <StatCard label="Avg. time / card" value={`${Math.round(summary.avgTimePerCard / 1000)}s`} sub="per review" icon={Clock} />
        <StatCard label="Top button" value={summary.dominantButton}
          color={summary.dominantButton === 'Again' ? 'text-danger' : summary.dominantButton === 'Hard' ? 'text-warning' : summary.dominantButton === 'Good' ? 'text-brand-300' : 'text-success'}
          icon={Calendar}
          sub="most pressed"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Daily activity */}
        <div className="card">
          <h3 className="font-display font-semibold text-ink-100 mb-1">Daily practice</h3>
          <p className="text-xs text-ink-400 mb-5">Cards reviewed per session</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={charts.dailyActivity} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="#232b3e" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#636d87', fontSize: 11, fontFamily: 'DM Sans' }}
                tickFormatter={v => v.slice(5)} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#636d87', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(91,106,247,0.08)' }} />
              <Bar dataKey="count" name="Cards" fill="#5b6af7" radius={[6,6,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Button distribution */}
        <div className="card">
          <h3 className="font-display font-semibold text-ink-100 mb-1">Button distribution</h3>
          <p className="text-xs text-ink-400 mb-5">How the student rated each card</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={easeData} barSize={36} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#232b3e" horizontal={false} />
              <XAxis type="number" tick={{ fill: '#636d87', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fill: '#9aa0b4', fontSize: 12, fontFamily: 'DM Sans' }} axisLine={false} tickLine={false} width={44} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
              <Bar dataKey="value" name="Times pressed" radius={[0,6,6,0]}>
                {easeData.map((e, i) => <Cell key={i} fill={e.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Time spent distribution */}
      <div className="card">
        <h3 className="font-display font-semibold text-ink-100 mb-1">Time spent per card</h3>
        <p className="text-xs text-ink-400 mb-5">How long the student spent on each card — cards hitting 60s were likely left open</p>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={charts.timeDistribution} barSize={44}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232b3e" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: '#636d87', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#636d87', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(91,106,247,0.08)' }} />
            <Bar dataKey="count" name="Cards" radius={[6,6,0,0]}>
              {charts.timeDistribution.map((b, i) => (
                <Cell key={i} fill={b.label === '60s (capped)' ? '#ef4444' : '#5b6af7'} fillOpacity={b.label === '60s (capped)' ? 0.8 : 0.7 + i * 0.07} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weak cards */}
      {charts.weaknesses.length > 0 && (
        <div className="card">
          <h3 className="font-display font-semibold text-ink-100 mb-1">Cards to focus on</h3>
          <p className="text-xs text-ink-400 mb-5">Cards rated Again or Hard — sorted by difficulty</p>
          <div className="space-y-2">
            {charts.weaknesses.map((w, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 bg-ink-900 rounded-xl">
                <span className="text-xs font-mono text-ink-500 w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-display text-ink-100 truncate">{w.label}</p>
                  <p className="text-xs text-ink-400 mt-0.5">{w.lapses} lapses · {w.reviewCount} review{w.reviewCount !== 1 ? 's' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-ink-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full"
                      style={{
                        width: `${((w.avgEase - 1) / 3) * 100}%`,
                        background: w.avgEase < 2 ? '#ef4444' : w.avgEase < 3 ? '#f59e0b' : '#5b6af7'
                      }}
                    />
                  </div>
                  <span className={`badge text-xs ${w.lastEase === 1 ? 'bg-danger/15 text-danger' : 'bg-warning/15 text-warning'}`}>
                    {w.lastEase === 1 ? 'Again' : 'Hard'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
