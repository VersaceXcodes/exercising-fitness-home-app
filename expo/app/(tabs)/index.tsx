import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator, ImageBackground } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
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

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredWorkout, setFeaturedWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    loadHomeData();
    updateDate();
  }, []);

  const updateDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));
  };

  const loadHomeData = async () => {
    try {
      setLoading(true);
      // Load categories
      const categoriesResponse = await apiService.getWorkoutCategories();
      const categoriesData = Array.isArray(categoriesResponse) 
        ? categoriesResponse 
        : categoriesResponse.data || [];
      setCategories(categoriesData.slice(0, 4)); // Get first 4 categories

      // Load a featured workout from the first category
      if (categoriesData.length > 0) {
        const workoutsResponse = await apiService.getWorkouts(categoriesData[0].id);
        const workoutsData = Array.isArray(workoutsResponse) 
          ? workoutsResponse 
          : workoutsResponse.data || [];
        if (workoutsData.length > 0) {
          setFeaturedWorkout(workoutsData[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
        <ThemedText>Loading...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <ThemedText style={styles.dateText}>{currentDate}</ThemedText>
          <ThemedText type="title" style={styles.welcomeTitle}>
            Ready to Workout?
          </ThemedText>
        </View>
        <TouchableOpacity style={styles.profileButton}>
          <IconSymbol name="person.circle.fill" size={40} color="#FF5722" />
        </TouchableOpacity>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <IconSymbol name="flame.fill" size={24} color="#FF5722" />
          <ThemedText style={styles.statNumber}>0</ThemedText>
          <ThemedText style={styles.statLabel}>Workouts</ThemedText>
        </View>
        <View style={styles.statCard}>
          <IconSymbol name="clock.fill" size={24} color="#4CAF50" />
          <ThemedText style={styles.statNumber}>0</ThemedText>
          <ThemedText style={styles.statLabel}>Minutes</ThemedText>
        </View>
        <View style={styles.statCard}>
          <IconSymbol name="bolt.fill" size={24} color="#FFC107" />
          <ThemedText style={styles.statNumber}>0</ThemedText>
          <ThemedText style={styles.statLabel}>Streak</ThemedText>
        </View>
      </View>

      {/* Featured Workout */}
      {featuredWorkout && (
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Today's Recommended
          </ThemedText>
          <TouchableOpacity 
            style={styles.featuredCard}
            onPress={() => router.push('/explore')}
          >
            <ImageBackground
              source={{ uri: featuredWorkout.image_url }}
              style={styles.featuredImage}
              imageStyle={{ borderRadius: 16 }}
            >
              <View style={styles.featuredOverlay}>
                <ThemedText style={styles.featuredTitle}>{featuredWorkout.title}</ThemedText>
                <View style={styles.featuredMeta}>
                  <View style={styles.featuredMetaItem}>
                    <IconSymbol name="clock" size={16} color="#fff" />
                    <ThemedText style={styles.featuredMetaText}>
                      {featuredWorkout.duration_minutes} min
                    </ThemedText>
                  </View>
                  <View style={styles.featuredMetaItem}>
                    <IconSymbol name="flame" size={16} color="#fff" />
                    <ThemedText style={styles.featuredMetaText}>
                      {featuredWorkout.difficulty_level}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity style={styles.startButton}>
                  <ThemedText style={styles.startButtonText}>Start Now</ThemedText>
                  <IconSymbol name="play.fill" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Access Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Browse by Category
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/explore')}>
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => router.push('/explore')}
            >
              <ImageBackground
                source={{ uri: category.image_url }}
                style={styles.categoryImage}
                imageStyle={{ borderRadius: 12 }}
              >
                <View style={styles.categoryOverlay}>
                  <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Motivational Section */}
      <View style={[styles.section, styles.motivationSection]}>
        <IconSymbol name="star.fill" size={32} color="#FFC107" />
        <ThemedText type="subtitle" style={styles.motivationTitle}>
          Start Your Fitness Journey Today
        </ThemedText>
        <ThemedText style={styles.motivationText}>
          Every workout brings you closer to your goals. Let's make it happen!
        </ThemedText>
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => router.push('/explore')}
        >
          <ThemedText style={styles.exploreButtonText}>Explore All Workouts</ThemedText>
          <IconSymbol name="arrow.right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  dateText: {
    fontSize: 14,
    opacity: 0.6,
    marginBottom: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  profileButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAllText: {
    color: '#FF5722',
    fontSize: 14,
    fontWeight: '600',
  },
  featuredCard: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featuredImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featuredMetaText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5722',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 12,
  },
  categoryName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  motivationSection: {
    backgroundColor: '#FFF3E0',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  motivationTitle: {
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  motivationText: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 20,
  },
  exploreButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5722',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
    gap: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
