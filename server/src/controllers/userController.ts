import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sendVerificationEmail } from '../services/emailService';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * Update user profile
 * PATCH /api/user/profile
 */
export async function updateProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { displayName } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { displayName },
      include: {
        emails: {
          select: {
            id: true,
            address: true,
            isPrimary: true,
            verifiedAt: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to update profile',
    });
  }
}

/**
 * Change password
 * POST /api/user/change-password
 */
export async function changePassword(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 8 characters long',
      });
    }

    // Fetch current password
    const passwordRecord = await prisma.password.findUnique({
      where: { userId },
    });

    if (!passwordRecord) {
      return res.status(400).json({
        error: 'NO_PASSWORD',
        message: 'Account does not have a password set (SSO account)',
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, passwordRecord.hash);
    
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'INVALID_PASSWORD',
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 12);

    // Update password
    await prisma.password.update({
      where: { userId },
      data: { hash: newHash },
    });

    // Invalidate all sessions except current one
    const currentSessionToken = req.headers.authorization?.split(' ')[1];
    await prisma.session.deleteMany({
      where: {
        userId,
        refreshToken: { not: currentSessionToken },
      },
    });

    return res.status(200).json({
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Error changing password:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to change password',
    });
  }
}

/**
 * Add email address
 * POST /api/user/emails
 */
export async function addEmail(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { email } = req.body;

    if (!email || !email.includes('@')) {
      return res.status(400).json({
        error: 'INVALID_EMAIL',
        message: 'Valid email address is required',
      });
    }

    // Check if email already exists
    const existingEmail = await prisma.email.findUnique({
      where: { address: email.toLowerCase() },
    });

    if (existingEmail) {
      return res.status(409).json({
        error: 'EMAIL_EXISTS',
        message: 'Email address is already in use',
      });
    }

    // Check if user has any emails (if not, this will be primary)
    const userEmails = await prisma.email.findMany({
      where: { userId },
    });

    const isPrimary = userEmails.length === 0;

    // Create new email
    const newEmail = await prisma.email.create({
      data: {
        address: email.toLowerCase(),
        userId,
        isPrimary,
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, req.user!.username);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Don't fail the request if email sending fails
    }

    return res.status(201).json({
      message: 'Email added successfully. Please check your inbox to verify.',
      email: {
        id: newEmail.id,
        address: newEmail.address,
        isPrimary: newEmail.isPrimary,
        verifiedAt: newEmail.verifiedAt,
      },
    });
  } catch (error) {
    console.error('Error adding email:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to add email',
    });
  }
}

/**
 * Remove email address
 * DELETE /api/user/emails/:id
 */
export async function removeEmail(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Fetch email to check ownership and if it's primary
    const email = await prisma.email.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!email) {
      return res.status(404).json({
        error: 'EMAIL_NOT_FOUND',
        message: 'Email not found',
      });
    }

    if (email.isPrimary) {
      return res.status(400).json({
        error: 'CANNOT_REMOVE_PRIMARY',
        message: 'Cannot remove primary email. Set another email as primary first.',
      });
    }

    // Delete email
    await prisma.email.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'Email removed successfully',
    });
  } catch (error) {
    console.error('Error removing email:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to remove email',
    });
  }
}

/**
 * Set primary email
 * PATCH /api/user/emails/:id/primary
 */
export async function setPrimaryEmail(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Verify email belongs to user
    const email = await prisma.email.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!email) {
      return res.status(404).json({
        error: 'EMAIL_NOT_FOUND',
        message: 'Email not found',
      });
    }

    // Update emails in transaction
    await prisma.$transaction([
      // Set all user emails to non-primary
      prisma.email.updateMany({
        where: { userId },
        data: { isPrimary: false },
      }),
      // Set target email as primary
      prisma.email.update({
        where: { id },
        data: { isPrimary: true },
      }),
    ]);

    return res.status(200).json({
      message: 'Primary email updated successfully',
    });
  } catch (error) {
    console.error('Error setting primary email:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to set primary email',
    });
  }
}

/**
 * Resend email verification
 * POST /api/user/emails/:id/resend-verification
 */
export async function resendVerification(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    // Fetch email
    const email = await prisma.email.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!email) {
      return res.status(404).json({
        error: 'EMAIL_NOT_FOUND',
        message: 'Email not found',
      });
    }

    if (email.verifiedAt) {
      return res.status(400).json({
        error: 'ALREADY_VERIFIED',
        message: 'Email is already verified',
      });
    }

    // Send verification email
    await sendVerificationEmail(email.address, req.user!.username);

    return res.status(200).json({
      message: 'Verification email sent successfully',
    });
  } catch (error) {
    console.error('Error resending verification:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to resend verification email',
    });
  }
}

/**
 * Update username (first-time only)
 * PUT /api/user/username
 */
export async function updateUsername(req: Request, res: Response) {
  try {
    const userId = req.user!.id;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        error: 'INVALID_INPUT',
        message: 'Username is required',
      });
    }

    // Validate username format (alphanumeric, underscore, hyphen, 5-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_-]{5,20}$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({
        error: 'INVALID_USERNAME',
        message: 'Username must be 5-20 characters and contain only letters, numbers, underscores, and hyphens',
      });
    }

    // Fetch current user
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!currentUser) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    // Check if username has already been set by user
    if (currentUser.usernameSetByUser) {
      return res.status(403).json({
        error: 'USERNAME_ALREADY_SET',
        message: 'Username has already been set. Please contact support to change it.',
      });
    }

    // Check if new username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
    });

    if (existingUsername && existingUsername.id !== userId) {
      return res.status(409).json({
        error: 'USERNAME_EXISTS',
        message: 'Username already taken',
      });
    }

    // Update username and mark as set by user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: username.toLowerCase(),
        displayName: username,
        usernameSetByUser: true,
      },
      include: {
        emails: {
          select: {
            address: true,
            isPrimary: true,
            verifiedAt: true,
          },
          orderBy: { isPrimary: 'desc' },
        },
      },
    });

    return res.status(200).json({
      message: 'Username updated successfully',
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        usernameSetByUser: updatedUser.usernameSetByUser,
        email: updatedUser.emails[0]?.address,
        emailVerified: updatedUser.emails[0]?.verifiedAt !== null,
        isSuperAdmin: updatedUser.isSuperAdmin,
      },
    });
  } catch (error) {
    console.error('Error updating username:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to update username',
    });
  }
}

/**
 * Get user's own profile with all details
 * GET /api/user/profile
 */
export async function getProfile(req: Request, res: Response) {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        emails: {
          select: {
            id: true,
            address: true,
            isPrimary: true,
            verifiedAt: true,
            createdAt: true,
          },
          orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
        },
        providerAccounts: {
          select: {
            id: true,
            provider: true,
            createdAt: true,
          },
        },
        password: {
          select: {
            id: true, // Just to check if password exists
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    return res.status(200).json({
      user: {
        ...user,
        hasPassword: !!user.password,
        password: undefined, // Remove password field from response
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch profile',
    });
  }
}
