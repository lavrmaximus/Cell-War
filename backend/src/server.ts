import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { authMiddleware } from './middleware/auth';
import { GameManager } from './game/GameManager';

// Load environment variables
// Try loading from current directory
dotenv.config();
// If not found (or specific var missing), try loading from parent directory
if (!process.env.JWT_SECRET) {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const app = express();
const server = http.createServer(app);

// CORS configuration
const corsOrigin = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps or curl requests)

  if (origin.endsWith('.lvrnvm.fun') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
    return callback(null, true);
  }

  callback(new Error('Not allowed by CORS'));
};

// Middleware
app.use(cors({
  origin: corsOrigin,
  credentials: true
}));
app.use(express.json());

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Apply auth middleware to Socket.io
io.use(authMiddleware);

const gameManager = new GameManager(io);

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}, UserID: ${socket.data.user?.userId}`);

  gameManager.handleConnection(socket);

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Catch-all route for SPA support
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
