import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Workout } from '../../types';

const Workouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    try {
      const data = await api.getWorkouts();
      setWorkouts(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await api.deleteWorkout(id);
        loadWorkouts();
      } catch (error) {
        console.error(error);
        alert('Failed to delete workout');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Workouts</h1>
        <Link to="/admin/workouts/new" style={{ padding: '10px 20px', background: '#22c55e', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Add New Workout
        </Link>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f5', textAlign: 'left' }}>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Title</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Category ID</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Duration (min)</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Level</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workouts.map((workout) => (
            <tr key={workout.id}>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{workout.id}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{workout.title}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{workout.category_id}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{workout.duration_minutes}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{workout.difficulty_level}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                <Link to={`/admin/workouts/${workout.id}`} style={{ marginRight: '10px', color: '#3b82f6' }}>Edit</Link>
                <button onClick={() => handleDelete(workout.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Workouts;
