import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, ChevronRight, Play, Pause, RotateCcw } from 'lucide-react-native';
import { Category, Timer } from '@/types/timer';
import { TimerItem } from './TimerItem';
import { getCategoryColor } from '@/utils/timerUtils';
import { useThemeContext } from './ThemeProvider';

interface CategorySectionProps {
  category: Category;
  onToggleExpansion: () => void;
  onStartTimer: (id: string) => void;
  onPauseTimer: (id: string) => void;
  onResetTimer: (id: string) => void;
  onDeleteTimer: (id: string) => void;
  onStartAll: () => void;
  onPauseAll: () => void;
  onResetAll: () => void;
}

export function CategorySection({
  category,
  onToggleExpansion,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onDeleteTimer,
  onStartAll,
  onPauseAll,
  onResetAll,
}: CategorySectionProps) {
  const { colors } = useThemeContext();
  
  const categoryColor = getCategoryColor(category.name);
  const runningTimers = category.timers.filter(t => t.status === 'running').length;
  const totalTimers = category.timers.length;

  const styles = StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    header: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    headerTop: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryIndicator: {
      width: 20,
      height: 20,
      borderRadius: 10,
      marginRight: 12,
    },
    categoryName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    timerCount: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: 8,
    },
    bulkActions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    bulkButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      flex: 1,
      marginHorizontal: 2,
      justifyContent: 'center',
    },
    bulkButtonText: {
      marginLeft: 4,
      fontSize: 12,
      fontWeight: '500',
    },
    timersContainer: {
      paddingHorizontal: 4,
    },
  });

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.header} onPress={onToggleExpansion}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
            <Text style={styles.categoryName}>{category.name}</Text>
          </View>
          <Text style={styles.timerCount}>
            {runningTimers > 0 ? `${runningTimers}/${totalTimers} running` : `${totalTimers} timers`}
          </Text>
          {category.isExpanded ? (
            <ChevronDown size={20} color={colors.textSecondary} />
          ) : (
            <ChevronRight size={20} color={colors.textSecondary} />
          )}
        </View>

        {category.isExpanded && (
          <View style={styles.bulkActions}>
            <TouchableOpacity
              style={[styles.bulkButton, { backgroundColor: colors.success + '20' }]}
              onPress={onStartAll}
            >
              <Play size={14} color={colors.success} />
              <Text style={[styles.bulkButtonText, { color: colors.success }]}>
                Start All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bulkButton, { backgroundColor: colors.warning + '20' }]}
              onPress={onPauseAll}
            >
              <Pause size={14} color={colors.warning} />
              <Text style={[styles.bulkButtonText, { color: colors.warning }]}>
                Pause All
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.bulkButton, { backgroundColor: colors.secondary + '20' }]}
              onPress={onResetAll}
            >
              <RotateCcw size={14} color={colors.secondary} />
              <Text style={[styles.bulkButtonText, { color: colors.secondary }]}>
                Reset All
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>

      {category.isExpanded && (
        <View style={styles.timersContainer}>
          {category.timers.map(timer => (
            <TimerItem
              key={timer.id}
              timer={timer}
              onStart={() => onStartTimer(timer.id)}
              onPause={() => onPauseTimer(timer.id)}
              onReset={() => onResetTimer(timer.id)}
              onDelete={() => onDeleteTimer(timer.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}