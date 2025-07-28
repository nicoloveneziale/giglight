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

const VENUE_SELECT_FIELDS =
  'id, name, address, city, postcode, latitude, longitude, website_url, created_at, updated_at';

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const userType = req.user?.userType;

  if (!userType || (userType !== 'band' && userType !== 'admin')) {
    return res.status(403).json({ message: 'Access denied. Only bands or admins can create venues.' });
  }

  const { name, address, city, postcode, latitude, longitude, website_url } = req.body;

  if (!name || !address || !city || !postcode) {
    return res.status(400).json({ message: 'Name, address, city, and postcode are required for a venue.' });
  }

  try {
    const existingVenue = await pool.query(
      'SELECT id FROM venues WHERE name ILIKE $1 AND address ILIKE $2 AND city ILIKE $3',
      [name, address, city]
    );
    if (existingVenue.rows.length > 0) {
      return res.status(409).json({ message: 'A venue with this name and address already exists in this city.' });
    }

    const result = await pool.query(
      `INSERT INTO venues (name, address, city, postcode, latitude, longitude, website_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING ${VENUE_SELECT_FIELDS}`,
      [name, address, city, postcode, latitude, longitude, website_url]
    );

    res.status(201).json({ message: 'Venue created successfully!', venue: result.rows[0] });

  } catch (error) {
    console.error('Error creating venue:', error);
    res.status(500).json({ message: 'Server error creating venue.' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT ${VENUE_SELECT_FIELDS} FROM venues WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Venue not found.' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching venue by ID:', error);
    res.status(500).json({ message: 'Server error fetching venue.' });
  }
});

router.get('/search', async (req: Request, res: Response) => {
    const { q, name, address, city, postcode } = req.query;

    let queryParts: string[] = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (q) {
        queryParts.push(`(name ILIKE $${paramIndex} OR address ILIKE $${paramIndex} OR city ILIKE $${paramIndex} OR postcode ILIKE $${paramIndex})`);
        queryParams.push(`%${q}%`);
        paramIndex++;
    }
    if (name) {
        queryParts.push(`name ILIKE $${paramIndex}`);
        queryParams.push(`%${name}%`);
        paramIndex++;
    }
    if (address) {
        queryParts.push(`address ILIKE $${paramIndex}`);
        queryParams.push(`%${address}%`);
        paramIndex++;
    }
    if (city) {
        queryParts.push(`city ILIKE $${paramIndex}`);
        queryParams.push(`%${city}%`);
        paramIndex++;
    }
    if (postcode) {
        queryParts.push(`postcode ILIKE $${paramIndex}`);
        queryParams.push(`%${postcode}%`);
        paramIndex++;
    }

    let queryString = `SELECT ${VENUE_SELECT_FIELDS} FROM venues`;
    if (queryParts.length > 0) {
        queryString += ` WHERE ${queryParts.join(' AND ')}`;
    }
    queryString += ` ORDER BY name ASC LIMIT 50`; 

    try {
        const result = await pool.query(queryString, queryParams);
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching venues:', error);
        res.status(500).json({ message: 'Server error searching venues.' });
    }
});


export default router;