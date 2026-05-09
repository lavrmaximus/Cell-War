import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import jwt from 'jsonwebtoken';
import { authMiddleware } from './middleware/auth';
import { GameManager } from './game/GameManager';

// Load .env from current dir, fall back to project root
dotenv.config();
if (!process.env.JWT_SECRET) {
    dotenv.config({ path: path.resolve(__dirname, '../../.env') });
}

const app = express();
const server = http.createServer(app);
const isDev = process.env.NODE_ENV !== 'production';

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

app.use(cors(corsOptions));
app.use(express.json());

// Helper to parse cookie string
function parseCookie(str: string, name: string): string | undefined {
    const match = str.split(';').map(s => s.trim()).find(s => s.startsWith(name + '='));
    return match ? match.slice(name.length + 1) : undefined;
}

// Resolve JWT from request headers/cookies
function getRequestToken(req: express.Request): string | null {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) return auth.slice(7);
    const cookie = req.headers.cookie || '';
    return parseCookie(cookie, 'token') || parseCookie(cookie, 'jwt') || null;
}

// GET /api/user/me — validate JWT, return user info
app.get('/api/user/me', (req, res) => {
    const token = getRequestToken(req);
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) return res.status(500).json({ error: 'Server misconfiguration' });
        const payload = jwt.verify(token, secret) as Record<string, any>;
        res.json({
            id: payload.userId,
            username: payload.username,
            elo: payload.elo ?? 1000,
            role: payload.role ?? 'user',
            avatar: payload.avatar ?? `https://api.dicebear.com/9.x/pixel-art/svg?seed=${encodeURIComponent(payload.username)}`
        });
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
    res.setHeader('Set-Cookie', 'token=; Max-Age=0; Path=/; HttpOnly');
    res.json({ success: true });
});

// Dev-only: instant login without external auth
if (isDev) {
    app.post('/api/dev/auth', (req, res) => {
        const username: string = (req.body?.username as string) || 'Developer';
        const userId = 'dev_' + username.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const secret = process.env.JWT_SECRET || 'dev_secret';
        const token = jwt.sign(
            { userId, username, elo: 1000, role: 'admin' },
            secret,
            { expiresIn: '7d' }
        );
        res.json({ token });
    });
}

// Serve built frontend
const frontendDist = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDist));

// Socket.IO
const io = new Server(server, { cors: corsOptions });
io.use(authMiddleware);

const gameManager = new GameManager(io);

io.on('connection', (socket) => {
    console.log(`Connected: ${socket.id} (user: ${socket.data.user?.username})`);
    gameManager.handleConnection(socket);
});

// SPA fallback
app.get(/(.*)/, (_req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT} [${isDev ? 'dev' : 'prod'}]`);
});
