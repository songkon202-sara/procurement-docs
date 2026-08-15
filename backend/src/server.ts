import 'dotenv/config';
import express from 'express';
import { requireAuth } from './middleware/auth.js';
import { casesRouter } from './routes/cases.js';
import { vendorsRouter } from './routes/vendors.js';
import { errorHandler } from './errorHandler.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(requireAuth);
app.use(casesRouter);
app.use(vendorsRouter);

app.use(errorHandler);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`procurement-docs backend listening on :${port}`);
});
