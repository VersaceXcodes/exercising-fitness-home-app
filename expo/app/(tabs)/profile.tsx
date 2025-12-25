import React, { useState, useEffect } from 'react';
import { StyleSheet, View, ScrollView, TextInput, TouchableOpacity, Alert, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { router } from 'expo-router';

interface UserStats {
  totalWorkouts: number;
  totalDurationMinutes: number;
  workoutsThisWeek: number;
}

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats>({
    totalWorkouts: 0,
    totalDurationMinutes: 0,
    workoutsThisWeek: 0,
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfileData();
  }, []);

  useEffect(() => {
    if (user?.name) {
      setName(user.name);
    }
  }, [user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const statsData = await apiService.getUserStats();
      if (statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
      // Fail silently for stats
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    try {
      setSaving(true);
      await apiService.updateProfile({ name: name.trim() });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
      // Ideally update the user in context, but for now we'll rely on next fetch or simple local state
    } catch (error) {
      console.error('Failed to update profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  if (loading && !stats.totalWorkouts) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF5722" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <LinearGradient
        colors={['#FF6B6B', '#FF5722']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <IconSymbol name="person.circle.fill" size={80} color="#fff" />
          </View>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.nameInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                placeholderTextColor="rgba(255,255,255,0.7)"
                autoFocus
              />
              <View style={styles.editButtons}>
                <TouchableOpacity 
                  style={styles.saveButton} 
                  onPress={handleUpdateProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FF5722" />
                  ) : (
                    <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.cancelButton} 
                  onPress={() => {
                    setIsEditing(false);
                    setName(user?.name || '');
                  }}
                  disabled={saving}
                >
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <ThemedText style={styles.userName}>{name}</ThemedText>
              <ThemedText style={styles.userEmail}>{user?.email}</ThemedText>
              <TouchableOpacity 
                style={styles.editProfileButton}
                onPress={() => setIsEditing(true)}
              >
                <IconSymbol name="pencil" size={16} color="#fff" />
                <ThemedText style={styles.editProfileText}>Edit Profile</ThemedText>
              </TouchableOpacity>
            </>
          )}
        </View>
      </LinearGradient>

      <View style={styles.statsContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Your Progress</ThemedText>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FFE5DD' }]}>
              <IconSymbol name="flame.fill" size={24} color="#FF5722" />
            </View>
            <ThemedText style={styles.statValue}>{stats.totalWorkouts}</ThemedText>
            <ThemedText style={styles.statLabel}>Workouts</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
              <IconSymbol name="clock.fill" size={24} color="#4CAF50" />
            </View>
            <ThemedText style={styles.statValue}>{stats.totalDurationMinutes}</ThemedText>
            <ThemedText style={styles.statLabel}>Minutes</ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <IconSymbol name="calendar" size={24} color="#2196F3" />
            </View>
            <ThemedText style={styles.statValue}>{stats.workoutsThisWeek}</ThemedText>
            <ThemedText style={styles.statLabel}>This Week</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/(tabs)/history')}>
          <View style={styles.menuItemLeft}>
            <IconSymbol name="clock" size={22} color="#666" />
            <ThemedText style={styles.menuItemText}>Workout History</ThemedText>
          </View>
          <IconSymbol name="chevron.right" size={20} color="#CCC" />
        </TouchableOpacity>
        
        <View style={styles.divider} />
        
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <View style={styles.menuItemLeft}>
            <IconSymbol name="arrow.right.circle" size={22} color="#F44336" />
            <ThemedText style={[styles.menuItemText, { color: '#F44336' }]}>Log Out</ThemedText>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  headerContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatarContainer: {
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  editProfileText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  editContainer: {
    width: '100%',
    alignItems: 'center',
  },
  nameInput: {
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 12,
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FF5722',
    fontWeight: '700',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },
  cancelButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionTitle: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  statsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      },
    }),
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  menuContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 24,
    borderRadius: 16,
    padding: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      },
    }),
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
  },
});
