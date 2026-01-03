import React, { useState } from 'react';
import { Exercise } from '../types';

interface ExercisePickerProps {
  exercises: Exercise[];
  isOpen: boolean;
  onClose: () => void;
  onSelect: (exercise: Exercise) => void;
}

const ExercisePicker: React.FC<ExercisePickerProps> = ({ exercises, isOpen, onClose, onSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredExercises = exercises.filter(ex => 
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (ex.target_muscle_group && ex.target_muscle_group.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
          <h3 style={{ margin: 0 }}>Select Exercise</h3>
          <button onClick={onClose} style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>&times;</button>
        </div>
        
        <input
          type="text"
          placeholder="Search exercises..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' }}
        />

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {filteredExercises.map(ex => (
            <div 
              key={ex.id}
              onClick={() => {
                onSelect(ex);
                onClose();
              }}
              style={{
                padding: '10px',
                borderBottom: '1px solid #eee',
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9f9f9'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>{ex.name}</div>
                <div style={{ fontSize: '0.8rem', color: '#666' }}>{ex.target_muscle_group}</div>
              </div>
              <button style={{ 
                padding: '4px 8px', 
                backgroundColor: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer' 
              }}>
                Add
              </button>
            </div>
          ))}
          {filteredExercises.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No exercises found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExercisePicker;
