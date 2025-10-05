import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import passport from '../config/passport';
import { generateAccessToken, createSession, refreshAccessToken, revokeSession } from '../utils/jwt';
import { sendVerificationEmail, sendPasswordResetEmail, verifyToken, sendPasswordChangedEmail } from '../services/emailService';
import { verifyHCaptcha } from '../utils/hcaptcha';

const prisma = new PrismaClient();

/**
 * POST /api/auth/signup
 * Register a new user account
 */
export async function signup(req: Request, res: Response) {
  try {
    const { email, username, password, hcaptchaToken } = req.body;

    // Validate required fields
    if (!email || !username || !password || !hcaptchaToken) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Email, username, password, and captcha are required'
      });
    }

    // Verify hCaptcha
    const isValidCaptcha = await verifyHCaptcha(hcaptchaToken, req.ip);
    if (!isValidCaptcha) {
      return res.status(400).json({
        error: 'INVALID_CAPTCHA',
        message: 'Captcha verification failed'
      });
    }

    // Validate username format (alphanumeric, underscore, hyphen, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        error: 'INVALID_USERNAME',
        message: 'Username must be 3-20 characters and contain only letters, numbers, underscores, and hyphens'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'INVALID_EMAIL',
        message: 'Invalid email format'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() }
    });

    if (existingUsername) {
      return res.status(409).json({
        error: 'USERNAME_EXISTS',
        message: 'Username already taken'
      });
    }

    // Check if email already exists
    const existingEmail = await prisma.email.findUnique({
      where: { address: email.toLowerCase() }
    });

    if (existingEmail) {
      return res.status(409).json({
        error: 'EMAIL_EXISTS',
        message: 'Email already registered'
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user with email and password
    const user = await prisma.user.create({
      data: {
        username: username.toLowerCase(),
        displayName: username,
        emails: {
          create: {
            address: email.toLowerCase(),
            isPrimary: true
          }
        },
        password: {
          create: {
            hash: passwordHash
          }
        }
      },
      include: {
        emails: true
      }
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.id, email);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail signup if email fails
    }

    // Create session
    const { session, refreshToken } = await createSession(
      user.id,
      false,
      req.headers['user-agent'],
      req.ip
    );

    // Generate access token
    const accessToken = generateAccessToken({
      userId: user.id,
      username: user.username,
      isSuperAdmin: user.isSuperAdmin
    });

    return res.status(201).json({
      message: 'Account created successfully',
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.emails[0]?.address,
        emailVerified: user.emails[0]?.verifiedAt !== null,
        isSuperAdmin: user.isSuperAdmin
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      error: 'SIGNUP_FAILED',
      message: 'Failed to create account'
    });
  }
}

/**
 * POST /api/auth/login
 * Login with email/username and password
 */
export async function login(req: Request, res: Response) {
  passport.authenticate('local', { session: false }, async (err: any, user: any, info: any) => {
    if (err) {
      return res.status(500).json({
        error: 'AUTHENTICATION_ERROR',
        message: 'Internal authentication error'
      });
    }

    if (!user) {
      return res.status(401).json({
        error: 'INVALID_CREDENTIALS',
        message: info?.message || 'Invalid email/username or password'
      });
    }

    try {
      const { rememberMe } = req.body;

      // Create session
      const { session, refreshToken } = await createSession(
        user.id,
        rememberMe === true,
        req.headers['user-agent'],
        req.ip
      );

      // Generate access token
      const accessToken = generateAccessToken({
        userId: user.id,
        username: user.username,
        isSuperAdmin: user.isSuperAdmin
      });

      return res.status(200).json({
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          displayName: user.displayName,
          email: user.emails[0]?.address,
          emailVerified: user.emails[0]?.verifiedAt !== null,
          isSuperAdmin: user.isSuperAdmin
        },
        tokens: {
          accessToken,
          refreshToken
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        error: 'LOGIN_FAILED',
        message: 'Login failed'
      });
    }
  })(req, res);
}

/**
 * POST /api/auth/refresh
 * Refresh access token using refresh token
 */
export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'MISSING_TOKEN',
        message: 'Refresh token is required'
      });
    }

    const accessToken = await refreshAccessToken(refreshToken);

    return res.status(200).json({
      message: 'Token refreshed',
      accessToken
    });

  } catch (error) {
    return res.status(401).json({
      error: 'INVALID_REFRESH_TOKEN',
      message: error instanceof Error ? error.message : 'Invalid refresh token'
    });
  }
}

