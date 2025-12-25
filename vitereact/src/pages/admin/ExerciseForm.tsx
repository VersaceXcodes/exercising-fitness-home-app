import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Exercise } from '../../types';
import ExerciseFormComponent from '../../components/ExerciseForm';

const ExerciseForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [exercise, setExercise] = useState<Partial<Exercise> | undefined>(undefined);

  useEffect(() => {
    if (isEditing) {
      loadExercise();
    }
  }, [id]);

  const loadExercise = async () => {
    try {
      const data = await api.getExercise(id!);
      setExercise(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (formData: any) => {
    try {
      if (isEditing) {
        await api.updateExercise(id!, formData);
      } else {
        await api.createExercise(formData);
      }
      navigate('/admin/exercises');
    } catch (error) {
      console.error(error);
      alert('Failed to save exercise');
    }
  };

  return (
    <ExerciseFormComponent
      initialData={exercise}
      onSubmit={handleSubmit}
      onCancel={() => navigate('/admin/exercises')}
      isEditing={isEditing}
    />
  );
};

export default ExerciseForm;

