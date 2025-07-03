import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Play, Pause, RotateCcw, Trash2, Clock } from 'lucide-react-native';
import { Timer } from '@/types/timer';
import { formatTime, getProgressPercentage } from '@/utils/timerUtils';
import { useThemeContext } from './ThemeProvider';

interface TimerItemProps {
  timer: Timer;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDelete: () => void;
}

export function TimerItem({ timer, onStart, onPause, onReset, onDelete }: TimerItemProps) {
  const { colors } = useThemeContext();
  
  const progress = getProgressPercentage(timer.remainingTime, timer.duration);
  const isRunning = timer.status === 'running';
  const isCompleted = timer.status === 'completed';
  const isPaused = timer.status === 'paused';

  const handleDelete = () => {
    Alert.alert(
      'Delete Timer',
      `Are you sure you want to delete "${timer.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: onDelete },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 20,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: isRunning ? colors.success + '40' : colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    nameContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    name: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginLeft: 8,
    },
    status: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      overflow: 'hidden',
      letterSpacing: 0.5,
    },
    progressContainer: {
      marginBottom: 16,
    },
    progressBackground: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    progressBar: {
      height: '100%',
      borderRadius: 3,
    },
    timeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    timeText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: isRunning ? colors.success : colors.text,
      fontVariant: ['tabular-nums'],
    },
    progressText: {
      fontSize: 14,
      color: colors.textSecondary,
      fontWeight: '500',
    },
    controls: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    mainControls: {
      flexDirection: 'row',
      flex: 1,
    },
    controlButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 12,
      flex: 1,
      marginRight: 8,
      justifyContent: 'center',
    },
    controlButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '600',
    },
    deleteButton: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: colors.error + '15',
      marginLeft: 8,
    },
    completedContainer: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    completedText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.success,
      marginBottom: 8,
    },
    halfwayAlert: {
      backgroundColor: colors.warning + '20',
      borderColor: colors.warning + '40',
      borderWidth: 1,
      borderRadius: 8,
      padding: 8,
      marginBottom: 12,
    },
    halfwayAlertText: {
      fontSize: 12,
      color: colors.warning,
      textAlign: 'center',
      fontWeight: '500',
    },
  });

  const getStatusStyle = () => {
    switch (timer.status) {
      case 'running':
        return { backgroundColor: colors.success + '20', color: colors.success };
      case 'paused':
        return { backgroundColor: colors.warning + '20', color: colors.warning };
      case 'completed':
        return { backgroundColor: colors.primary + '20', color: colors.primary };
      default:
        return { backgroundColor: colors.border, color: colors.textSecondary };
    }
  };

  const getProgressColor = () => {
    if (isCompleted) return colors.success;
    if (isRunning) return colors.success;
    if (progress > 75) return colors.success;
    if (progress > 50) return colors.warning;
    return colors.primary;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.nameContainer}>
          <Clock size={20} color={isRunning ? colors.success : colors.textSecondary} />
          <Text style={styles.name}>{timer.name}</Text>
        </View>
        <Text style={[styles.status, getStatusStyle()]}>
          {timer.status}
        </Text>
      </View>

      {timer.halfwayAlert && timer.halfwayAlertTriggered && !isCompleted && (
        <View style={styles.halfwayAlert}>
          <Text style={styles.halfwayAlertText}>
            🔔 Halfway point reached!
          </Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressBackground}>
          <View 
            style={[
              styles.progressBar, 
              { 
                width: `${progress}%`,
                backgroundColor: getProgressColor(),
              }
            ]} 
          />
        </View>
      </View>

      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>
          {formatTime(timer.remainingTime)}
        </Text>
        <Text style={styles.progressText}>
          {Math.round(progress)}% complete
        </Text>
      </View>

      {isCompleted ? (
        <View style={styles.completedContainer}>
          <Text style={styles.completedText}>✅ Timer Completed!</Text>
          <View style={styles.controls}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: colors.secondary + '20', flex: 1 }
              ]}
              onPress={onReset}
            >
              <RotateCcw size={18} color={colors.secondary} />
              <Text style={[styles.controlButtonText, { color: colors.secondary }]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Trash2 size={18} color={colors.error} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.controls}>
          <View style={styles.mainControls}>
            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: isRunning ? colors.warning + '20' : colors.success + '20' }
              ]}
              onPress={isRunning ? onPause : onStart}
              disabled={timer.remainingTime <= 0}
            >
              {isRunning ? (
                <Pause size={18} color={colors.warning} />
              ) : (
                <Play size={18} color={colors.success} />
              )}
              <Text style={[
                styles.controlButtonText,
                { color: isRunning ? colors.warning : colors.success }
              ]}>
                {isRunning ? 'Pause' : 'Start'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.controlButton,
                { backgroundColor: colors.secondary + '20' }
              ]}
              onPress={onReset}
            >
              <RotateCcw size={18} color={colors.secondary} />
              <Text style={[styles.controlButtonText, { color: colors.secondary }]}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDelete}
          >
            <Trash2 size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}