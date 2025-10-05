import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { AccessTokenPayload, verifyAccessToken } from '../utils/jwt';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
      displayName?: string;
      isSuperAdmin: boolean;
      isActive: boolean;
      createdAt: Date;
      lastLogin?: Date;
      emails: Array<{
        id: string;
        address: string;
        isPrimary: boolean;
        verifiedAt?: Date;
      }>;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: Express.User | false) => {
    if (err) {
      return res.status(500).json({
        error: 'AUTHENTICATION_ERROR',
        message: 'Internal authentication error'
      });
    }

    if (!user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      });
    }

    req.user = user;
    return next();
  })(req, res, next);
  return;
};

/**
 * Middleware to require authentication
 * Proper JWT token authentication - no dev mode bypass
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {

  const token = extractTokenFromHeader(req);
  
  if (!token) {
    return res.status(401).json({
      error: 'NO_TOKEN',
      message: 'No authentication token provided'
    });
  }

  try {
    const payload = verifyAccessToken(token);
    
    // Attach user info to request (lightweight version)
    req.user = {
      id: payload.userId,
      username: payload.username,
      isSuperAdmin: payload.isSuperAdmin
    } as Express.User;

    return next();
  } catch (error) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid or expired authentication token'
    });
  }
};

/**
 * Middleware to require super admin privileges
 * Proper privilege checking - no dev mode bypass
 */
export const requireSuperAdmin = (req: Request, res: Response, next: NextFunction) => {

  if (!req.user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }

  if (!req.user.isSuperAdmin) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Super admin privileges required'
    });
  }

  return next();
};

/**
 * Optional authentication middleware (doesn't fail if no token)
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = extractTokenFromHeader(req);
  
  if (!token) {
    return next(); // Continue without user
  }

  try {
    const payload = verifyAccessToken(token);
    req.user = {
      id: payload.userId,
      username: payload.username,
      isSuperAdmin: payload.isSuperAdmin
    } as Express.User;
  } catch (error) {
    // Token is invalid, but we don't fail - just continue without user
    console.warn('Invalid token provided to optionalAuth:', error);
  }

  return next();
};

/**
 * Extract Bearer token from Authorization header
 */
function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
}

/**
 * Middleware to check if user is verified (has verified email)
 */
export const requireVerifiedUser = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication required'
    });
  }

  // Check if user has a verified email
  const hasVerifiedEmail = req.user.emails?.some(email => email.verifiedAt !== null);
  
  if (!hasVerifiedEmail) {
    return res.status(403).json({
      error: 'EMAIL_NOT_VERIFIED',
      message: 'Email verification required'
    });
  }

  return next();
};

/**
 * Middleware to rate limit by user ID
 */
export const rateLimitByUser = (maxRequests: number, windowMs: number) => {
  const userRequestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    
    if (!userId) {
      return next(); // Skip rate limiting for non-authenticated requests
    }

    const now = Date.now();
    const userKey = `user_${userId}`;
    const userLimit = userRequestCounts.get(userKey);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset counter
      userRequestCounts.set(userKey, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (userLimit.count >= maxRequests) {
      return res.status(429).json({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userLimit.resetTime - now) / 1000)
      });
    }

    userLimit.count++;
    next();
  };
};