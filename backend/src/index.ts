
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { Pool } from 'pg';
import authRoutes from './routes/auth';
import bandRoutes from "./routes/bands"
import uploadRoutes from "./routes/upload"

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;


const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
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
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes); 
app.use('/api/bands', bandRoutes);
app.use('api/upload', uploadRoutes)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});