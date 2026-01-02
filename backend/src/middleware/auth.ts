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
  let token = socket.handshake.auth.token || socket.handshake.query.token;

  if (!token && socket.request.headers.cookie) {
    const cookies = socket.request.headers.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'token' || name === 'jwt') {
        token = value;
        break;
      }
    }
  }

  if (!token) {
    return next(new Error("Authentication error: No token provided"));
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET is not defined");
      return next(new Error("Internal server error"));
    }

    const decoded = jwt.verify(token as string, secret) as AuthPayload;
    socket.data.user = decoded;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
};
