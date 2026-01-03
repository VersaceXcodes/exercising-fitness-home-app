import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Category, Workout, Exercise } from '../../types';
import WorkoutFormComponent from '../../components/WorkoutForm';
import { WorkoutExercise } from '../../components/DraggableExerciseList';

const WorkoutForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [workout, setWorkout] = useState<Partial<Workout> | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Exercise state
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<WorkoutExercise[]>([]);

  useEffect(() => {
    loadCategories();
    loadExercises();
    if (isEditing) {
      loadWorkout();
      loadWorkoutExercises();
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

  const loadExercises = async () => {
    try {
      const data = await api.getExercises();
      setAvailableExercises(data);
    } catch (error) {
      console.error(error);
    }
  };

  const loadWorkoutExercises = async () => {
    try {
      const data = await api.getWorkoutExercises(id!);
      const mapped: WorkoutExercise[] = data.map((item: any) => ({
        id: item.exercise_id, 
        name: item.name,
        description: item.description,
        target_muscle_group: item.target_muscle_group,
        video_url: item.video_url,
        workout_exercise_id: item.workout_exercise_id,
        exercise_id: item.exercise_id,
        order_index: item.order_index,
        default_sets: item.default_sets,
        default_reps: item.default_reps,
        uniqueId: `we-${item.workout_exercise_id}`
      }));
      setSelectedExercises(mapped);
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

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: WorkoutExercise = {
      ...exercise,
      exercise_id: exercise.id,
      order_index: selectedExercises.length,
      default_sets: 3,
      default_reps: 10,
      uniqueId: `new-${exercise.id}-${Date.now()}`
    };
    setSelectedExercises([...selectedExercises, newExercise]);
  };

  const handleRemoveExercise = (uniqueId: string) => {
    setSelectedExercises(selectedExercises.filter(ex => ex.uniqueId !== uniqueId));
  };

  const handleUpdateExercise = (uniqueId: string, field: 'default_sets' | 'default_reps', value: number) => {
    setSelectedExercises(selectedExercises.map(ex => 
      ex.uniqueId === uniqueId ? { ...ex, [field]: value } : ex
    ));
  };

  const handleReorderExercises = (exercises: WorkoutExercise[]) => {
    const reordered = exercises.map((ex, index) => ({
      ...ex,
      order_index: index
    }));
    setSelectedExercises(reordered);
  };

  const handleSubmit = async (formData: any) => {
    try {
      // Validation
      if (selectedExercises.length === 0) {
        alert('Please add at least one exercise to the workout before saving.');
        return;
      }

      const data = {
        ...formData,
        category_id: parseInt(formData.category_id),
        duration_minutes: parseInt(formData.duration_minutes),
      };

      let workoutId = id;

      if (isEditing) {
        await api.updateWorkout(id!, data);
      } else {
        const newWorkout = await api.createWorkout(data);
        workoutId = newWorkout.id.toString();
      }

      // Save exercises
      const exercisesPayload = selectedExercises.map((ex, index) => ({
        exercise_id: ex.exercise_id, // Use the exercise_id explicitly
        order_index: index,
        default_sets: ex.default_sets,
        default_reps: ex.default_reps
      }));

      await api.updateWorkoutExercises(workoutId!, exercisesPayload);

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
      selectedExercises={selectedExercises}
      availableExercises={availableExercises}
      onAddExercise={handleAddExercise}
      onRemoveExercise={handleRemoveExercise}
      onUpdateExercise={handleUpdateExercise}
      onReorderExercises={handleReorderExercises}
    />
  );
};

export default WorkoutForm;
