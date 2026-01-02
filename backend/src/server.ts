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
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://cellwar.lvrnvm.fun',
  'https://www.lvrnvm.fun'
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.lvrnvm.fun')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Socket.io setup
const io = new Server(server, {
  cors: corsOptions
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
