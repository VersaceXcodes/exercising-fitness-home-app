import React, { useState, useEffect } from 'react';
import { StyleSheet, ActivityIndicator, View, FlatList, RefreshControl, TextInput } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { apiService } from '@/services/api';

interface WorkoutLog {
  id: number;
  workout_id: number;
  workout_title: string;
  workout_image_url?: string;
  start_time: string;
  end_time: string;
  total_duration_seconds: number;
  status: string;
}

export default function HistoryScreen() {
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<WorkoutLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const response = await apiService.getWorkoutLogs();
      if (Array.isArray(response)) {
        setLogs(response);
        setFilteredLogs(response);
      } else if (response.data && Array.isArray(response.data)) {
        setLogs(response.data);
        setFilteredLogs(response.data);
      } else {
        setLogs((response as any) || []);
        setFilteredLogs((response as any) || []);
      }
    } catch (err) {
      console.error('Failed to load workout history:', err);
      setError('Failed to load workout history.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadLogs();
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setFilteredLogs(logs);
    } else {
      const filtered = logs.filter(log => 
        log.workout_title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredLogs(filtered);
    }
  };

  if (loading && !refreshing && logs.length === 0) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">History</ThemedText>
        <ThemedText style={styles.subtitle}>Your completed workouts</ThemedText>
      </View>

      {logs.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <IconSymbol name="magnifyingglass" size={20} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search workouts..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
            />
            {searchQuery.length > 0 && (
              <IconSymbol 
                name="xmark.circle.fill" 
                size={20} 
                color="#999" 
                onPress={() => handleSearch('')}
              />
            )}
          </View>
        </View>
      )}

      {logs.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <IconSymbol name="clock" size={64} color="#ccc" />
          <ThemedText style={styles.emptyText}>No workout history yet.</ThemedText>
          <ThemedText style={styles.emptySubtext}>Complete your first workout to see it here!</ThemedText>
        </View>
      ) : (
        <FlatList
          data={filteredLogs}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            searchQuery.length > 0 ? (
              <View style={styles.emptySearchContainer}>
                <IconSymbol name="magnifyingglass" size={48} color="#ccc" />
                <ThemedText style={styles.emptySearchText}>
                  No workouts found matching "{searchQuery}"
                </ThemedText>
                <ThemedText style={styles.emptySearchSubtext}>
                  Try a different search term
                </ThemedText>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText type="defaultSemiBold" style={styles.workoutTitle}>{item.workout_title}</ThemedText>
                <ThemedText style={styles.dateText}>{formatDate(item.start_time)}</ThemedText>
              </View>
              
              <View style={styles.cardBody}>
                {item.workout_image_url && (
                   <Image source={{ uri: item.workout_image_url }} style={styles.cardImage} />
                )}
                <View style={styles.statsContainer}>
                   <View style={styles.statItem}>
                      <IconSymbol name="clock.fill" size={16} color="#666" />
                      <ThemedText style={styles.statText}>{formatDuration(item.total_duration_seconds)}</ThemedText>
                   </View>
                   <View style={styles.statItem}>
                      <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                      <ThemedText style={styles.statText}>{item.status}</ThemedText>
                   </View>
                </View>
              </View>
            </View>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60, // Safe area equivalent
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  card: {
    backgroundColor: '#fff', // Ideally use themed background
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  workoutTitle: {
    fontSize: 16,
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 16,
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#444',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  emptySearchContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptySearchText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySearchSubtext: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
});
