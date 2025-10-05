import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { AccessTokenPayload } from '../utils/jwt';

const prisma = new PrismaClient();

/**
 * Local Strategy for email/username + password authentication
 */
passport.use('local', new LocalStrategy({
  usernameField: 'emailOrUsername', // Allow email or username
  passwordField: 'password',
  session: false // We're using JWT, not sessions
}, async (emailOrUsername: string, password: string, done) => {
  try {
    // Find user by email or username (case-insensitive)
    const user = await prisma.user.findFirst({
      where: {
        AND: [
          { isActive: true },
          {
            OR: [
              { username: emailOrUsername.toLowerCase() },
              { emails: { some: { address: emailOrUsername.toLowerCase() } } }
            ]
          }
        ]
      },
      include: {
        password: true,
        emails: {
          where: { isPrimary: true }
        }
      }
    });

    if (!user || !user.password) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password.hash);
    
    if (!isValidPassword) {
      return done(null, false, { message: 'Invalid credentials' });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return done(null, userWithoutPassword);

  } catch (error) {
    return done(error);
  }
}));

/**
 * JWT Strategy for access token authentication
 */
passport.use('jwt', new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET!,
  issuer: 'create-kuji-server',
  audience: 'create-kuji-app'
}, async (payload: AccessTokenPayload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { 
        id: payload.userId,
        isActive: true 
      },
      include: {
        emails: {
          where: { isPrimary: true }
        }
      }
    });

    if (!user) {
      return done(null, false);
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
}));

/**
 * Serialize user for passport
 */
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

/**
 * Deserialize user for passport
 */
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id, isActive: true },
      include: {
        emails: {
          where: { isPrimary: true }
        }
      }
    });
    
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;