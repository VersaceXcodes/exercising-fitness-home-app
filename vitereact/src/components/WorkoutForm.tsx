import React, { useState, useEffect } from 'react';
import { Workout, Category, Exercise } from '../types';
import DraggableExerciseList, { WorkoutExercise } from './DraggableExerciseList';
import ExercisePicker from './ExercisePicker';

interface WorkoutFormProps {
  initialData?: Partial<Workout>;
  categories: Category[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isEditing: boolean;
  
  // Exercise management props
  selectedExercises: WorkoutExercise[];
  availableExercises: Exercise[];
  onAddExercise: (exercise: Exercise) => void;
  onRemoveExercise: (id: string) => void;
  onUpdateExercise: (id: string, field: 'default_sets' | 'default_reps', value: number) => void;
  onReorderExercises: (exercises: WorkoutExercise[]) => void;
}

const WorkoutForm: React.FC<WorkoutFormProps> = ({ 
  initialData, 
  categories, 
  onSubmit, 
  onCancel, 
  isEditing,
  selectedExercises,
  availableExercises,
  onAddExercise,
  onRemoveExercise,
  onUpdateExercise,
  onReorderExercises
}) => {
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    description: '',
    duration_minutes: '',
    difficulty_level: 'Beginner',
    image_url: '',
  });

  const [isExercisePickerOpen, setIsExercisePickerOpen] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        category_id: initialData.category_id?.toString() || '',
        description: initialData.description || '',
        duration_minutes: initialData.duration_minutes?.toString() || '',
        difficulty_level: initialData.difficulty_level || 'Beginner',
        image_url: initialData.image_url || '',
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div>
      <h2>{isEditing ? 'Edit Workout' : 'New Workout'}</h2>
      <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Duration (minutes)</label>
              <input
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Difficulty Level</label>
              <select
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Image URL</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>
          </div>

          <div>
            <div style={{ marginBottom: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Exercises</label>
              <button 
                type="button" 
                onClick={() => setIsExercisePickerOpen(true)}
                style={{ 
                  padding: '6px 12px', 
                  background: '#10b981', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                + Add Exercise
              </button>
            </div>
            
            <div style={{ background: '#f9f9f9', padding: '10px', borderRadius: '8px', minHeight: '300px' }}>
              <DraggableExerciseList 
                items={selectedExercises}
                onReorder={onReorderExercises}
                onRemove={onRemoveExercise}
                onUpdate={onUpdateExercise}
              />
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <button type="submit" style={{ padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '10px' }}>
            Save Workout
          </button>
          <button type="button" onClick={onCancel} style={{ padding: '10px 20px', background: '#f4f4f5', color: '#333', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </form>

      <ExercisePicker 
        exercises={availableExercises}
        isOpen={isExercisePickerOpen}
        onClose={() => setIsExercisePickerOpen(false)}
        onSelect={onAddExercise}
      />
    </div>
  );
};

export default WorkoutForm;
