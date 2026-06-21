import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';
import { initDatabase } from './db/database';
import apiRouter from './routes/api';
import { rateLimiter } from './middleware/rateLimiter';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Reflect origin dynamically to support credentials: true
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json());
app.use(rateLimiter);

// Detailed HTTP Request & Response Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  console.log(`[HTTP Request] => ${req.method} ${req.url}`, req.method !== 'GET' ? { body: req.body } : '');
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP Response] <= ${req.method} ${req.url} | Status: ${res.statusCode} | Duration: ${duration}ms`);
  });
  next();
});

// Serve static frontend in production (optional hook)
const clientBuildPath = path.resolve(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// API router
app.use('/api', apiRouter);

// Catch-all API 404 handler
app.all('/api/*', (req: Request, res: Response) => {
  res.status(404).json({ error: 'API route not found' });
});

// Basic health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve frontend routing in production
app.get('*', (req: Request, res: Response) => {
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    // If not built, just return simple status
    if (err) {
      res.status(200).send('CarbonWise AI API Service is running. Frontend build not detected.');
    }
  });
});

// Centralized error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: {
      message,
      // Only expose stack details in development
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// Database initialization & server start
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`CarbonWise AI API server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to initialize database or start server:', err);
    process.exit(1);
  }
}

startServer();
