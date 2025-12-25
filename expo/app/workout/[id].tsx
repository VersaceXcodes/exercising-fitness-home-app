import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
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
  const timerRef = useRef<any>(null);

  // Rest Timer state
  const [isResting, setIsResting] = useState(false);
  const [restTimeLeft, setRestTimeLeft] = useState(60);
  const restTimerRef = useRef<any>(null);
  const DEFAULT_REST_TIME = 60;

  // Logging state: exercise_id -> SetLog[]
  const [logs, setLogs] = useState<Record<number, SetLog[]>>({});

  const [showSummary, setShowSummary] = useState(false);
  const [stats, setStats] = useState({ duration: 0, totalVolume: 0, setsCompleted: 0, totalSets: 0 });

  useEffect(() => {
    if (id) {
      loadData();
    }
    startTimer();
    return () => {
      stopTimer();
      stopRest();
    };
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
      const workoutData = await apiService.getWorkout(id as string);
      const exercisesData = await apiService.getWorkoutExercises(Number(id)) as any;
      
      const list: Exercise[] = Array.isArray(exercisesData) ? exercisesData : exercisesData.data || [];
      // Handle response structure if wrapped in data
      const workoutDetails = workoutData.data || workoutData;

      setExercises(list);
      setWorkout(workoutDetails);

      // Initialize logs
      const initialLogs: Record<number, SetLog[]> = {};
      list.forEach((ex: Exercise) => {
        initialLogs[ex.exercise_id] = Array.from({ length: ex.default_sets }).map((_, i) => ({
          set_number: i + 1,
          reps: ex.default_reps.toString(),
          weight: '0',
          completed: false
        }));
      });
      setLogs(initialLogs);
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
      
      // Trigger rest timer logic
      if (field === 'completed') {
        if (value === true && !exerciseLogs[index].completed) {
          startRest();
        } else if (value === false && exerciseLogs[index].completed && isResting) {
          stopRest();
        }
      }

      exerciseLogs[index] = { ...exerciseLogs[index], [field]: value };
      return { ...prev, [exerciseId]: exerciseLogs };
    });
  };

  const startRest = () => {
    setIsResting(true);
    setRestTimeLeft(DEFAULT_REST_TIME);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
    restTimerRef.current = setInterval(() => {
      setRestTimeLeft((prev) => {
        if (prev <= 1) {
          stopRest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopRest = () => {
    setIsResting(false);
    if (restTimerRef.current) clearInterval(restTimerRef.current);
  };

  const calculateProgress = () => {
    let totalSets = 0;
    let completedSets = 0;
    Object.values(logs).forEach(sets => {
      sets.forEach(set => {
        totalSets++;
        if (set.completed) completedSets++;
      });
    });
    return totalSets === 0 ? 0 : completedSets / totalSets;
  };

  const handleFinish = async () => {
    stopTimer();
    stopRest();
    
    // Calculate stats
    let totalVolume = 0;
    let completedSets = 0;
    let totalSets = 0;
    
    const exercisesPayload = Object.entries(logs).map(([exerciseId, sets]) => {
      const completed = sets.filter(s => s.completed);
      completed.forEach(s => {
        const weight = parseFloat(s.weight) || 0;
        const reps = parseInt(s.reps) || 0;
        totalVolume += weight * reps;
      });
      completedSets += completed.length;
      totalSets += sets.length;
      
      return {
        exercise_id: Number(exerciseId),
        sets: completed.map(s => ({
          set_number: s.set_number,
          reps: parseInt(s.reps) || 0,
          weight: parseFloat(s.weight) || 0
        }))
      };
    });

    setStats({
      duration,
      totalVolume,
      setsCompleted: completedSets,
      totalSets
    });
    
    setShowSummary(true);

    try {
      await apiService.logWorkout({
        workout_id: Number(id),
        duration_seconds: duration,
        exercises: exercisesPayload
      });
    } catch (err) {
      console.error('Failed to save workout', err);
      Alert.alert('Error', 'Failed to save workout log, but your session is finished.');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  if (showSummary) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.summaryHeader}>
          <ThemedText type="title">Workout Complete!</ThemedText>
          <ThemedText style={styles.summarySubtext}>Great job!</ThemedText>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{formatTime(stats.duration)}</ThemedText>
            <ThemedText style={styles.statLabel}>Duration</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.totalVolume.toLocaleString()} kg</ThemedText>
            <ThemedText style={styles.statLabel}>Total Volume</ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText style={styles.statValue}>{stats.setsCompleted} / {stats.totalSets}</ThemedText>
            <ThemedText style={styles.statLabel}>Sets</ThemedText>
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.finishButton} onPress={() => router.dismiss()}>
            <ThemedText style={styles.finishButtonText}>Close</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  const progress = calculateProgress();

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

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView style={styles.scrollView}>
        <ThemedText type="title" style={styles.workoutTitle}>{workout?.title || 'Workout'}</ThemedText>
        
        {exercises.map((exercise) => (
          <View key={exercise.exercise_id} style={styles.exerciseCard}>
            <ThemedText type="subtitle" style={styles.exerciseName}>{exercise.name}</ThemedText>
            <ThemedText style={styles.muscleGroup}>{exercise.target_muscle_group}</ThemedText>
            
            {exercise.video_url && (
              <View style={styles.videoContainer}>
                <Video
                  style={styles.video}
                  source={{
                    uri: exercise.video_url,
                  }}
                  useNativeControls
                  resizeMode={ResizeMode.CONTAIN}
                  isLooping
                />
              </View>
            )}

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

      {/* Rest Timer Overlay */}
      {isResting && (
        <View style={styles.restOverlay}>
          <View style={styles.restContent}>
            <ThemedText style={styles.restTitle}>Resting</ThemedText>
            <ThemedText style={styles.restTimer}>{formatTime(restTimeLeft)}</ThemedText>
            
            <View style={styles.restControls}>
              <TouchableOpacity onPress={() => setRestTimeLeft(t => Math.max(0, t - 10))} style={styles.adjustButton}>
                <ThemedText style={styles.adjustButtonText}>-10s</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setRestTimeLeft(t => t + 10)} style={styles.adjustButton}>
                <ThemedText style={styles.adjustButtonText}>+10s</ThemedText>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.skipButton} onPress={stopRest}>
              <ThemedText style={styles.skipButtonText}>Skip Rest</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  videoContainer: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    backgroundColor: '#000',
    borderRadius: 8,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: '100%',
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
  },
  // New Styles
  summaryHeader: {
    paddingTop: 80,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 40,
  },
  summarySubtext: {
    fontSize: 18,
    color: '#666',
    marginTop: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#f0f0f0',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34C759',
  },
  restOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    paddingBottom: 40,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    zIndex: 100,
  },
  restContent: {
    width: '100%',
    alignItems: 'center',
  },
  restTitle: {
    color: 'white',
    fontSize: 16,
    marginBottom: 8,
  },
  restTimer: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
    marginBottom: 20,
  },
  restControls: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 20,
  },
  adjustButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  adjustButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  skipButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
