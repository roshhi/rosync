import bcrypt from 'bcrypt';
import { prisma } from '../lib/prisma.js';
import { generateToken, verifyToken } from '../utils/jwt.js';

const SALT_ROUNDS = 10;

export const signupController = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
              success: false,
              error: 'All fields are required'
            });
        }          
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword
            }
        });
        res.status(201).json({
            success: true,
            message: 'User created successfully',
            userId: user.id
        });
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({
              success: false,
              error: 'Email already exists'
            });
        }
        console.error('Error signing up:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
              success: false,
              error: 'Email and password required'
            });
        } 
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }
        const token = generateToken(user.id);
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });
        res.json({
            success: true,
            message: 'Login successful',
            user: {
                id: user.id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

export const logoutController = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: true,
        sameSite: 'none'
    });
    res.json({
        success: true,
        message: 'Logout successful'
    });
}

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
  
    try {
      const decoded = verifyToken(token);
      req.userId = decoded.id;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
};

export const profileController = async (req, res) => {
    try {
        const userId = req.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
}