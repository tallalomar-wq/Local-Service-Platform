import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models';
import { AuthRequest } from '../middleware/auth.middleware';
import { sendVerificationEmail } from '../services/email.service';
import { sendVerificationSMS, generateVerificationCode } from '../services/sms.service';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
      res.status(400).json({ 
        message: 'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character' 
      });
      return;
    }

    const existingUser = await User.findOne({ where: { email: normalizedEmail } });
    if (existingUser) {
      res.status(400).json({ message: 'Email already registered' });
      return;
    }

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Generate phone verification code if phone provided
    let phoneVerificationCode: string | undefined;
    let phoneVerificationExpires: Date | undefined;
    if (phone) {
      phoneVerificationCode = generateVerificationCode();
      phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    }

    const user = await User.create({
      email: normalizedEmail,
      password,
      firstName,
      lastName,
      phone,
      role: role || 'customer',
      isActive: true,
      emailVerified: false,
      emailVerificationToken,
      emailVerificationExpires,
      phoneVerified: false,
      phoneVerificationCode,
      phoneVerificationExpires,
    });

    // Send verification email
    try {
      await sendVerificationEmail(user.email, emailVerificationToken, user.firstName);
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }

    // Send verification SMS if phone provided
    if (phone && phoneVerificationCode) {
      try {
        await sendVerificationSMS(phone, phoneVerificationCode);
      } catch (error) {
        console.error('Failed to send verification SMS:', error);
      }
    }

    const token = (jwt.sign as any)(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'User registered successfully. Please verify your email and phone.',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      },
      requiresVerification: {
        email: true,
        phone: !!phone,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Normalize email to lowercase
    const normalizedEmail = email.toLowerCase().trim();

    console.log('Login attempt for email:', normalizedEmail);

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      console.log('User not found:', normalizedEmail);
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    console.log('User found, checking password...');

    if (!user.isActive) {
      console.log('Account is inactive');
      res.status(403).json({ message: 'Account is inactive' });
      return;
    }

    const isValidPassword = await user.comparePassword(password);
    console.log('Password validation result:', isValidPassword);
    
    if (!isValidPassword) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = (jwt.sign as any)(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error during login' });
  }
};

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'firstName', 'lastName', 'role', 'isActive', 'emailVerified', 'phoneVerified', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });

    const usersByRole = {
      customers: users.filter(u => u.role === 'customer'),
      providers: users.filter(u => u.role === 'provider'),
      admins: users.filter(u => u.role === 'admin'),
      total: users.length
    };

    res.json(usersByRole);
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Error fetching users' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      avatar: avatar || user.avatar,
    });

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
      },
    });

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired verification token' });
      return;
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      res.status(400).json({ message: 'Verification token has expired' });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ message: 'Email already verified' });
      return;
    }

    await user.update({
      emailVerified: true,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined,
    });

    res.json({
      message: 'Email verified successfully',
      emailVerified: true,
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Error verifying email' });
  }
};

export const verifyPhone = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!user.phoneVerificationCode) {
      res.status(400).json({ message: 'No verification code found' });
      return;
    }

    if (user.phoneVerificationExpires && user.phoneVerificationExpires < new Date()) {
      res.status(400).json({ message: 'Verification code has expired' });
      return;
    }

    if (user.phoneVerified) {
      res.status(400).json({ message: 'Phone already verified' });
      return;
    }

    if (user.phoneVerificationCode !== code) {
      res.status(400).json({ message: 'Invalid verification code' });
      return;
    }

    await user.update({
      phoneVerified: true,
      phoneVerificationCode: undefined,
      phoneVerificationExpires: undefined,
    });

    res.json({
      message: 'Phone verified successfully',
      phoneVerified: true,
    });
  } catch (error) {
    console.error('Phone verification error:', error);
    res.status(500).json({ message: 'Error verifying phone' });
  }
};

export const resendEmailVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.emailVerified) {
      res.status(400).json({ message: 'Email already verified' });
      return;
    }

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.update({
      emailVerificationToken,
      emailVerificationExpires,
    });

    await sendVerificationEmail(user.email, emailVerificationToken, user.firstName);

    res.json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend email verification error:', error);
    res.status(500).json({ message: 'Error sending verification email' });
  }
};

export const resendPhoneVerification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.phoneVerified) {
      res.status(400).json({ message: 'Phone already verified' });
      return;
    }

    if (!user.phone) {
      res.status(400).json({ message: 'No phone number associated with account' });
      return;
    }

    const phoneVerificationCode = generateVerificationCode();
    const phoneVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);

    await user.update({
      phoneVerificationCode,
      phoneVerificationExpires,
    });

    await sendVerificationSMS(user.phone, phoneVerificationCode);

    res.json({ message: 'Verification code sent to your phone' });
  } catch (error) {
    console.error('Resend phone verification error:', error);
    res.status(500).json({ message: 'Error sending verification code' });
  }
};
