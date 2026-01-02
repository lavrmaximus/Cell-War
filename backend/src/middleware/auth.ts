import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

interface AuthPayload {
  userId: string;
  username: string;
  role?: string;
  [key: string]: any;
}

export const isAdmin = (socket: Socket): boolean => {
  const user = socket.data.user as AuthPayload | undefined;
  return user?.role === 'admin';
};

export const authMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  console.log(`[Auth] Connection attempt: ${socket.id}`);
  
  let token = socket.handshake.auth.token;
  let source = 'handshake.auth';

  if (!token && socket.handshake.headers.authorization) {
    const parts = socket.handshake.headers.authorization.split(' ');
    if (parts.length === 2 && parts[0] === 'Bearer') {
      token = parts[1];
      source = 'headers.authorization';
    }
  }

  if (!token && socket.request.headers.cookie) {
    const cookies = socket.request.headers.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token' || name === 'jwt') {
        token = value;
        source = 'cookie';
        break;
      }
    }
  }

  if (!token) {
    console.log(`[Auth] No token found for ${socket.id}`);
    return next(new Error("AUTH_ERROR_NO_TOKEN"));
  }

  console.log(`[Auth] Token found in ${source} for ${socket.id}`);

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("[Auth] JWT_SECRET is not defined");
      return next(new Error("Internal server error"));
    }

    const decoded = jwt.verify(token as string, secret) as AuthPayload;
    socket.data.user = decoded;
    console.log(`[Auth] Verification success for user: ${decoded.username} (${decoded.userId})`);
    next();
  } catch (err) {
    console.log(`[Auth] Verification failed for ${socket.id}:`, err instanceof Error ? err.message : err);
    next(new Error("Authentication error: Invalid token"));
  }
};
