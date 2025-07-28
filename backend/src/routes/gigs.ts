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

const GIG_SELECT_FIELDS =
  'id, band_id, venue_id, title, description, start_time, end_time, ticket_url, promo_image_url, is_promoted, views';


router.post('/new', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const userType = req.user?.userType;

  if (!userId || userType !== 'band') {
    return res.status(403).json({ message: 'Access denied. Only bands can create a gig.' });
  }

  const {
    bandId, 
    venueId,
    title,
    description,
    startTime,
    endTime,
    ticketUrl,
    promoImageUrl,
    isPromoted,
    views,
  } = req.body;

  if (!title) { 
    return res.status(400).json({ message: 'Band name is required.' });
  }

  if (!venueId) { 
    return res.status(400).json({ message: 'Venue is required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO gigs (band_id, venue_id, title, description, start_time, end_time, ticket_url, promo_image_url, is_promoted, views)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING ${GIG_SELECT_FIELDS}`,
      [bandId, venueId, title, description, startTime, endTime, ticketUrl, promoImageUrl, isPromoted, views]
    );

    res.status(201).json({ message: 'Gig created successfully!', gig: result.rows[0] });

  } catch (error) {
    console.error('Error creating gig:', error);
    res.status(500).json({ message: 'Server error creating gig.' });
  }
});

router.get('/:gigId', async (req: Request, res: Response) => {
  const { gigId } = req.params;

  try {
    const result = await pool.query(
      `SELECT ${GIG_SELECT_FIELDS} FROM gigs WHERE id = $1`,
      [gigId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gig not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching gig', error);
    res.status(500).json({ message: 'Server error fetching gig.' });
  }
});

router.put('/:gigId/edit', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const userType = req.user?.userType;
  const { gigId } = req.params;

  if (!userId || userType !== 'band') {
    return res.status(403).json({ message: 'Access denied. Only bands can update their gigs.' });
  }

  const {
    bandId, 
    venueId,
    title,
    description,
    startTime,
    endTime,
    ticketUrl,
    promoImageUrl,
    isPromoted,
    views,
  } = req.body;

  if (!venueId) {
    return res.status(400).json({ message: 'Venue is required for update.' });
  }

  try {
    const result = await pool.query(
      `UPDATE gigs
       SET band_id = $1, venue_id = $2, title = $3, description = $4, start_time = $5, end_time = $6, ticket_url = $7, promo_image_url = $8, is_promoted = $9, views = $10
       WHERE id = $11
       RETURNING ${GIG_SELECT_FIELDS}`,
      [bandId, venueId, title, description, startTime, endTime, ticketUrl, promoImageUrl, isPromoted, views, gigId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gig not found.' });
    }

    res.json({ message: 'Gig updated successfully!', profile: result.rows[0] });

  } catch (error) {
    console.error('Error updating gig:', error);
    res.status(500).json({ message: 'Server error updating band profile.' });
  }
});