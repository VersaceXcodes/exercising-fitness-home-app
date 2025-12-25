import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Exercise } from '../../types';

const Exercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const data = await api.getExercises();
      setExercises(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this exercise?')) {
      try {
        await api.deleteExercise(id);
        loadExercises();
      } catch (error) {
        console.error(error);
        alert('Failed to delete exercise');
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Exercises</h1>
        <Link to="/admin/exercises/new" style={{ padding: '10px 20px', background: '#22c55e', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
          Add New Exercise
        </Link>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f4f4f5', textAlign: 'left' }}>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Target Muscle</th>
            <th style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exercises.map((exercise) => (
            <tr key={exercise.id}>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{exercise.id}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{exercise.name}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>{exercise.target_muscle_group}</td>
              <td style={{ padding: '10px', borderBottom: '1px solid #ddd' }}>
                <Link to={`/admin/exercises/${exercise.id}`} style={{ marginRight: '10px', color: '#3b82f6' }}>Edit</Link>
                <button onClick={() => handleDelete(exercise.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Exercises;
