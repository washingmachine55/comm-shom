import { Router } from 'express';
import { sessionStore } from './upload.js';

export const router = Router();

// Get all loaded sessions
router.get('/all', (req, res) => {
  const all = [];
  for (const [id, data] of sessionStore.entries()) {
    all.push({ id, studentName: data.studentName, summary: data.summary, validation: data.validation });
  }
  res.json(all);
});

// Get detailed stats for one student
router.get('/:id', (req, res) => {
  const data = sessionStore.get(req.params.id);
  if (!data) return res.status(404).json({ error: 'Not found' });
  res.json(data);
});

// Class comparison
router.get('/compare/all', (req, res) => {
  const students = [];
  for (const [id, data] of sessionStore.entries()) {
    students.push({
      id,
      studentName: data.studentName,
      deckType: data.deckType,
      totalReviews: data.summary.totalReviews,
      retention: data.summary.retention,
      avgTimePerCard: data.summary.avgTimePerCard,
      activeDays: data.summary.activeDays,
      dominantButton: data.summary.dominantButton,
      easeDistribution: data.summary.easeDistribution,
      validationFlags: data.validation.flags.length,
    });
  }
  res.json(students);
});
