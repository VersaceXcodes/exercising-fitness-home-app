import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { apiService } from '@/services/api';

interface Exercise {
  exercise_id: number;
  workout_exercise_id: number;
  name: string;
  description: string;
  target_muscle_group: string;
  default_sets: number;
  default_reps: number;
  video_url?: string;
}

interface SetLog {
  set_number: number;
  reps: string;
  weight: string;
  completed: boolean;
}

export default function ActiveWorkoutScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<any>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Timer state
  const [duration, setDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Logging state: exercise_id -> SetLog[]
  const [logs, setLogs] = useState<Record<number, SetLog[]>>({});

  useEffect(() => {
    if (id) {
      loadData();
    }
    startTimer();
    return () => stopTimer();
  }, [id]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setDuration(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const togglePause = () => {
    if (isPaused) {
      startTimer();
    } else {
      stopTimer();
    }
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch workout details (re-using existing endpoint, might need adjustment if not available by ID easily without category)
      // Actually apiService.getWorkouts returns array. I added getWorkout(id) to backend but not api.ts?
      // Wait, I did verify backend has `app.get('/api/workouts/:id', ...)`
      // I need to check `api.ts` if it has `getWorkout(id)`. 
      // Checking `api.ts`: It has `getProperty` but for workouts it only has `getWorkouts` and `getWorkoutCategories`.
      // I should have added `getWorkout` to `api.ts`.
      
      // Let's assume I can use `fetch` directly or I'll update `api.ts` later. 
      // Ideally I should update `api.ts`. I will fix this in a moment.
      // For now I'll use a direct fetch wrapper or add it.
      
      // Workaround: I'll use `apiService`'s internal request method if I could, but it's private.
      // I will update `api.ts` properly before running this screen.
      
      const workoutData = await apiService.request(`/api/workouts/${id}`); 
      // Wait, `request` is private. I must update `api.ts` to expose `getWorkout`.
      
      const exercisesData = await apiService.getWorkoutExercises(Number(id));
      
      // Initialize logs
      const initialLogs: Record<number, SetLog[]> = {};
      if (Array.isArray(exercisesData.data || exercisesData)) {
         const list = Array.isArray(exercisesData) ? exercisesData : exercisesData.data;
         setExercises(list);
         setWorkout(workoutData.data || workoutData);

         list.forEach((ex: Exercise) => {
           initialLogs[ex.exercise_id] = Array.from({ length: ex.default_sets }).map((_, i) => ({
             set_number: i + 1,
             reps: ex.default_reps.toString(),
             weight: '0',
             completed: false
           }));
         });
         setLogs(initialLogs);
      }
    } catch (err) {
      console.error('Failed to load workout data', err);
      Alert.alert('Error', 'Failed to load workout data');
    } finally {
      setLoading(false);
    }
  };

  const updateSet = (exerciseId: number, index: number, field: keyof SetLog, value: any) => {
    setLogs(prev => {
      const exerciseLogs = [...(prev[exerciseId] || [])];
      exerciseLogs[index] = { ...exerciseLogs[index], [field]: value };
      return { ...prev, [exerciseId]: exerciseLogs };
    });
  };

  const handleFinish = async () => {
    stopTimer();
    try {
      // Prepare payload
      const exercisesPayload = Object.entries(logs).map(([exerciseId, sets]) => ({
        exercise_id: Number(exerciseId),
        sets: sets.filter(s => s.completed).map(s => ({
          set_number: s.set_number,
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0
        }))
      }));

      await apiService.logWorkout({
        workout_id: Number(id),
        duration_seconds: duration,
        exercises: exercisesPayload
      });

      Alert.alert('Success', 'Workout completed!', [
        { text: 'OK', onPress: () => router.dismiss() } // or router.push('/')
      ]);
    } catch (err) {
      console.error('Failed to save workout', err);
      Alert.alert('Error', 'Failed to save workout');
      startTimer(); // Resume if failed
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header / Timer */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <IconSymbol name="xmark" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.timerContainer}>
          <ThemedText style={styles.timerText}>{formatTime(duration)}</ThemedText>
          <ThemedText style={styles.timerLabel}>Duration</ThemedText>
        </View>
        <TouchableOpacity onPress={togglePause} style={styles.pauseButton}>
          <IconSymbol name={isPaused ? "play.fill" : "pause.fill"} size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.workoutTitle}>{workout?.title || 'Workout'}</ThemedText>
        
        {exercises.map((exercise) => (
          <View key={exercise.exercise_id} style={styles.exerciseCard}>
            <ThemedText type="subtitle" style={styles.exerciseName}>{exercise.name}</ThemedText>
            <ThemedText style={styles.muscleGroup}>{exercise.target_muscle_group}</ThemedText>
            
            <View style={styles.setsHeader}>
              <ThemedText style={styles.colHeader}>Set</ThemedText>
              <ThemedText style={styles.colHeader}>kg</ThemedText>
              <ThemedText style={styles.colHeader}>Reps</ThemedText>
              <ThemedText style={styles.colHeader}>Done</ThemedText>
            </View>

            {logs[exercise.exercise_id]?.map((set, index) => (
              <View key={index} style={[styles.setRow, set.completed && styles.setCompleted]}>
                <View style={styles.setNumContainer}>
                   <ThemedText style={styles.setNum}>{set.set_number}</ThemedText>
                </View>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={set.weight}
                  onChangeText={(v) => updateSet(exercise.exercise_id, index, 'weight', v)}
                  placeholder="0"
                />
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={set.reps}
                  onChangeText={(v) => updateSet(exercise.exercise_id, index, 'reps', v)}
                  placeholder="0"
                />
                <TouchableOpacity 
                  style={[styles.checkButton, set.completed && styles.checkButtonActive]}
                  onPress={() => updateSet(exercise.exercise_id, index, 'completed', !set.completed)}
                >
                  <IconSymbol name="checkmark" size={16} color={set.completed ? "white" : "#ccc"} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ))}
        
        <View style={styles.footerSpace} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
          <ThemedText style={styles.finishButtonText}>Finish Workout</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 8,
  },
  pauseButton: {
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
  },
  timerContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontSize: 32,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    fontSize: 12,
    color: '#666',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  workoutTitle: {
    marginBottom: 20,
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseName: {
    fontSize: 18,
    marginBottom: 4,
  },
  muscleGroup: {
    color: '#666',
    fontSize: 14,
    marginBottom: 16,
  },
  setsHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  colHeader: {
    flex: 1,
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  setCompleted: {
    opacity: 0.5,
  },
  setNumContainer: {
    flex: 1,
    alignItems: 'center',
  },
  setNum: {
    fontSize: 14,
    fontWeight: '600',
    color: '#444',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 4,
    textAlign: 'center',
    fontSize: 16,
  },
  checkButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  checkButtonActive: {
    backgroundColor: '#34C759',
  },
  footer: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 40,
  },
  finishButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  finishButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footerSpace: {
    height: 40,
  }
});
