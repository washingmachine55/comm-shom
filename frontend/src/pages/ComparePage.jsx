import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrashIcon, Users, XCircle, AlertTriangle } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell
} from 'recharts'

import process from "node:process"

process.loadEnvFile("../.env")
const BACKEND = process.env.FRONTEND_URL;

function FlagTooltip({ icon, flags }) {
  return (
    <div className="relative group/tip z-99">
      {icon}
      <div className="absolute hidden w-64 mb-2 -translate-x-1/2 pointer-events-none bottom-full left-1/2 group-hover/tip:block ">
        <div className="bg-ink-900 border border-ink-600 rounded-xl px-3 py-2.5 shadow-xl space-y-1.5">
          {flags.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              {f.level === 'error'
                ? <XCircle size={11} className="text-danger mt-0.5 shrink-0" />
                : <AlertTriangle size={11} className="text-warning mt-0.5 shrink-0" />}
              <span className="text-xs leading-snug text-ink-200">{f.message}</span>
            </div>
          ))}
        </div>
        <div className="w-2 h-2 mx-auto -mt-1 rotate-45 border-b border-r bg-ink-900 border-ink-600" />
      </div>
    </div>
  )
}

const EASE_COLORS = { again: '#ef4444', hard: '#f59e0b', good: '#5b6af7', easy: '#22c55e' }
const STUDENT_COLORS = ['#5b6af7','#22c55e','#f59e0b','#ef4444','#a78bfa','#34d399']

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-4 py-3 text-sm border shadow-xl bg-ink-800 border-ink-600 rounded-xl">
      <p className="mb-2 font-medium font-display text-ink-100">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono">{p.name}: {p.value}{p.unit || ''}</p>
      ))}
    </div>
  )
}

