import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Filter, Download, Plus } from 'lucide-react-native';
import { useTimers } from '@/hooks/useTimers';
import { CategorySection } from '@/components/CategorySection';
import { CompletionModal } from '@/components/CompletionModal';
import { useThemeContext } from '@/components/ThemeProvider';
import { Timer } from '@/types/timer';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { colors } = useThemeContext();
  const {
    categories,
    timers,
    startTimer,
    pauseTimer,
    resetTimer,
    deleteTimer,
    startAllInCategory,
    pauseAllInCategory,
    resetAllInCategory,
    toggleCategoryExpansion,
    exportData,
  } = useTimers();

  const [completedTimer, setCompletedTimer] = useState<Timer | null>(null);
  const [previousTimers, setPreviousTimers] = useState<Timer[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Monitor for completed timers
  useEffect(() => {
    const newlyCompleted = timers.find(timer => 
      timer.status === 'completed' && 
      !previousTimers.find(prev => prev.id === timer.id && prev.status === 'completed')
    );
    
    if (newlyCompleted) {
      setCompletedTimer(newlyCompleted);
    }
    
    setPreviousTimers(timers);
  }, [timers]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Force a re-render by updating the state
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleExport = () => {
    try {
      const data = exportData();
      Alert.alert(
        'Export Data',
        'Timer data has been prepared for export. In a real app, this would save to a file or share via system share sheet.',
        [
          { text: 'OK' }
        ]
      );
      console.log('Export data:', data);
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export timer data');
    }
  };

  const handleAddTimer = () => {
    router.push('/add-timer');
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    headerActions: {
      flexDirection: 'row',
    },
    headerButton: {
      padding: 8,
      marginLeft: 8,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: 24,
    },
    addButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
    },
    addButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '600',
      marginLeft: 8,
    },
    statsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    statsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.primary,
    },
    statLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
  });

  const totalTimers = timers.length;
  const runningTimers = timers.filter(t => t.status === 'running').length;
  const completedTimers = timers.filter(t => t.status === 'completed').length;

  if (categories.length === 0 && totalTimers === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Timers</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleExport}>
              <Download size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Timers Yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first timer to start managing your time effectively.
          </Text>
          <TouchableOpacity style={styles.addButton} onPress={handleAddTimer}>
            <Plus size={20} color={colors.background} />
            <Text style={styles.addButtonText}>Add Your First Timer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Timers</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Filter size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleExport}>
            <Download size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {totalTimers > 0 && (
          <View style={styles.statsContainer}>
            <Text style={styles.statsTitle}>Overview</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalTimers}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{runningTimers}</Text>
                <Text style={styles.statLabel}>Running</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{completedTimers}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          </View>
        )}

        {categories.map(category => (
          <CategorySection
            key={category.name}
            category={category}
            onToggleExpansion={() => toggleCategoryExpansion(category.name)}
            onStartTimer={startTimer}
            onPauseTimer={pauseTimer}
            onResetTimer={resetTimer}
            onDeleteTimer={deleteTimer}
            onStartAll={() => startAllInCategory(category.name)}
            onPauseAll={() => pauseAllInCategory(category.name)}
            onResetAll={() => resetAllInCategory(category.name)}
          />
        ))}
      </ScrollView>

      <CompletionModal
        visible={!!completedTimer}
        timer={completedTimer}
        onDismiss={() => setCompletedTimer(null)}
      />
    </SafeAreaView>
  );
}