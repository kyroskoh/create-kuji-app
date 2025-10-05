import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get all users with pagination, search, and sorting
 * GET /api/admin/users
 */
export async function getUsers(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
    const skip = (pageNum - 1) * limitNum;

    // Build search filter
    const searchFilter = search
      ? {
          OR: [
            { username: { contains: search as string, mode: 'insensitive' as const } },
            { displayName: { contains: search as string, mode: 'insensitive' as const } },
            { emails: { some: { address: { contains: search as string, mode: 'insensitive' as const } } } },
          ],
        }
      : {};

    // Build sort configuration
    const validSortFields = ['username', 'createdAt', 'lastLogin', 'displayName'];
    const sortField = validSortFields.includes(sortBy as string) ? sortBy : 'createdAt';
    const orderBy = { [sortField]: sortOrder === 'asc' ? 'asc' : 'desc' };

    // Fetch users and total count
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        where: {
          ...searchFilter,
          isActive: true, // Only show active users
        },
        include: {
          emails: {
            select: {
              id: true,
              address: true,
              isPrimary: true,
              verifiedAt: true,
            },
          },
          providerAccounts: {
            select: {
              id: true,
              provider: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              sessions: true,
            },
          },
        },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.user.count({
        where: {
          ...searchFilter,
          isActive: true,
        },
      }),
    ]);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limitNum);
    const hasNextPage = pageNum < totalPages;
    const hasPreviousPage = pageNum > 1;

    return res.status(200).json({
      users,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalCount,
        limit: limitNum,
        hasNextPage,
        hasPreviousPage,
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch users',
    });
  }
}

/**
 * Get single user by ID
 * GET /api/admin/users/:id
 */
export async function getUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        emails: {
          select: {
            id: true,
            address: true,
            isPrimary: true,
            verifiedAt: true,
            createdAt: true,
          },
        },
        providerAccounts: {
          select: {
            id: true,
            provider: true,
            providerId: true,
            createdAt: true,
          },
        },
        sessions: {
          select: {
            id: true,
            createdAt: true,
            expiresAt: true,
            ipAddress: true,
            userAgent: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10, // Last 10 sessions
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch user',
    });
  }
}

/**
 * Update user
 * PATCH /api/admin/users/:id
 */
export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { displayName, isSuperAdmin, isActive } = req.body;

    // Prevent admin from changing their own super admin status
    if (req.user?.id === id && isSuperAdmin === false) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Cannot remove your own super admin privileges',
      });
    }

    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (isSuperAdmin !== undefined) updateData.isSuperAdmin = isSuperAdmin;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        emails: {
          select: {
            id: true,
            address: true,
            isPrimary: true,
            verifiedAt: true,
          },
        },
        providerAccounts: {
          select: {
            id: true,
            provider: true,
          },
        },
      },
    });

    return res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to update user',
    });
  }
}

/**
 * Soft delete user (deactivate)
 * DELETE /api/admin/users/:id
 */
export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user?.id === id) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: 'Cannot delete your own account',
      });
    }

    // Soft delete by setting isActive to false
    const deletedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        // Also invalidate all sessions
        sessions: {
          deleteMany: {},
        },
      },
    });

    return res.status(200).json({
      message: 'User deleted successfully',
      user: { id: deletedUser.id, username: deletedUser.username },
    });
  } catch (error: any) {
    console.error('Error deleting user:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'USER_NOT_FOUND',
        message: 'User not found',
      });
    }

    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to delete user',
    });
  }
}

/**
 * Get user statistics for dashboard
 * GET /api/admin/stats
 */
export async function getStats(req: Request, res: Response) {
  try {
    const [
      totalUsers,
      activeUsers,
      verifiedUsers,
      userGrowth,
    ] = await Promise.all([
      // Total users
      prisma.user.count({ where: { isActive: true } }),
      
      // Active users (logged in within last 30 days)
      prisma.user.count({
        where: {
          isActive: true,
          lastLogin: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      
      // Users with verified email
      prisma.user.count({
        where: {
          isActive: true,
          emails: {
            some: {
              verifiedAt: { not: null },
            },
          },
        },
      }),
      
      // User growth over last 12 months
      prisma.$queryRaw`
        SELECT 
          DATE_TRUNC('month', "createdAt") as month,
          COUNT(*)::int as count
        FROM "User"
        WHERE "createdAt" >= NOW() - INTERVAL '12 months'
          AND "isActive" = true
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month ASC
      `,
    ]);

    return res.status(200).json({
      stats: {
        totalUsers,
        activeUsers,
        verifiedUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
      },
      userGrowth,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch statistics',
    });
  }
}

/**
 * Revoke all user sessions
 * POST /api/admin/users/:id/revoke-sessions
 */
export async function revokeUserSessions(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.session.deleteMany({
      where: { userId: id },
    });

    return res.status(200).json({
      message: 'All user sessions revoked successfully',
    });
  } catch (error) {
    console.error('Error revoking sessions:', error);
    return res.status(500).json({
      error: 'INTERNAL_ERROR',
      message: 'Failed to revoke sessions',
    });
  }
}
