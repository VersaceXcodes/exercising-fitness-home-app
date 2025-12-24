import React, { useState, useEffect } from 'react';
import { Image, StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator, ImageBackground, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

// Motivational fitness quotes
const FITNESS_QUOTES = [
  { quote: "The only bad workout is the one that didn't happen.", author: "Anonymous" },
  { quote: "Your body can stand almost anything. It's your mind you have to convince.", author: "Anonymous" },
  { quote: "The pain you feel today will be the strength you feel tomorrow.", author: "Anonymous" },
  { quote: "Don't wish for it, work for it.", author: "Anonymous" },
  { quote: "Success starts with self-discipline.", author: "Anonymous" },
  { quote: "The difference between try and triumph is a little umph.", author: "Anonymous" },
  { quote: "Fitness is not about being better than someone else. It's about being better than you used to be.", author: "Khloe Kardashian" },
  { quote: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
  { quote: "The only person you are destined to become is the person you decide to be.", author: "Ralph Waldo Emerson" },
  { quote: "Push yourself because no one else is going to do it for you.", author: "Anonymous" },
  { quote: "Great things never come from comfort zones.", author: "Anonymous" },
  { quote: "Dream bigger. Do bigger.", author: "Anonymous" },
  { quote: "A one hour workout is only 4% of your day.", author: "Anonymous" },
  { quote: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { quote: "The body achieves what the mind believes.", author: "Anonymous" },
];

export default function HomeScreen() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredWorkout, setFeaturedWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState('');
  const [dailyQuote, setDailyQuote] = useState({ quote: '', author: '' });

  useEffect(() => {
    loadHomeData();
    updateDate();
    updateDailyQuote();
  }, []);

  const updateDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
    setCurrentDate(date.toLocaleDateString('en-US', options));
  };

  const updateDailyQuote = () => {
    // Get quote based on day of year to ensure same quote throughout the day
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const quoteIndex = dayOfYear % FITNESS_QUOTES.length;
    setDailyQuote(FITNESS_QUOTES[quoteIndex]);
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
      {/* Header Section with Gradient */}
      <LinearGradient
        colors={['#FF6B6B', '#FF5722', '#E64A19']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.dateText}>{currentDate}</ThemedText>
            <ThemedText type="title" style={styles.welcomeTitle}>
              Ready to Workout?
            </ThemedText>
            <ThemedText style={styles.subTitle}>
              Let's get stronger together! 💪
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <View style={styles.profileIconContainer}>
              <IconSymbol name="person.circle.fill" size={40} color="#FFF" />
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Enhanced Stats Section */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, styles.statCardOrange]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FFE5DD' }]}>
            <IconSymbol name="flame.fill" size={28} color="#FF5722" />
          </View>
          <ThemedText style={styles.statNumber}>0</ThemedText>
          <ThemedText style={styles.statLabel}>Workouts</ThemedText>
        </View>
        <View style={[styles.statCard, styles.statCardGreen]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
            <IconSymbol name="clock.fill" size={28} color="#4CAF50" />
          </View>
          <ThemedText style={styles.statNumber}>0</ThemedText>
          <ThemedText style={styles.statLabel}>Minutes</ThemedText>
        </View>
        <View style={[styles.statCard, styles.statCardYellow]}>
          <View style={[styles.statIconContainer, { backgroundColor: '#FFF9E1' }]}>
            <IconSymbol name="bolt.fill" size={28} color="#FFC107" />
          </View>
          <ThemedText style={styles.statNumber}>0</ThemedText>
          <ThemedText style={styles.statLabel}>Streak</ThemedText>
        </View>
      </View>

      {/* Quote of the Day Section - Enhanced Design */}
      <View style={styles.quoteSection}>
        <LinearGradient
          colors={['#667eea', '#764ba2', '#f093fb']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.quoteCard}
        >
          {/* Decorative elements */}
          <View style={styles.quoteDecorativeTop}>
            <View style={styles.quoteMark}>
              <ThemedText style={styles.quoteMarkText}>"</ThemedText>
            </View>
          </View>
          
          <View style={styles.quoteContentContainer}>
            <View style={styles.quoteHeader}>
              <IconSymbol name="sparkles" size={18} color="#FFF" />
              <ThemedText style={styles.quoteLabel}>Daily Inspiration</ThemedText>
              <IconSymbol name="sparkles" size={18} color="#FFF" />
            </View>
            
            <ThemedText style={styles.quoteText}>{dailyQuote.quote}</ThemedText>
            <View style={styles.quoteAuthorContainer}>
              <View style={styles.quoteAuthorLine} />
              <ThemedText style={styles.quoteAuthor}>{dailyQuote.author}</ThemedText>
            </View>
          </View>
          
          {/* Decorative bottom quote mark */}
          <View style={styles.quoteDecorativeBottom}>
            <View style={styles.quoteMarkBottom}>
              <ThemedText style={styles.quoteMarkText}>"</ThemedText>
            </View>
          </View>
        </LinearGradient>
      </View>

      {/* Enhanced Workout Guides Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🎯 Workout Guides
          </ThemedText>
        </View>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.guidesContainer}
        >
          <LinearGradient
            colors={['#E3F2FD', '#BBDEFB']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.guideCard}
          >
            <TouchableOpacity style={styles.guideCardContent}>
              <View style={[styles.guideIconContainer, { backgroundColor: '#fff' }]}>
                <IconSymbol name="figure.walk" size={32} color="#2196F3" />
              </View>
              <ThemedText style={styles.guideTitle}>Beginner's Guide</ThemedText>
              <ThemedText style={styles.guideDescription}>
                Start your fitness journey with proper form and technique
              </ThemedText>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#F3E5F5', '#E1BEE7']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.guideCard}
          >
            <TouchableOpacity style={styles.guideCardContent}>
              <View style={[styles.guideIconContainer, { backgroundColor: '#fff' }]}>
                <IconSymbol name="heart.fill" size={32} color="#9C27B0" />
              </View>
              <ThemedText style={styles.guideTitle}>Cardio Tips</ThemedText>
              <ThemedText style={styles.guideDescription}>
                Maximize your cardio workouts for better endurance
              </ThemedText>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#E8F5E9', '#C8E6C9']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.guideCard}
          >
            <TouchableOpacity style={styles.guideCardContent}>
              <View style={[styles.guideIconContainer, { backgroundColor: '#fff' }]}>
                <IconSymbol name="leaf.fill" size={32} color="#4CAF50" />
              </View>
              <ThemedText style={styles.guideTitle}>Nutrition Basics</ThemedText>
              <ThemedText style={styles.guideDescription}>
                Fuel your body right for optimal performance
              </ThemedText>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#FFF3E0', '#FFE0B2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.guideCard}
          >
            <TouchableOpacity style={styles.guideCardContent}>
              <View style={[styles.guideIconContainer, { backgroundColor: '#fff' }]}>
                <IconSymbol name="moon.zzz.fill" size={32} color="#FF9800" />
              </View>
              <ThemedText style={styles.guideTitle}>Recovery Tips</ThemedText>
              <ThemedText style={styles.guideDescription}>
                Rest and recover properly to prevent injuries
              </ThemedText>
            </TouchableOpacity>
          </LinearGradient>

          <LinearGradient
            colors={['#FFEBEE', '#FFCDD2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.guideCard}
          >
            <TouchableOpacity style={styles.guideCardContent}>
              <View style={[styles.guideIconContainer, { backgroundColor: '#fff' }]}>
                <IconSymbol name="figure.strengthtraining.traditional" size={32} color="#F44336" />
              </View>
              <ThemedText style={styles.guideTitle}>Strength Training</ThemedText>
              <ThemedText style={styles.guideDescription}>
                Build muscle effectively with proper techniques
              </ThemedText>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </View>

      {/* Enhanced Featured Workout */}
      {featuredWorkout && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              ⭐ Today's Recommended
            </ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.featuredCard}
            onPress={() => router.push('/explore')}
            activeOpacity={0.95}
          >
            <ImageBackground
              source={{ uri: featuredWorkout.image_url }}
              style={styles.featuredImage}
              imageStyle={{ borderRadius: 20 }}
            >
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)', 'rgba(0,0,0,0.95)']}
                style={styles.featuredOverlay}
              >
                <View style={styles.featuredBadge}>
                  <IconSymbol name="star.fill" size={14} color="#FFC107" />
                  <ThemedText style={styles.featuredBadgeText}>FEATURED</ThemedText>
                </View>
                <ThemedText style={styles.featuredTitle}>{featuredWorkout.title}</ThemedText>
                <View style={styles.featuredMeta}>
                  <View style={styles.featuredMetaItem}>
                    <View style={styles.metaIconContainer}>
                      <IconSymbol name="clock" size={16} color="#fff" />
                    </View>
                    <ThemedText style={styles.featuredMetaText}>
                      {featuredWorkout.duration_minutes} min
                    </ThemedText>
                  </View>
                  <View style={styles.featuredMetaItem}>
                    <View style={styles.metaIconContainer}>
                      <IconSymbol name="flame" size={16} color="#fff" />
                    </View>
                    <ThemedText style={styles.featuredMetaText}>
                      {featuredWorkout.difficulty_level}
                    </ThemedText>
                  </View>
                </View>
                <TouchableOpacity style={styles.startButton} activeOpacity={0.8}>
                  <ThemedText style={styles.startButtonText}>Start Workout</ThemedText>
                  <IconSymbol name="play.fill" size={18} color="#fff" />
                </TouchableOpacity>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      )}

      {/* Enhanced Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            🏋️ Browse by Category
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/explore')} activeOpacity={0.7}>
            <ThemedText style={styles.seeAllText}>See All →</ThemedText>
          </TouchableOpacity>
        </View>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => router.push('/explore')}
              activeOpacity={0.9}
            >
              <ImageBackground
                source={{ uri: category.image_url }}
                style={styles.categoryImage}
                imageStyle={{ borderRadius: 16 }}
              >
                <LinearGradient
                  colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.7)']}
                  style={styles.categoryOverlay}
                >
                  <ThemedText style={styles.categoryName}>{category.name}</ThemedText>
                  <IconSymbol name="arrow.right.circle.fill" size={24} color="#fff" />
                </LinearGradient>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Enhanced Motivational Section */}
      <LinearGradient
        colors={['#FFF3E0', '#FFE0B2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.section, styles.motivationSection]}
      >
        <View style={styles.motivationIconContainer}>
          <IconSymbol name="star.fill" size={40} color="#FFC107" />
        </View>
        <ThemedText type="subtitle" style={styles.motivationTitle}>
          Start Your Fitness Journey Today
        </ThemedText>
        <ThemedText style={styles.motivationText}>
          Every workout brings you closer to your goals. Let's make it happen!
        </ThemedText>
        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => router.push('/explore')}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.exploreButtonText}>Explore All Workouts</ThemedText>
          <IconSymbol name="arrow.right" size={20} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 24,
    marginBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    }),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    marginBottom: 6,
    fontWeight: '500',
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 15,
    color: '#fff',
    opacity: 0.95,
    fontWeight: '500',
  },
  profileButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    padding: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      },
    }),
  },
  statCardOrange: {
    borderTopWidth: 3,
    borderTopColor: '#FF5722',
  },
  statCardGreen: {
    borderTopWidth: 3,
    borderTopColor: '#4CAF50',
  },
  statCardYellow: {
    borderTopWidth: 3,
    borderTopColor: '#FFC107',
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.7,
    fontWeight: '600',
    color: '#666',
  },
  quoteSection: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  quoteCard: {
    borderRadius: 28,
    padding: 32,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 220,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
      web: {
        boxShadow: '0 8px 24px rgba(102, 126, 234, 0.3)',
      },
    }),
  },
  quoteDecorativeTop: {
    position: 'absolute',
    top: -20,
    left: -10,
    opacity: 0.15,
  },
  quoteMark: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteMarkText: {
    fontSize: 120,
    fontWeight: '900',
    color: '#FFF',
    lineHeight: 120,
  },
  quoteDecorativeBottom: {
    position: 'absolute',
    bottom: -30,
    right: -10,
    opacity: 0.15,
    transform: [{ rotate: '180deg' }],
  },
  quoteMarkBottom: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteContentContainer: {
    zIndex: 1,
    alignItems: 'center',
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  quoteLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFF',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  quoteText: {
    fontSize: 19,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 30,
    color: '#FFF',
    marginBottom: 20,
    paddingHorizontal: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.15)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  quoteAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quoteAuthorLine: {
    width: 40,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: 1,
  },
  quoteAuthor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.5,
    opacity: 0.95,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 28,
  },
  guidesContainer: {
    paddingRight: 24,
    gap: 14,
  },
  guideCard: {
    width: 220,
    borderRadius: 20,
    marginRight: 14,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
      },
    }),
  },
  guideCardContent: {
    padding: 20,
  },
  guideIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
    }),
  },
  guideTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  guideDescription: {
    fontSize: 13,
    opacity: 0.75,
    lineHeight: 19,
    color: '#333',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A1A1A',
  },
  seeAllText: {
    color: '#FF5722',
    fontSize: 15,
    fontWeight: '700',
  },
  featuredCard: {
    height: 260,
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      },
    }),
  },
  featuredImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  featuredOverlay: {
    padding: 24,
    paddingTop: 80,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  featuredBadgeText: {
    color: '#FFC107',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  featuredTitle: {
    color: '#fff',
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 14,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  featuredMeta: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 18,
  },
  featuredMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 6,
    borderRadius: 10,
  },
  featuredMetaText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  startButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5722',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 28,
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    ...Platform.select({
      ios: {
        shadowColor: '#FF5722',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)',
      },
    }),
  },
  startButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  categoryCard: {
    width: '48%',
    height: 140,
    borderRadius: 18,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
      },
    }),
  },
  categoryImage: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  categoryOverlay: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  motivationSection: {
    borderRadius: 24,
    padding: 28,
    alignItems: 'center',
    marginHorizontal: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      },
    }),
  },
  motivationIconContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 50,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#FFC107',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 8px rgba(255, 193, 7, 0.2)',
      },
    }),
  },
  motivationTitle: {
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 10,
    color: '#1A1A1A',
    fontSize: 22,
    fontWeight: '800',
  },
  motivationText: {
    textAlign: 'center',
    opacity: 0.75,
    marginBottom: 24,
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    paddingHorizontal: 12,
  },
  exploreButton: {
    flexDirection: 'row',
    backgroundColor: '#FF5722',
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: 28,
    alignItems: 'center',
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#FF5722',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 12px rgba(255, 87, 34, 0.3)',
      },
    }),
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