export default function ComparePage() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const deleteItem = (id) => {
    fetch(`${BACKEND}/api/stats/${id}`, {
      method: 'DELETE',
    })
      .then(response => {
        if (response.ok) {
          // Update local state to remove the item from UI
          setStudents(students.filter(item => item.id !== id));
        }
      })
      .catch(error => console.error('Error:', error));
  };
  useEffect(() => {
    fetch(`${BACKEND}/api/stats/compare/all`, { credentials: 'include' })
      .then(r => r.json())
      .then(setStudents)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="space-y-5 animate-pulse">
      <div className="w-48 h-8 shimmer-bg rounded-xl" />
      <div className="h-64 shimmer-bg rounded-2xl" />
      <div className="h-64 shimmer-bg rounded-2xl" />
    </div>
  )

  if (!students.length) return (
    <div className="py-20 text-center">
      <Users size={40} className="mx-auto mb-4 text-ink-600" />
      <p className="mb-4 text-ink-400">No students loaded yet.</p>
      <button onClick={() => navigate('/upload')} className="btn-primary">Go to upload</button>
    </div>
  )

  const retentionData = students.map(s => ({ name: s.studentName.split(' ')[0], retention: s.retention, reviews: s.totalReviews }))
  const activityData = students.map(s => ({ name: s.studentName.split(' ')[0], days: s.activeDays, reviews: s.totalReviews }))

  const easeCompare = students.map(s => ({
    name: s.studentName.split(' ')[0],
    Again: s.easeDistribution.again,
    Hard: s.easeDistribution.hard,
    Good: s.easeDistribution.good,
    Easy: s.easeDistribution.easy,
  }))

  return (
    <div className="max-w-5xl mx-auto space-y-7 animate-fade-up">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl font-display text-ink-50">Class comparison</h1>
        <p className="mt-1 text-ink-400">{students.length} students loaded this week</p>
      </div>

      {/* Summary table */}
      <div className="z-20 p-0 overflow-hidden card">
        <div className="px-5 py-4 border-b border-ink-700">
          <h3 className="font-semibold font-display text-ink-100">Class overview</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700">
                <th className="px-5 py-3 text-left label">Student</th>
                <th className="px-4 py-3 text-left label">Type</th>
                <th className="px-4 py-3 text-right label">Reviews</th>
                <th className="px-4 py-3 text-right label">Active days</th>
                <th className="px-4 py-3 text-right label">Retention</th>
                <th className="px-4 py-3 text-right label">Avg time</th>
                <th className="px-4 py-3 text-right label">Top button</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {students.sort((a,b) => b.retention - a.retention).map((s, i) => {
                const retColor = s.retention >= 70 ? 'text-success' : s.retention >= 40 ? 'text-warning' : 'text-danger'
                const btnColor = s.dominantButton === 'Again' ? 'text-danger' : s.dominantButton === 'Hard' ? 'text-warning' : s.dominantButton === 'Good' ? 'text-brand-300' : 'text-success'
                return (
                  <tr key={s.id} className="transition-colors border-b cursor-pointer border-ink-700/50 hover:bg-ink-700/30 group"
                  >
                    <td className="px-5 py-3.5" onClick={() => navigate(`/student/${s.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center text-xs font-semibold text-white rounded-lg w-7 h-7 font-display"
                          style={{ background: STUDENT_COLORS[i % STUDENT_COLORS.length] }}>
                          {s.studentName[0]}
                        </div>
                        <span className="font-display text-ink-100">{s.studentName}</span>
                        {s.validationErrors > 0 && (
                          <FlagTooltip
                            icon={<XCircle size={13} className="text-danger shrink-0" />}
                            flags={s.validationFlags}
                          />
                        )}
                        {s.validationErrors === 0 && s.validationWarnings > 0 && (
                          <FlagTooltip
                            icon={<AlertTriangle size={13} className="text-warning shrink-0" />}
                            flags={s.validationFlags}
                          />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge ${s.deckType === 'vocabulary' ? 'bg-brand/15 text-brand-300' : 'bg-warning/15 text-warning'}`}>{s.deckType}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-ink-200">{s.totalReviews}</td>
                    <td className="px-4 py-3.5 text-right font-mono text-ink-200">{s.activeDays}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-display font-semibold ${retColor}`}>{s.retention}%</span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-mono text-ink-300">{Math.round(s.avgTimePerCard/1000)}s</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`font-display font-medium ${btnColor}`}>{s.dominantButton}</span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <TrashIcon size={16} className="text-red-200 hover:text-red-400 transition-colors m-auto mb-0.5" onClick={() => deleteItem(s.id)} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retention comparison */}
      <div className="card">
        <h3 className="mb-1 font-semibold font-display text-ink-100">Retention comparison</h3>
        <p className="mb-5 text-xs text-ink-400">% of cards rated Good or Easy — higher is better</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={retentionData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232b3e" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#636d87', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#636d87', fontSize: 11 }} axisLine={false} tickLine={false} domain={[0,100]} unit="%" />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(91,106,247,0.08)' }} />
            <Bar dataKey="retention" name="Retention" radius={[8,8,0,0]} unit="%">
              {retentionData.map((_, i) => (
                <Cell key={i} fill={STUDENT_COLORS[i % STUDENT_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Button breakdown side by side */}
      <div className="card">
        <h3 className="mb-1 font-semibold font-display text-ink-100">Button breakdown per student</h3>
        <p className="mb-5 text-xs text-ink-400">How each student rated their cards — Again means struggles, Easy means confident</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={easeCompare} barSize={16}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232b3e" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#636d87', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#636d87', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
            <Bar dataKey="Again" fill={EASE_COLORS.again} radius={[4,4,0,0]} stackId="a" />
            <Bar dataKey="Hard" fill={EASE_COLORS.hard} stackId="a" />
            <Bar dataKey="Good" fill={EASE_COLORS.good} stackId="a" />
            <Bar dataKey="Easy" fill={EASE_COLORS.easy} radius={[0,0,4,4]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex flex-wrap justify-center gap-4 mt-3">
          {Object.entries(EASE_COLORS).map(([k, c]) => (
            <div key={k} className="flex items-center gap-1.5 text-xs text-ink-400">
              <div className="w-3 h-3 rounded-sm" style={{ background: c }} />
              {k.charAt(0).toUpperCase() + k.slice(1)}
            </div>
          ))}
        </div>
      </div>

      {/* Activity comparison */}
      <div className="card">
        <h3 className="mb-1 font-semibold font-display text-ink-100">Practice volume</h3>
        <p className="mb-5 text-xs text-ink-400">Total cards reviewed this week</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={activityData} barSize={40}>
            <CartesianGrid strokeDasharray="3 3" stroke="#232b3e" vertical={false} />
            <XAxis dataKey="name" tick={{ fill: '#636d87', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#636d87', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(91,106,247,0.08)' }} />
            <Bar dataKey="reviews" name="Cards reviewed" radius={[8,8,0,0]}>
              {activityData.map((_,i) => <Cell key={i} fill={STUDENT_COLORS[i % STUDENT_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}