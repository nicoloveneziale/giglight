import { Router, Request, Response, NextFunction } from 'express';
import { Pool } from 'pg';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});
const jwtSecret = process.env.JWT_SECRET as string;

if (!jwtSecret) {
  console.error('FATAL ERROR: JWT_SECRET is not defined in .env');
  process.exit(1); 
}

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    userType: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as { id: string; email: string; userType: string };
    req.user = decoded; 
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};


router.post('/register', async (req: Request, res: Response) => {
  const { email, password, userType } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const hashedPassword = await hash(password, 10); 

    const result = await pool.query(
      'INSERT INTO users (email, password_hash, user_type) VALUES ($1, $2, $3) RETURNING id, email, user_type',
      [email, hashedPassword, userType || 'fan'] 
    );

    const user = result.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, user_type: user.user_type },
      jwtSecret,
      { expiresIn: '1h' } 
    );

    res.status(201).json({ message: 'User registered successfully', token, user: { id: user.id, email: user.email, userType: user.user_type } });
  } catch (error) {
    console.error('Registration error:', error);
    if ((error as any).code === '23505') { 
      return res.status(409).json({ message: 'User with that email already exists' });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT id, email, password_hash, user_type FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }


    const token = jwt.sign(
      { id: user.id, email: user.email, userType: user.user_type },
      jwtSecret,
      { expiresIn: '1h' } 
    );

    res.json({ message: 'Logged in successfully', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});


router.get('/protected', authMiddleware, (req: AuthRequest, res: Response) => {
  if (req.user) {
    res.json({
      message: 'This is a protected route!',
      user: req.user,
      data: 'Sensitive data accessible only to authenticated users.'
    });
  } else {
    res.status(403).json({ message: 'Access denied: User not found in request context.' });
  }
});


export default router;