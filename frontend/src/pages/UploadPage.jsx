import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, CheckCircle, AlertTriangle, XCircle, ArrowRight, Trash2, Users } from 'lucide-react'

function ValidationBadge({ flags }) {
  const errors = flags.filter(f => f.level === 'error')
  const warnings = flags.filter(f => f.level === 'warning')
  if (errors.length) return <span className="badge bg-danger/15 text-danger"><XCircle size={11} className="inline mr-1" />{errors.length} error{errors.length > 1 ? 's' : ''}</span>
  if (warnings.length) return <span className="badge bg-warning/15 text-warning"><AlertTriangle size={11} className="inline mr-1" />{warnings.length} warning{warnings.length > 1 ? 's' : ''}</span>
  return <span className="badge bg-success/15 text-success"><CheckCircle size={11} className="inline mr-1" />Clean</span>
}

function RetentionBar({ pct }) {
  const color = pct >= 70 ? 'bg-success' : pct >= 40 ? 'bg-warning' : 'bg-danger'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-ink-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-ink-300 w-8">{pct}%</span>
    </div>
  )
}

export default function UploadPage() {
  const [results, setResults] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadErrors, setUploadErrors] = useState([])
  const [weekMode, setWeekMode] = useState('current')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const navigate = useNavigate()

  const onDrop = useCallback(async acceptedFiles => {
    const jsonlFiles = acceptedFiles.filter(f => f.name.endsWith('.jsonl'))
    if (!jsonlFiles.length) return

    setUploading(true)
    setUploadErrors([])

    const formData = new FormData()
    jsonlFiles.forEach(f => formData.append('files', f))

    const params = new URLSearchParams({ weekMode })
    if (weekMode === 'custom' && customStart && customEnd) {
      params.set('customStart', customStart)
      params.set('customEnd', customEnd)
    }

    try {
      const res = await fetch(`http://localhost:3001/api/upload?${params}`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      const data = await res.json()
      setResults(prev => {
        const existing = new Set(prev.map(r => r.studentName))
        const newOnes = data.results.filter(r => !existing.has(r.studentName))
        return [...prev, ...newOnes]
      })
      if (data.errors?.length) setUploadErrors(data.errors)
    } catch (err) {
      setUploadErrors([{ file: 'upload', error: err.message }])
    } finally {
      setUploading(false)
    }
  }, [weekMode, customStart, customEnd])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/octet-stream': ['.jsonl'] },
    multiple: true,
  })

  const clear = async () => {
    await fetch('http://localhost:3001/api/upload/clear', { method: 'DELETE', credentials: 'include' })
    setResults([])
    setUploadErrors([])
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-up">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-semibold text-ink-50">Weekly Upload</h1>
        <p className="text-ink-400 mt-1 text-sm md:text-base">Drop your students' Anki export files below to generate this week's report.</p>
      </div>

      {/* Week mode toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm text-ink-400">Week window:</span>
        <div className="flex rounded-lg overflow-hidden border border-ink-600">
          <button
            onClick={() => setWeekMode('current')}
            className={`px-3 py-1.5 text-sm transition-colors ${weekMode === 'current' ? 'bg-brand text-white' : 'text-ink-400 hover:text-ink-200'}`}
          >
            Current week
          </button>
          <button
            onClick={() => setWeekMode('data')}
            className={`px-3 py-1.5 text-sm transition-colors ${weekMode === 'data' ? 'bg-brand text-white' : 'text-ink-400 hover:text-ink-200'}`}
          >
            Use data dates
          </button>
          <button
            onClick={() => setWeekMode('custom')}
            className={`px-3 py-1.5 text-sm transition-colors ${weekMode === 'custom' ? 'bg-brand text-white' : 'text-ink-400 hover:text-ink-200'}`}
          >
            Custom range
          </button>
        </div>
        {weekMode === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStart}
              onChange={e => setCustomStart(e.target.value)}
              className="bg-ink-800 border border-ink-600 rounded-lg px-2 py-1.5 text-sm text-ink-100 focus:outline-none focus:border-brand"
            />
            <span className="text-ink-500 text-sm">→</span>
            <input
              type="date"
              value={customEnd}
              onChange={e => setCustomEnd(e.target.value)}
              min={customStart}
              className="bg-ink-800 border border-ink-600 rounded-lg px-2 py-1.5 text-sm text-ink-100 focus:outline-none focus:border-brand"
            />
          </div>
        )}
      </div>

      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200
          ${isDragActive ? 'border-brand bg-brand/10 scale-[1.01]' : 'border-ink-600 hover:border-ink-500 hover:bg-ink-800/50'}
          ${uploading ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-3">
          {uploading ? (
            <>
              <div className="w-12 h-12 border-3 border-brand border-t-transparent rounded-full animate-spin" style={{borderWidth:'3px'}} />
              <p className="font-display font-medium text-ink-200">Processing files…</p>
            </>
          ) : (
            <>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${isDragActive ? 'bg-brand' : 'bg-ink-700'}`}>
                <Upload size={24} className={isDragActive ? 'text-white' : 'text-ink-300'} />
              </div>
              <div>
                <p className="font-display font-medium text-ink-100">
                  {isDragActive ? 'Drop to upload' : 'Drop .jsonl files here'}
                </p>
                <p className="text-sm text-ink-400 mt-0.5">or click to browse — multiple files supported</p>
              </div>
              <p className="text-xs text-ink-500 font-mono bg-ink-800 px-3 py-1 rounded-lg">
                Firstname_Surname.jsonl
              </p>
            </>
          )}
        </div>
      </div>

      {/* Upload errors */}
      {uploadErrors.length > 0 && (
        <div className="space-y-2">
          {uploadErrors.map((e, i) => (
            <div key={i} className="flex items-center gap-3 bg-danger/10 border border-danger/20 rounded-xl px-4 py-3 text-sm">
              <XCircle size={15} className="text-danger shrink-0" />
              <span className="text-danger font-mono">{e.file}</span>
              <span className="text-ink-300">{e.error}</span>
            </div>
          ))}
        </div>
      )}

      {/* Results list */}
      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-ink-400" />
              <h2 className="font-display font-semibold text-ink-100">{results.length} student{results.length > 1 ? 's' : ''} loaded</h2>
            </div>
            <div className="flex gap-2">
              {results.length >= 2 && (
                <button onClick={() => navigate('/compare')} className="btn-primary flex items-center gap-2">
                  Compare all <ArrowRight size={14} />
                </button>
              )}
              <button onClick={clear} className="btn-ghost flex items-center gap-2 text-danger hover:bg-danger/10">
                <Trash2 size={14} />
                Clear
              </button>
            </div>
          </div>

          <div className="grid gap-3">
            {results.map(r => (
              <div key={r.id}
                onClick={() => navigate(`/student/${r.id}`)}
                className="card-sm flex items-center gap-4 cursor-pointer hover:border-ink-500 hover:bg-ink-700/50 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-900 flex items-center justify-center shrink-0">
                  <span className="font-display font-semibold text-brand-300 text-sm">
                    {r.studentName.split(' ').map(w=>w[0]).join('').slice(0,2)}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-display font-medium text-ink-100 truncate">{r.studentName}</p>
                    <span className={`badge ${r.summary.deckType === 'vocabulary' ? 'bg-brand/15 text-brand-300' : 'bg-warning/15 text-warning'}`}>
                      {r.summary?.deckType || 'unknown'}
                    </span>
                    <ValidationBadge flags={r.validation.flags} />
                  </div>
                  <RetentionBar pct={r.summary.retention} />
                </div>

                <div className="flex items-center gap-4 shrink-0 text-right">
                  <div className="hidden sm:block">
                    <p className="label">Reviews</p>
                    <p className="font-display font-semibold text-ink-100 text-lg">{r.summary.totalReviews}</p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="label">Active days</p>
                    <p className="font-display font-semibold text-ink-100 text-lg">{r.summary.activeDays}</p>
                  </div>
                  <div>
                    <p className="label">Top button</p>
                    <p className={`font-display font-semibold text-lg ${
                      r.summary.dominantButton === 'Again' ? 'text-danger' :
                      r.summary.dominantButton === 'Hard' ? 'text-warning' :
                      r.summary.dominantButton === 'Good' ? 'text-brand-300' : 'text-success'
                    }`}>{r.summary.dominantButton}</p>
                  </div>
                  <ArrowRight size={16} className="text-ink-600 group-hover:text-ink-300 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {results.length === 0 && !uploading && (
        <div className="text-center py-8 text-ink-500">
          <FileText size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">No files uploaded yet. Export from Anki using the LLM Stats plugin and drop them above.</p>
        </div>
      )}
    </div>
  )
}
