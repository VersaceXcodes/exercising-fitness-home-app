import React from 'react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Exercise } from '../types';

// We need an extended interface for the workout exercises
export interface WorkoutExercise extends Exercise {
  workout_exercise_id?: number; // Optional as it might be new
  exercise_id: number;
  order_index: number;
  default_sets: number;
  default_reps: number;
  // unique id for dnd-kit (using a temporary id if no real id yet)
  uniqueId: string; 
}

interface SortableItemProps {
  id: string;
  exercise: WorkoutExercise;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'default_sets' | 'default_reps', value: number) => void;
}

const SortableItem = ({ id, exercise, onRemove, onUpdate }: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: '10px',
    marginBottom: '8px',
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', paddingRight: '10px', color: '#999', display: 'flex', alignItems: 'center' }}>
        <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
            <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
        </svg>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 'bold' }}>{exercise.name}</div>
        <div style={{ fontSize: '0.8rem', color: '#666' }}>{exercise.target_muscle_group}</div>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '0.8rem', display: 'block', color: '#666' }}>Sets</label>
          <input 
            type="number" 
            value={exercise.default_sets}
            onChange={(e) => onUpdate(id, 'default_sets', parseInt(e.target.value) || 0)}
            style={{ width: '50px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <div>
          <label style={{ fontSize: '0.8rem', display: 'block', color: '#666' }}>Reps</label>
          <input 
            type="number" 
            value={exercise.default_reps}
            onChange={(e) => onUpdate(id, 'default_reps', parseInt(e.target.value) || 0)}
            style={{ width: '50px', padding: '4px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
        </div>
        <button 
          type="button"
          onClick={() => onRemove(id)}
          style={{ 
            color: '#ef4444', 
            background: 'none', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '1.2rem',
            marginLeft: '10px',
            padding: '4px'
          }}
          title="Remove exercise"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

interface DraggableExerciseListProps {
  items: WorkoutExercise[];
  onReorder: (items: WorkoutExercise[]) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: 'default_sets' | 'default_reps', value: number) => void;
}

const DraggableExerciseList: React.FC<DraggableExerciseListProps> = ({ items, onReorder, onRemove, onUpdate }) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.uniqueId === active.id);
      const newIndex = items.findIndex((item) => item.uniqueId === over.id);
      
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  };

  if (items.length === 0) {
    return (
      <div style={{ 
        padding: '20px', 
        border: '2px dashed #e5e7eb', 
        borderRadius: '8px', 
        textAlign: 'center', 
        color: '#6b7280',
        marginBottom: '20px' 
      }}>
        No exercises added yet. Click "Add Exercise" to select exercises for this workout.
      </div>
    );
  }

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter} 
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(item => item.uniqueId)}
        strategy={verticalListSortingStrategy}
      >
        <div style={{ marginTop: '10px', marginBottom: '20px' }}>
          {items.map((item) => (
            <SortableItem 
              key={item.uniqueId} 
              id={item.uniqueId} 
              exercise={item} 
              onRemove={onRemove}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableExerciseList;
