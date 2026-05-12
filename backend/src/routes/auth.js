import { Router } from 'express';
export const router = Router();

// In-memory user store — swap this out for Postgres later
const USERS = {
  teacher: { id: 'teacher-001', name: 'Teacher', role: 'teacher', password: 'teach123' },
};

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  req.session.user = { id: user.id, name: user.name, role: user.role };
  res.json({ user: req.session.user });
});

router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Not logged in' });
  res.json({ user: req.session.user });
});
