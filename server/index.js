const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

// Create Express App
const app = express();
const PORT = process.env.PORT || 5000;

// CORS for everything
app.use(cors());
app.use(express.json()); 

//PostgreSQL connection
const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  port: process.env.PGPORT || 5432,
});

// Road for get docs
app.get('/api/documents', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, title, url FROM documents');
    res.json(result.rows);
  } catch (err) {
    console.error('Error wit db connection:', err);
    res.status(500).send('Server error');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
