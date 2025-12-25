import express from 'express';
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import pkg from 'pg';
const { Pool } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const { DATABASE_URL, PGHOST, PGDATABASE, PGUSER, PGPASSWORD, PGPORT = 5432 } = process.env;

const pool = new Pool(
  DATABASE_URL
    ? { 
        connectionString: DATABASE_URL, 
        ssl: { require: true } 
      }
    : {
        host: PGHOST,
        database: PGDATABASE,
        user: PGUSER,
        password: PGPASSWORD,
        port: Number(PGPORT),
        ssl: { require: true },
      }
);

// const client = await pool.connect();

const app = express();

// ESM workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const port = process.env.PORT || 3000;
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vite default port
  credentials: true,
}));
app.use(express.json());

// Auth middleware
const authenticate_token = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const result = await pool.query(
      'SELECT id, email, name, created_at FROM users WHERE id = $1', 
      [decoded.user_id]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    req.user = result.rows[0];
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

// Database initialization
const initialize_database = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    process.exit(1);
  }
};

// Routes

// Register endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Hash password
    const salt_rounds = 12;
    const hashed_password = await bcrypt.hash(password, salt_rounds);

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email.toLowerCase().trim(), hashed_password, name.trim()]
    );

    const user = result.rows[0];

    // Generate JWT
    const token = jwt.sign(
      { user_id: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const user = result.rows[0];

    // Check password
    const is_valid_password = await bcrypt.compare(password, user.password);
    if (!is_valid_password) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign(
      { user_id: user.id, email: user.email }, 
      JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        created_at: user.created_at
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', authenticate_token, (req, res) => {
  res.json({
    message: 'Token is valid',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      created_at: req.user.created_at
    }
  });
});

// Get current user endpoint
app.get('/api/auth/me', authenticate_token, (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      created_at: req.user.created_at
    }
  });
});

// Update user profile endpoint
app.put('/api/auth/profile', authenticate_token, async (req, res) => {
  try {
    const { name } = req.body;
    const user_id = req.user.id;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const result = await pool.query(
      'UPDATE users SET name = $1 WHERE id = $2 RETURNING id, email, name, created_at',
      [name.trim(), user_id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        name: result.rows[0].name,
        created_at: result.rows[0].created_at
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user stats endpoint
app.get('/api/user/stats', authenticate_token, async (req, res) => {
  try {
    const user_id = req.user.id;

    // Total workouts
    const totalWorkoutsResult = await pool.query(
      'SELECT COUNT(*) FROM workout_logs WHERE user_id = $1',
      [user_id]
    );
    const totalWorkouts = parseInt(totalWorkoutsResult.rows[0].count);

    // Total duration
    const totalDurationResult = await pool.query(
      'SELECT SUM(total_duration_seconds) FROM workout_logs WHERE user_id = $1',
      [user_id]
    );
    const totalDurationSeconds = parseInt(totalDurationResult.rows[0].sum) || 0;
    const totalDurationMinutes = Math.round(totalDurationSeconds / 60);

    // Workouts this week
    const workoutsThisWeekResult = await pool.query(
      "SELECT COUNT(*) FROM workout_logs WHERE user_id = $1 AND created_at >= date_trunc('week', CURRENT_DATE)",
      [user_id]
    );
    const workoutsThisWeek = parseInt(workoutsThisWeekResult.rows[0].count);

    res.json({
      totalWorkouts,
      totalDurationMinutes,
      workoutsThisWeek
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// WORKOUT ROUTES

// Get all workout categories
app.get('/api/workout-categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM workout_categories ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workout categories:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get workouts (optionally filter by category_id)
app.get('/api/workouts', async (req, res) => {
  try {
    const { category_id } = req.query;
    let query = 'SELECT * FROM workouts';
    const params = [];

    if (category_id) {
      query += ' WHERE category_id = $1';
      params.push(category_id);
    }
    
    query += ' ORDER BY title ASC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get single workout details
app.get('/api/workouts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM workouts WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Workout not found' });
    }


    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching workout details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get exercises for a specific workout
app.get('/api/workouts/:id/exercises', async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT we.id as workout_exercise_id, we.order_index, we.default_sets, we.default_reps, 
             e.id as exercise_id, e.name, e.description, e.target_muscle_group, e.video_url
      FROM workout_exercises we
      JOIN exercises e ON we.exercise_id = e.id
      WHERE we.workout_id = $1
      ORDER BY we.order_index ASC
    `;
    const result = await pool.query(query, [id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workout exercises:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a workout log
app.post('/api/workout-logs', async (req, res) => {
  try {
    const { workout_id, duration_seconds, exercises, user_id } = req.body;
    // exercises is an array of { exercise_id, sets: [{ set_number, reps, weight }] }
    
    if (!workout_id) {
       return res.status(400).json({ message: 'Workout ID is required' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create log
      const logQuery = `
        INSERT INTO workout_logs (user_id, workout_id, start_time, end_time, total_duration_seconds, status)
        VALUES ($1, $2, NOW() - interval '${duration_seconds || 0} seconds', NOW(), $3, 'completed')
        RETURNING id
      `;
      const logResult = await client.query(logQuery, [user_id || null, workout_id, duration_seconds || 0]);
      const logId = logResult.rows[0].id;

      // Create log entries
      if (exercises && Array.isArray(exercises)) {
        for (const ex of exercises) {
          if (ex.sets && Array.isArray(ex.sets)) {
            for (const set of ex.sets) {
              const entryQuery = `
                INSERT INTO workout_log_entries (workout_log_id, exercise_id, set_number, reps, weight_kg)
                VALUES ($1, $2, $3, $4, $5)
              `;
              await client.query(entryQuery, [logId, ex.exercise_id, set.set_number, set.reps, set.weight || 0]);
            }
          }
        }
      }

      await client.query('COMMIT');
      res.status(201).json({ message: 'Workout logged successfully', id: logId });
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error logging workout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Get workout logs for user
app.get('/api/workout-logs', authenticate_token, async (req, res) => {
  try {
    const user_id = req.user.id;
    const query = `
      SELECT wl.*, w.title as workout_title, w.image_url as workout_image_url
      FROM workout_logs wl
      JOIN workouts w ON wl.workout_id = w.id
      WHERE wl.user_id = $1
      ORDER BY wl.created_at DESC
    `;
    const result = await pool.query(query, [user_id]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Example protected endpoint
app.get('/api/protected', authenticate_token, (req, res) => {
  res.json({
    message: 'This is a protected endpoint',
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
    },
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({ message: "cofounder backend boilerplate :)" });
});

// Catch-all route for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

export { app, pool };

// Start the server only if run directly
if (process.argv[1] === __filename) {
  app.listen(3000, '0.0.0.0', () => {
    console.log(`Server running on port 3000 and listening on 0.0.0.0`);
  });
}