/**
 * POST /api/auth/logout
 * Logout and revoke refresh token
 */
export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        error: 'MISSING_TOKEN',
        message: 'Refresh token is required'
      });
    }

    // Find and delete session
    const session = await prisma.session.findUnique({
      where: { refreshToken }
    });

    if (session) {
      await revokeSession(session.id);
    }

    return res.status(200).json({
      message: 'Logged out successfully'
    });

  } catch (error) {
    return res.status(500).json({
      error: 'LOGOUT_FAILED',
      message: 'Failed to logout'
    });
  }
}

/**
 * POST /api/auth/password-reset-request
 * Request password reset email
 */
export async function requestPasswordReset(req: Request, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'MISSING_EMAIL',
        message: 'Email is required'
      });
    }

    // Find user by email
    const emailRecord = await prisma.email.findUnique({
      where: { address: email.toLowerCase() },
      include: { user: true }
    });

    // Always return success to prevent email enumeration
    if (!emailRecord) {
      return res.status(200).json({
        message: 'If an account with that email exists, a password reset link has been sent'
      });
    }

    // Send password reset email
    try {
      await sendPasswordResetEmail(emailRecord.user.id, email);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    return res.status(200).json({
      message: 'If an account with that email exists, a password reset link has been sent'
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    return res.status(500).json({
      error: 'REQUEST_FAILED',
      message: 'Failed to process password reset request'
    });
  }
}

/**
 * POST /api/auth/password-reset
 * Reset password using token
 */
export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'MISSING_FIELDS',
        message: 'Token and new password are required'
      });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Verify token
    const user = await verifyToken(token, 'PASSWORD_RESET');

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.password.upsert({
      where: { userId: user.id },
      update: { hash: passwordHash },
      create: {
        userId: user.id,
        hash: passwordHash
      }
    });

    // Revoke all existing sessions for security
    await prisma.session.deleteMany({
      where: { userId: user.id }
    });

    // Send confirmation email
    const primaryEmail = await prisma.email.findFirst({
      where: { userId: user.id, isPrimary: true }
    });

    if (primaryEmail) {
      try {
        await sendPasswordChangedEmail(primaryEmail.address);
      } catch (emailError) {
        console.error('Failed to send password change notification:', emailError);
      }
    }

    return res.status(200).json({
      message: 'Password reset successful'
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid or expired token') {
      return res.status(400).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired reset token'
      });
    }

    console.error('Password reset error:', error);
    return res.status(500).json({
      error: 'RESET_FAILED',
      message: 'Failed to reset password'
    });
  }
}

/**
 * GET /api/auth/verify-email
 * Verify email address using token
 */
export async function verifyEmail(req: Request, res: Response) {
  try {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        error: 'MISSING_TOKEN',
        message: 'Verification token is required'
      });
    }

    // Verify token
    const user = await verifyToken(token, 'EMAIL_VERIFICATION');

    // Mark email as verified
    await prisma.email.updateMany({
      where: {
        userId: user.id,
        isPrimary: true
      },
      data: {
        verifiedAt: new Date()
      }
    });

    return res.status(200).json({
      message: 'Email verified successfully'
    });

  } catch (error) {
    if (error instanceof Error && error.message === 'Invalid or expired token') {
      return res.status(400).json({
        error: 'INVALID_TOKEN',
        message: 'Invalid or expired verification token'
      });
    }

    console.error('Email verification error:', error);
    return res.status(500).json({
      error: 'VERIFICATION_FAILED',
      message: 'Failed to verify email'
    });
  }
}

/**
 * GET /api/auth/me
 * Get current user information
 */
export async function getCurrentUser(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Not authenticated'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        emails: {
          orderBy: { isPrimary: 'desc' }
        },
        providerAccounts: {
          select: {
            provider: true,
            email: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found'
      });
    }

    return res.status(200).json({
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        emails: user.emails,
        providers: user.providerAccounts,
        isSuperAdmin: user.isSuperAdmin,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });

  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({
      error: 'FETCH_FAILED',
      message: 'Failed to fetch user information'
    });
  }
}