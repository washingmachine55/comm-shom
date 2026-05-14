import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { router as uploadRouter } from './routes/upload.js';
import { router as statsRouter } from './routes/stats.js';
import { router as authRouter } from './routes/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: 'anki-dashboard-secret-change-in-prod',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Routes
app.use('/api/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/stats', statsRouter);

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use((req, res, next) => res.status(404).json({ error: "page not found" }));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));

export default app;
