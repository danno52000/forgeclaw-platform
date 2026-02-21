import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { createLogger } from 'winston';

const router = Router();
const logger = createLogger({ level: 'info' });

const JWT_SECRET = process.env.JWT_SECRET || 'forgeclaw-dev-secret-change-in-production';

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required()
});

const registerSchema = Joi.object({
  firstName: Joi.string().required().min(1).max(50),
  lastName: Joi.string().required().min(1).max(50),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  company: Joi.string().required().min(1).max(100)
});

// Mock user database - in production this would be Supabase or similar
const mockUsers: any[] = [
  {
    id: '1',
    firstName: 'Demo',
    lastName: 'Advisor',
    email: 'demo@forgeclaw.com',
    // Password: 'demo123456'
    password: '$2a$10$8ZlZjRrww.r5V6P6hF8pXOqJ7S1t.zs6.7xF8LvH2vj0L5iH.2EO2',
    company: 'Demo Financial Advisors',
    role: 'advisor',
    createdAt: '2026-02-21T10:00:00Z',
    advisorId: 'advisor-demo-123'
  }
];

/**
 * POST /api/auth/register
 * Register a new advisor account
 */
router.post('/register', async (req, res) => {
  try {
    // Validate request
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { firstName, lastName, email, password, company } = value;

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'An account with this email address already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      firstName,
      lastName,
      email,
      password: hashedPassword,
      company,
      role: 'advisor',
      createdAt: new Date().toISOString(),
      advisorId: null // Will be set when they create an instance
    };

    mockUsers.push(newUser);

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = newUser;

    logger.info('New advisor registered:', { email, company });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user: userResponse,
      token,
      expiresIn: '7 days'
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/login
 * Login existing user
 */
router.post('/login', async (req, res) => {
  try {
    // Validate request
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { email, password } = value;

    // Find user
    const user = mockUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        advisorId: user.advisorId
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Remove password from response
    const { password: _, ...userResponse } = user;

    logger.info('User logged in:', { email, userId: user.id });

    res.json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token,
      expiresIn: '7 days'
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error.message
    });
  }
});

/**
 * GET /api/auth/me
 * Get current user information
 */
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = mockUsers.find(u => u.id === req.user.userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userResponse } = user;

    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({
      error: 'Failed to fetch user information',
      message: error.message
    });
  }
});

/**
 * PUT /api/auth/me
 * Update current user information
 */
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const userIndex = mockUsers.findIndex(u => u.id === req.user.userId);
    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Validate updates (subset of register schema)
    const updateSchema = Joi.object({
      firstName: Joi.string().min(1).max(50),
      lastName: Joi.string().min(1).max(50),
      company: Joi.string().min(1).max(100),
      currentPassword: Joi.string().min(8),
      newPassword: Joi.string().min(8)
    });

    const { error, value } = updateSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message)
      });
    }

    const { firstName, lastName, company, currentPassword, newPassword } = value;
    const user = mockUsers[userIndex];

    // Update basic info
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (company) user.company = company;

    // Handle password change
    if (newPassword && currentPassword) {
      const isValidCurrentPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidCurrentPassword) {
        return res.status(400).json({
          error: 'Invalid current password'
        });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    user.updatedAt = new Date().toISOString();

    // Remove password from response
    const { password: _, ...userResponse } = user;

    logger.info('User updated profile:', { userId: user.id, email: user.email });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      error: 'Failed to update profile',
      message: error.message
    });
  }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side should remove token)
 */
router.post('/logout', authenticateToken, (req, res) => {
  logger.info('User logged out:', { userId: req.user.userId, email: req.user.email });
  
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

/**
 * Middleware to authenticate JWT tokens
 */
function authenticateToken(req: any, res: any, next: any) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: 'Access denied',
      message: 'No token provided'
    });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({
        error: 'Invalid token',
        message: 'Token is invalid or expired'
      });
    }
    req.user = user;
    next();
  });
}

// Export middleware for use in other routes
export { authenticateToken };
export default router;
