import { Router } from 'express';
import multer from 'multer';
import { analyzeSession } from '../lib/analyzer.js';

export const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.jsonl')) cb(null, true);
    else cb(new Error('Only .jsonl files are accepted'));
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// In-memory store for this session — replace with DB later
export const sessionStore = new Map();

router.post('/', upload.array('files'), (req, res) => {
  try {
    const results = [];
    const errors = [];

    for (const file of req.files) {
      try {
        const text = file.buffer.toString('utf-8');
        const lines = text.trim().split('\n').filter(Boolean);
        if (lines.length === 0) {
          errors.push({ file: file.originalname, error: 'File is empty.' });
          continue;
        }
        const records = lines.map(l => JSON.parse(l));
        const studentName = file.originalname
          .replace(/\.jsonl$/i, '')
          .replace(/^llm_review_stats_/i, '')
          .replace(/[-_]/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase())
          .trim();
        const weekMode = ['data', 'custom'].includes(req.query.weekMode) ? req.query.weekMode : 'current';
        const customStart = req.query.customStart || null;
        const customEnd = req.query.customEnd || null;
        const analysis = analyzeSession(studentName, records, { weekMode, customStart, customEnd });
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        sessionStore.set(id, analysis);
        results.push({ id, studentName: analysis.studentName, summary: analysis.summary, validation: analysis.validation });
      } catch (err) {
        errors.push({ file: file.originalname, error: err.message });
      }
    }

    res.json({ results, errors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  const data = sessionStore.get(req.params.id);
  if (!data) return res.status(404).json({ error: 'Session not found' });
  res.json(data);
});

router.delete('/clear', (req, res) => {
  sessionStore.clear();
  res.json({ ok: true });
});
