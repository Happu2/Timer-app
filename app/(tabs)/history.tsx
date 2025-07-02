import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar, Clock, Tag, Trash2 } from 'lucide-react-native';
import { useTimers } from '@/hooks/useTimers';
import { useThemeContext } from '@/components/ThemeProvider';
import { formatTime, getCategoryColor } from '@/utils/timerUtils';

export default function HistoryScreen() {
  const { colors } = useThemeContext();
  const { history } = useTimers();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const groupHistoryByDate = () => {
    const groups: { [key: string]: typeof history } = {};
    
    history.forEach(item => {
      const date = new Date(item.completedAt);
      const dateKey = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(item);
    });
    
    return groups;
  };

  const historyGroups = groupHistoryByDate();
  const totalCompleted = history.length;
  const totalTime = history.reduce((sum, item) => sum + item.duration, 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
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
    stats: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      margin: 20,
      justifyContent: 'space-around',
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
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 20,
    },
    dateGroup: {
      marginBottom: 24,
    },
    dateHeader: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    historyItem: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 8,
    },
    itemName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
    },
    itemTime: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    itemDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    categoryIndicator: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 8,
    },
    itemCategory: {
      fontSize: 14,
      color: colors.textSecondary,
      marginRight: 16,
    },
    itemDuration: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
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
    },
    emptySubtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
    },
  });

  if (history.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>History</Text>
        </View>
        
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No Completed Timers</Text>
          <Text style={styles.emptySubtitle}>
            Complete some timers to see your progress history here.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{totalCompleted}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{formatTime(totalTime)}</Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        {Object.entries(historyGroups).map(([date, items]) => (
          <View key={date} style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{date}</Text>
            {items.map(item => (
              <View key={item.id} style={styles.historyItem}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemTime}>
                    {formatDate(new Date(item.completedAt))}
                  </Text>
                </View>
                <View style={styles.itemDetails}>
                  <View style={styles.itemLeft}>
                    <View 
                      style={[
                        styles.categoryIndicator, 
                        { backgroundColor: getCategoryColor(item.category) }
                      ]} 
                    />
                    <Text style={styles.itemCategory}>{item.category}</Text>
                  </View>
                  <Text style={styles.itemDuration}>
                    {formatTime(item.duration)}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}