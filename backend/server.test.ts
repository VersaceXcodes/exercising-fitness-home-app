import request from 'supertest';
import { app, pool } from './server.ts';
import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';

describe('User Stats API', () => {
  let token: string;
  let userId: number;

  beforeAll(async () => {
    // Register a unique user
    const email = `teststats${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email,
        password: 'password123',
        name: 'Stats Tester'
      });
    
    token = res.body.token;
    userId = res.body.user.id;
  });

  afterAll(async () => {
     await pool.end();
  });

  it('should return 0 stats for new user', async () => {
    const res = await request(app)
      .get('/api/user/stats')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      totalWorkouts: 0,
      totalDurationMinutes: 0,
      workoutsThisWeek: 0
    });
  });

  it('should return correct stats after logging a workout', async () => {
    // Get a workout ID
    const workoutsRes = await request(app).get('/api/workouts');
    // Assuming there is at least one workout seeded
    if (workoutsRes.body.length === 0) {
       console.warn("No workouts found to test with");
       return;
    }
    const workoutId = workoutsRes.body[0].id;

    // Log a workout (60 minutes)
    await request(app)
      .post('/api/workout-logs')
      .send({
        user_id: userId,
        workout_id: workoutId,
        duration_seconds: 3600, // 60 minutes
        exercises: []
      });

    const res = await request(app)
      .get('/api/user/stats')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.status).toBe(200);
    expect(res.body.totalWorkouts).toBe(1);
    expect(res.body.totalDurationMinutes).toBe(60);
    expect(res.body.workoutsThisWeek).toBe(1);
  });
});
