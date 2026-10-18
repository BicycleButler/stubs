// @sidecar ./jwt.ts.md
// This file is materialized from the sidecar specification.
// Do not edit this header.

import * as crypto from 'crypto';

export interface AuthContext {
  userId: string;
  roles: string[];
}

export interface JwtPayload {
  sub: string;
  exp: number;
  roles: string[];
}

export function signToken(payload: JwtPayload, secret: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64');
  const data = `${header}.${body}`;
  const signature = crypto.createHmac('sha256', secret).update(data).digest('base64');
  return `${data}.${signature}`;
}

export function verifyToken(token: string, secret: string): JwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [headerB64, bodyB64, sigB64] = parts;
  const data = `${headerB64}.${bodyB64}`;
  const expectedSig = crypto.createHmac('sha256', secret).update(data).digest('base64');

  if (sigB64 !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(bodyB64, 'base64').toString()) as JwtPayload;
    if (payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}