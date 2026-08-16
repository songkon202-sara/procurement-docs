import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { RoleCode } from './workflow.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is not set — refusing to start with an unsigned/guessable token secret');
}

// Work-shift-length token: long enough that officers aren't re-logging-in mid-task, short
// enough that a role change (granted via user_roles) takes effect on the next shift without
// needing a separate revocation mechanism.
const TOKEN_TTL = '8h';

export interface TokenPayload {
  sub: string; // user id
  roles: RoleCode[];
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: TOKEN_TTL });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET!) as TokenPayload;
}
