-- COMMANDS FOR DB TABLES
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workout_categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  category_id INTEGER REFERENCES workout_categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  difficulty_level VARCHAR(50), -- e.g., 'Beginner', 'Intermediate', 'Advanced'
  image_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- COMMANDS FOR DB SEED
-- Add any initial data here if needed
INSERT INTO workout_categories (name, description, image_url) VALUES
('Strength', 'Build muscle and increase strength with these workouts.', 'https://placehold.co/600x400/png?text=Strength'),
('Cardio', 'Improve your cardiovascular health and burn calories.', 'https://placehold.co/600x400/png?text=Cardio'),
('Yoga', 'Enhance flexibility, balance, and mental focus.', 'https://placehold.co/600x400/png?text=Yoga'),
('HIIT', 'High-Intensity Interval Training for maximum fat burn.', 'https://placehold.co/600x400/png?text=HIIT')
ON CONFLICT DO NOTHING;

INSERT INTO workouts (category_id, title, description, duration_minutes, difficulty_level, image_url) VALUES
(1, 'Full Body Strength', 'A complete full body workout using bodyweight exercises.', 45, 'Intermediate', 'https://placehold.co/600x400/png?text=Full+Body'),
(1, 'Upper Body Power', 'Focus on chest, back, and arms.', 30, 'Beginner', 'https://placehold.co/600x400/png?text=Upper+Body'),
(2, 'Morning Cardio Blast', 'Start your day with energy.', 20, 'Beginner', 'https://placehold.co/600x400/png?text=Morning+Cardio'),
(2, 'Endurance Run', 'Indoor running drills.', 40, 'Advanced', 'https://placehold.co/600x400/png?text=Endurance'),
(3, 'Sunrise Yoga', 'Gentle flow to wake up the body.', 25, 'All Levels', 'https://placehold.co/600x400/png?text=Sunrise+Yoga'),
(3, 'Power Yoga', 'Strength-building yoga sequence.', 45, 'Intermediate', 'https://placehold.co/600x400/png?text=Power+Yoga'),
(4, 'Tabata Burn', '20 seconds on, 10 seconds off.', 15, 'Advanced', 'https://placehold.co/600x400/png?text=Tabata')
ON CONFLICT DO NOTHING;
