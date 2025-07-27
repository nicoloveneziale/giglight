import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import { AuthRequest, authMiddleware } from './auth';

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

const BAND_PROFILE_SELECT_FIELDS =
  'id, user_id, name, bio, profile_picture_url, website_url, facebook_url, instagram_url, bandcamp_url, spotify_url, youtube_url, genre, location';


router.get('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const userType = req.user?.userType;

  if (!userId || userType !== 'band') {
    return res.status(403).json({ message: 'Access denied. Only bands can view their own profile.' });
  }

  try {
    const result = await pool.query(
      `SELECT ${BAND_PROFILE_SELECT_FIELDS} FROM bands WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Band profile not found for this user.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching band profile:', error);
    res.status(500).json({ message: 'Server error fetching band profile.' });
  }
});


router.post('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const userType = req.user?.userType;

  if (!userId || userType !== 'band') {
    return res.status(403).json({ message: 'Access denied. Only bands can create a profile.' });
  }

  const {
    name, 
    genre,
    bio,
    location,
    profile_picture_url, 
    website_url,
    facebook_url, 
    instagram_url, 
    bandcamp_url, 
    spotify_url, 
    youtube_url 
  } = req.body;

  if (!name) { 
    return res.status(400).json({ message: 'Band name is required.' });
  }

  try {
    const existingProfile = await pool.query('SELECT id FROM bands WHERE user_id = $1', [userId]);
    if (existingProfile.rows.length > 0) {
      return res.status(409).json({ message: 'Band profile already exists for this user. Use PUT to update.' });
    }

    const result = await pool.query(
      `INSERT INTO bands (user_id, name, genre, bio, location, profile_picture_url, website_url, facebook_url, instagram_url, bandcamp_url, spotify_url, youtube_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING ${BAND_PROFILE_SELECT_FIELDS}`,
      [userId, name, genre, bio, location, profile_picture_url, website_url, facebook_url, instagram_url, bandcamp_url, spotify_url, youtube_url]
    );

    res.status(201).json({ message: 'Band profile created successfully!', profile: result.rows[0] });

  } catch (error) {
    console.error('Error creating band profile:', error);
    res.status(500).json({ message: 'Server error creating band profile.' });
  }
});


router.put('/profile', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const userType = req.user?.userType;

  if (!userId || userType !== 'band') {
    return res.status(403).json({ message: 'Access denied. Only bands can update their profile.' });
  }

  const {
    name, 
    genre,
    bio,
    location,
    profile_picture_url, 
    website_url,
    facebook_url,
    instagram_url, 
    bandcamp_url, 
    spotify_url, 
    youtube_url 
  } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Band name is required for update.' });
  }

  try {
    const result = await pool.query(
      `UPDATE bands
       SET name = $1, genre = $2, bio = $3, location = $4, profile_picture_url = $5, website_url = $6, facebook_url = $7, instagram_url = $8, bandcamp_url = $9, spotify_url = $10, youtube_url = $11, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $12
       RETURNING ${BAND_PROFILE_SELECT_FIELDS}`,
      [name, genre, bio, location, profile_picture_url, website_url, facebook_url, instagram_url, bandcamp_url, spotify_url, youtube_url, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Band profile not found for this user.' });
    }

    res.json({ message: 'Band profile updated successfully!', profile: result.rows[0] });

  } catch (error) {
    console.error('Error updating band profile:', error);
    res.status(500).json({ message: 'Server error updating band profile.' });
  }
});

router.get('/:bandId', async (req: Request, res: Response) => {
  const { bandId } = req.params;

  try {
    const result = await pool.query(
      `SELECT ${BAND_PROFILE_SELECT_FIELDS} FROM bands WHERE id = $1`,
      [bandId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Band not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching public band profile:', error);
    res.status(500).json({ message: 'Server error fetching public band profile.' });
  }
});

export default router;