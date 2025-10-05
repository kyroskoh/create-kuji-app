import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

/**
 * Initialize email transporter based on environment
 */
function getTransporter(): nodemailer.Transporter {
  if (transporter) {
    return transporter;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  
  if (isProduction) {
    // SendGrid/Production configuration
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER!,
        pass: process.env.EMAIL_PASS!,
      },
    });
  } else {
    // Ethereal/Development configuration
    // For dev, you can create a test account at https://ethereal.email/
    transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.ethereal.email',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  return transporter;
}

/**
 * Generate a verification or reset token
 */
async function generateToken(userId: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET'): Promise<string> {
  // Generate a secure random token
  const token = crypto.randomBytes(32).toString('hex');
  
  // Token expires in 24 hours for email verification, 1 hour for password reset
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + (type === 'EMAIL_VERIFICATION' ? 24 : 1));

  // Store token in database
  await prisma.token.create({
    data: {
      userId,
      type,
      token,
      expiresAt,
    },
  });

  return token;
}

/**
 * Verify and consume a token
 */
export async function verifyToken(token: string, type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET') {
  const tokenRecord = await prisma.token.findFirst({
    where: {
      token,
      type,
      usedAt: null,
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  if (!tokenRecord) {
    throw new Error('Invalid or expired token');
  }

  // Mark token as used
  await prisma.token.update({
    where: { id: tokenRecord.id },
    data: { usedAt: new Date() },
  });

  return tokenRecord.user;
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(userId: string, email: string): Promise<void> {
  const token = await generateToken(userId, 'EMAIL_VERIFICATION');
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

  const transporter = getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Create Kuji" <noreply@createkuji.app>',
    to: email,
    subject: 'Verify Your Email - Create Kuji',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎊 Welcome to Create Kuji!</h1>
            </div>
            <div class="content">
              <h2>Verify Your Email Address</h2>
              <p>Thank you for signing up! Please click the button below to verify your email address and activate your account.</p>
              <p style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              <p><strong>This link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with Create Kuji, you can safely ignore this email.</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Create Kuji. Built with ❤️ for the community.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('📧 Verification email sent:', nodemailer.getTestMessageUrl(info));
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(userId: string, email: string): Promise<void> {
  const token = await generateToken(userId, 'PASSWORD_RESET');
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  const transporter = getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Create Kuji" <noreply@createkuji.app>',
    to: email,
    subject: 'Reset Your Password - Create Kuji',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #f5576c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <p style="text-align: center;">
                <a href="${resetUrl}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #f5576c;">${resetUrl}</p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> This link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Create Kuji. Built with ❤️ for the community.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('📧 Password reset email sent:', nodemailer.getTestMessageUrl(info));
  }
}

/**
 * Send password change notification
 */
export async function sendPasswordChangedEmail(email: string): Promise<void> {
  const transporter = getTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Create Kuji" <noreply@createkuji.app>',
    to: email,
    subject: 'Password Changed - Create Kuji',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
            .alert { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 15px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Password Changed</h1>
            </div>
            <div class="content">
              <h2>Your Password Has Been Changed</h2>
              <p>This is a confirmation that your password for your Create Kuji account has been successfully changed.</p>
              <div class="alert">
                <strong>🔔 Security Alert:</strong> If you did not make this change, please contact support immediately and reset your password.
              </div>
              <p>Time of change: <strong>${new Date().toLocaleString()}</strong></p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Create Kuji. Built with ❤️ for the community.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  };

  const info = await transporter.sendMail(mailOptions);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log('📧 Password change notification sent:', nodemailer.getTestMessageUrl(info));
  }
}