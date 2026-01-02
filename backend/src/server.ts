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

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Apply auth middleware to Socket.io
io.use(authMiddleware);

const gameManager = new GameManager();

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
