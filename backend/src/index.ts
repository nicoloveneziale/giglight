
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Pool } from 'pg';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


const pool = new Pool({
  connectionString: process.env.DB_URI,
});


pool.connect((err, client, done) => {
  if (err) {
    console.error('Database connection error', err.stack);
    return;
  }
  console.log('Successfully connected to the database!');
  client.release();
});


app.use(cors()); 
app.use(express.json());


app.get('/', (req, res) => {
  res.send('GigLight Backend API is running!');
});


app.use('/api/auth', authRoutes); 

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});