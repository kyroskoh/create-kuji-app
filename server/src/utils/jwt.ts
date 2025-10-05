import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AccessTokenPayload {
  userId: string;
  username: string;
  isSuperAdmin: boolean;
}

export interface RefreshTokenPayload {
  userId: string;
  sessionId: string;
}

/**
 * Generate an access token (short-lived - 15 minutes)
 */
export function generateAccessToken(payload: AccessTokenPayload): string {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '15m',
    issuer: 'create-kuji-server',
    audience: 'create-kuji-app'
  });
}

/**
 * Generate a refresh token (long-lived - 30 days)
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  return jwt.sign(payload, secret, {
    expiresIn: '30d',
    issuer: 'create-kuji-server',
    audience: 'create-kuji-app'
  });
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error('JWT_ACCESS_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, secret, {
      issuer: 'create-kuji-server',
      audience: 'create-kuji-app'
    }) as AccessTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is not defined in environment variables');
  }

  try {
    return jwt.verify(token, secret, {
      issuer: 'create-kuji-server',
      audience: 'create-kuji-app'
    }) as RefreshTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Create a new session with refresh token
 */
export async function createSession(
  userId: string, 
  rememberMe: boolean = false,
  userAgent?: string,
  ipAddress?: string
) {
  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + (rememberMe ? 30 : 7) * 24 * 60 * 60 * 1000); // 30 days if remember me, 7 days otherwise

  const refreshTokenPayload: RefreshTokenPayload = {
    userId,
    sessionId
  };

  const refreshToken = generateRefreshToken(refreshTokenPayload);

  // Store session in database
  const session = await prisma.session.create({
    data: {
      id: sessionId,
      userId,
      refreshToken,
      expiresAt,
      rememberMe,
      userAgent,
      ipAddress
    }
  });

  return { session, refreshToken };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string) {
  // Verify refresh token
  const payload = verifyRefreshToken(refreshToken);
  
  // Check if session exists and is valid
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true }
  });

  if (!session || session.refreshToken !== refreshToken) {
    throw new Error('Invalid refresh token');
  }

  if (session.expiresAt < new Date()) {
    // Clean up expired session
    await prisma.session.delete({ where: { id: session.id } });
    throw new Error('Session expired');
  }

  // Update last used timestamp
  await prisma.session.update({
    where: { id: session.id },
    data: { lastUsed: new Date() }
  });

  // Generate new access token
  const accessTokenPayload: AccessTokenPayload = {
    userId: session.user.id,
    username: session.user.username,
    isSuperAdmin: session.user.isSuperAdmin
  };

  return generateAccessToken(accessTokenPayload);
}

/**
 * Revoke a session (logout)
 */
export async function revokeSession(sessionId: string) {
  await prisma.session.delete({
    where: { id: sessionId }
  });
}

/**
 * Revoke all sessions for a user
 */
export async function revokeAllUserSessions(userId: string) {
  await prisma.session.deleteMany({
    where: { userId }
  });
}

/**
 * Clean up expired sessions
 */
export async function cleanupExpiredSessions() {
  const result = await prisma.session.deleteMany({
    where: {
      expiresAt: {
        lt: new Date()
      }
    }
  });

  console.log(`🧹 Cleaned up ${result.count} expired sessions`);
  return result.count;
}