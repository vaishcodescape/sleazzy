import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import bookingsRoutes from './routes/bookings';
import adminRoutes from './routes/admin';
import notificationRoutes from './routes/notifications';
import authRoutes from './routes/auth';
import { supabase } from './supabaseClient';

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());

export const io = new SocketIOServer(httpServer, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`[Socket.io] Client connected: ${socket.id}`);

  // Allow clubs to join their own room so they receive targeted notifications
  socket.on('join:club', (clubId: string) => {
    socket.join(`club:${clubId}`);
    console.log(`[Socket.io] Socket ${socket.id} joined room: club:${clubId}`);
  });

  // Allow admins to join the admin room
  socket.on('join:admin', () => {
    socket.join('admin');
    console.log(`[Socket.io] Socket ${socket.id} joined room: admin`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: '5mb' }));

// Narrow body-parser style errors that use `type` and `message` fields
function isBodyParserError(err: unknown): err is { type: string; message?: string } {
  return typeof err === 'object' && err !== null && 'type' in err;
}

// Catch body-parser errors (e.g., malformed JSON)
const bodyParserErrorHandler: express.ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in (err as { body?: unknown })) {
    console.error('JSON Parse Error:', err.message);
    return res.status(400).json({ error: 'Invalid JSON payload. Please check the request body.' });
  }

  if (isBodyParserError(err) &&
    (err.type === 'entity.parse.failed' ||
      err.type === 'entity.too.large' ||
      err.type === 'request.size.invalid' ||
      err.type === 'encoding.unsupported')) {

    console.error('Body Parser Error:', err.message);

    let status = 400;
    if (err.type === 'entity.too.large' || err.type === 'request.size.invalid') {
      status = 413;
    } else if (err.type === 'encoding.unsupported') {
      status = 415;
    }

    const responseBody: { error: string; details?: string; type?: string } = {
      error: 'Failed to process request body',
    };

    if (process.env.NODE_ENV !== 'production') {
      responseBody.details = err.message;
      responseBody.type = err.type;
    }

    return res.status(status).json(responseBody);
  }

  next(err);
};

app.use(bodyParserErrorHandler);

app.use((req, _res, next) => {
  req.app.locals.supabase = supabase;
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', bookingsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/notifications', notificationRoutes);

// Serve frontend static files (when client dist is present, e.g. in Docker)
const clientDir = process.env.CLIENT_DIST_DIR || path.join(__dirname, '../../client');
if (fs.existsSync(clientDir)) {
  app.use(express.static(clientDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDir, 'index.html'));
  });
}

const port = process.env.PORT || 4000;
httpServer.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
