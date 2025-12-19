import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, View, ImageBackground } from 'react-native';
import { Image } from 'expo-image';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { apiService } from '@/services/api';

interface Category {
  id: number;
  name: string;
  description: string;
  image_url: string;
}

interface Workout {
  id: number;
  category_id: number;
  title: string;
  description: string;
  duration_minutes: number;
  difficulty_level: string;
  image_url: string;
}

export default function WorkoutsScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load Categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load Workouts when category is selected
  useEffect(() => {
    if (selectedCategory) {
      loadWorkouts(selectedCategory.id);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getWorkoutCategories();
      // Use type assertion or validation here if needed, assuming response is array
      if (Array.isArray(response)) {
        setCategories(response);
      } else if (response.data && Array.isArray(response.data)) {
         setCategories(response.data);
      } else {
        // Fallback or error if structure doesn't match
        setCategories((response as any) || []);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  const loadWorkouts = async (categoryId: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getWorkouts(categoryId);
      if (Array.isArray(response)) {
        setWorkouts(response);
      } else if (response.data && Array.isArray(response.data)) {
        setWorkouts(response.data);
      } else {
         setWorkouts((response as any) || []);
      }
    } catch (err) {
      console.error('Failed to load workouts:', err);
      setError('Failed to load workouts.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (selectedWorkout) {
      setSelectedWorkout(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
      setWorkouts([]);
    }
  };

  if (loading && !categories.length && !selectedCategory) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  // Header Image handling
  const getHeaderImage = () => {
    if (selectedWorkout) return { uri: selectedWorkout.image_url };
    if (selectedCategory) return { uri: selectedCategory.image_url };
    return null; // Default handled in ParallaxScrollView or custom
  };

  // RENDER: Workout Details
  if (selectedWorkout) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={{ uri: selectedWorkout.image_url }}
            style={styles.headerImageFull}
            contentFit="cover"
          />
        }>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="arrow.left" size={24} color="#007AFF" />
          <ThemedText style={styles.backButtonText}>Back to Workouts</ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.contentContainer}>
          <ThemedText type="title">{selectedWorkout.title}</ThemedText>
          
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <IconSymbol name="clock" size={20} color="#666" />
              <ThemedText style={styles.metaText}>{selectedWorkout.duration_minutes} min</ThemedText>
            </View>
            <View style={styles.metaItem}>
              <IconSymbol name="flame" size={20} color="#FF5722" />
              <ThemedText style={styles.metaText}>{selectedWorkout.difficulty_level}</ThemedText>
            </View>
          </View>

          <ThemedText style={styles.description}>{selectedWorkout.description}</ThemedText>

          <TouchableOpacity style={styles.startWorkoutButton}>
            <ThemedText style={styles.startWorkoutText}>Start Workout</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ParallaxScrollView>
    );
  }

  // RENDER: Workouts List (Category Selected)
  if (selectedCategory) {
    return (
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
        headerImage={
          <Image
            source={{ uri: selectedCategory.image_url }}
            style={styles.headerImageFull}
            contentFit="cover"
          />
        }>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <IconSymbol name="arrow.left" size={24} color="#007AFF" />
          <ThemedText style={styles.backButtonText}>All Categories</ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">{selectedCategory.name}</ThemedText>
          <ThemedText style={styles.subtitle}>{selectedCategory.description}</ThemedText>
        </ThemedView>

        {loading ? (
           <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
        ) : (
          <ThemedView style={styles.listContainer}>
            {workouts.map((workout) => (
              <TouchableOpacity 
                key={workout.id} 
                style={styles.card}
                onPress={() => setSelectedWorkout(workout)}
              >
                <Image source={{ uri: workout.image_url }} style={styles.cardImage} />
                <View style={styles.cardContent}>
                  <ThemedText type="defaultSemiBold">{workout.title}</ThemedText>
                  <View style={styles.cardMeta}>
                     <ThemedText style={styles.cardMetaText}>{workout.duration_minutes} min • {workout.difficulty_level}</ThemedText>
                  </View>
                </View>
                <IconSymbol name="chevron.right" size={24} color="#C7C7CC" />
              </TouchableOpacity>
            ))}
            {workouts.length === 0 && (
              <ThemedText style={styles.emptyText}>No workouts found in this category.</ThemedText>
            )}
          </ThemedView>
        )}
      </ParallaxScrollView>
    );
  }

  // RENDER: Categories List
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="figure.run"
          style={styles.headerIcon}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">Workout Library</ThemedText>
        <ThemedText style={styles.subtitle}>Choose a category to start training</ThemedText>
      </ThemedView>

      <ThemedView style={styles.gridContainer}>
        {categories.map((category) => (
          <TouchableOpacity 
            key={category.id} 
            style={styles.categoryCard}
            onPress={() => setSelectedCategory(category)}
          >
            <ImageBackground 
              source={{ uri: category.image_url }} 
              style={styles.categoryBackground}
              imageStyle={{ borderRadius: 12 }}
            >
              <View style={styles.categoryOverlay}>
                <ThemedText type="title" style={styles.categoryTitle}>{category.name}</ThemedText>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  headerImageFull: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  contentContainer: {
    padding: 0,
  },
  gridContainer: {
    gap: 16,
  },
  listContainer: {
    gap: 12,
  },
  categoryCard: {
    height: 160,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryBackground: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryOverlay: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  categoryTitle: {
    color: 'white',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff', // Should use themed background in real app
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardMeta: {
    marginTop: 4,
  },
  cardMetaText: {
    fontSize: 14,
    color: '#666',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '600',
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 24,
    marginVertical: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    fontSize: 16,
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#444',
    marginBottom: 24,
  },
  startWorkoutButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startWorkoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  }
});
