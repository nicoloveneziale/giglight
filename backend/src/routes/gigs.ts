import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { AuthRequest, authMiddleware } from './auth';


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
  'id, band_id, venue_id, title, description, start_time, end_time, ticket_url, promo_image_url, is_promoted, views, created_at, updated_at'; 

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const userType = req.user?.userType; 

  if (!userId || userType !== 'band') {
    return res.status(403).json({ message: 'Access denied. Only bands can create a gig.' });
  }

  const bandResult = await pool.query('SELECT id FROM bands WHERE user_id = $1', [userId]);
  if (bandResult.rows.length === 0) {
    return res.status(404).json({ message: 'Band profile not found for this user. Please create your band profile first.' });
  }
  const band_id = bandResult.rows[0].id; 

  const {
    venue_id, 
    title,
    description,
    start_time, 
    end_time,   
    ticket_url, 
    promo_image_url, 
  } = req.body;

  if (!title || !venue_id || !start_time || !end_time) {
    return res.status(400).json({ message: 'Title, venue, and times are required.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO gigs (band_id, venue_id, title, description, start_time, end_time, ticket_url, promo_image_url, is_promoted, views)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING ${GIG_SELECT_FIELDS}`,
      [
        band_id, 
        venue_id,
        title,
        description,
        start_time,
        end_time,
        ticket_url,
        promo_image_url,
        false, 
        0      
      ]
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

router.get('/', async (req: Request, res: Response) => { 
  try {
    const result = await pool.query(
      `SELECT ${GIG_SELECT_FIELDS} FROM gigs ORDER BY start_time ASC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching all gigs:', error);
    res.status(500).json({ message: 'Server error fetching all gigs.' });
  }
});


router.put('/:gigId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const userType = req.user?.userType; 
  const { gigId } = req.params;

  if (!userId || userType !== 'band') {
    return res.status(403).json({ message: 'Access denied. Only bands can update their gigs.' });
  }

  const bandResult = await pool.query('SELECT id FROM bands WHERE user_id = $1', [userId]);
  if (bandResult.rows.length === 0) {
    return res.status(404).json({ message: 'Band profile not found for this user.' });
  }
  const band_id = bandResult.rows[0].id; 

  const {
    venue_id, 
    title,
    description,
    start_time, 
    end_time,  
    ticket_url, 
    promo_image_url,
    is_promoted, 
    views,
  } = req.body;

  if (!title || !venue_id || !start_time) { 
    return res.status(400).json({ message: 'Title, venue, and start time are required for update.' });
  }

  try {
    const result = await pool.query(
      `UPDATE gigs
       SET venue_id = $1, title = $2, description = $3, start_time = $4, end_time = $5, ticket_url = $6, promo_image_url = $7, is_promoted = $8, views = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 AND band_id = $11 
       RETURNING ${GIG_SELECT_FIELDS}`,
      [
        venue_id,
        title,
        description,
        start_time,
        end_time,
        ticket_url,
        promo_image_url,
        is_promoted || false,
        views || 0, 
        gigId,     
        band_id     
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gig not found or you do not have permission to update it.' });
    }

    res.json({ message: 'Gig updated successfully!', gig: result.rows[0] }); 

  } catch (error) {
    console.error('Error updating gig:', error);
    res.status(500).json({ message: 'Server error updating gig.' });
  }
});

router.delete('/:gigId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;
  const userType = req.user?.userType;
  const { gigId } = req.params;

  if (!userId || userType !== 'band') {
    return res.status(403).json({ message: 'Access denied. Only bands can delete their gigs.' });
  }

  const bandResult = await pool.query('SELECT id FROM bands WHERE user_id = $1', [userId]);
  if (bandResult.rows.length === 0) {
    return res.status(404).json({ message: 'Band profile not found for this user.' });
  }
  const band_id = bandResult.rows[0].id;

  try {
    const result = await pool.query(
      `DELETE FROM gigs
       WHERE id = $1 AND band_id = $2
       RETURNING id`, 
      [gigId, band_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Gig not found or you do not have permission to delete it.' });
    }

    res.status(200).json({ message: 'Gig deleted successfully!' });
  } catch (error) {
    console.error('Error deleting gig:', error);
    res.status(500).json({ message: 'Server error deleting gig.' });
  }
});


export default router;