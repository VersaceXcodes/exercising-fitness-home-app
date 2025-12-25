import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Category, Workout } from '../../types';
import WorkoutFormComponent from '../../components/WorkoutForm';

const WorkoutForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [workout, setWorkout] = useState<Partial<Workout> | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
    if (isEditing) {
      loadWorkout();
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadWorkout = async () => {
    try {
      const data = await api.getWorkout(id!);
      setWorkout(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      const data = {
        ...formData,
        category_id: parseInt(formData.category_id),
        duration_minutes: parseInt(formData.duration_minutes),
      };

      if (isEditing) {
        await api.updateWorkout(id!, data);
      } else {
        await api.createWorkout(data);
      }
      navigate('/admin/workouts');
    } catch (error) {
      console.error(error);
      alert('Failed to save workout');
    }
  };

  return (
    <WorkoutFormComponent
      initialData={workout}
      categories={categories}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/admin/workouts')}
      isEditing={isEditing}
    />
  );
};

export default WorkoutForm;
