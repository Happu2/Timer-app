import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated } from 'react-native';
import { CircleCheck as CheckCircle, X, Trophy } from 'lucide-react-native';
import { Timer } from '@/types/timer';
import { useThemeContext } from './ThemeProvider';
import { formatTime } from '@/utils/timerUtils';

interface CompletionModalProps {
  visible: boolean;
  timer: Timer | null;
  onDismiss: () => void;
}

export function CompletionModal({ visible, timer, onDismiss }: CompletionModalProps) {
  const { colors } = useThemeContext();
  const scaleAnim = new Animated.Value(0);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  if (!timer) return null;

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    modal: {
      backgroundColor: colors.surface,
      borderRadius: 24,
      padding: 32,
      width: '100%',
      maxWidth: 340,
      alignItems: 'center',
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: 0.3,
      shadowRadius: 30,
      elevation: 20,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: colors.success + '20',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
      position: 'relative',
    },
    trophyIcon: {
      position: 'absolute',
      top: -10,
      right: -10,
      backgroundColor: colors.warning,
      borderRadius: 15,
      padding: 6,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: 16,
    },
    timerInfo: {
      backgroundColor: colors.background,
      borderRadius: 16,
      padding: 20,
      width: '100%',
      marginBottom: 24,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timerName: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    timerDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    detailItem: {
      alignItems: 'center',
    },
    detailLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginBottom: 4,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    detailValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
    },
    closeButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: 32,
      paddingVertical: 16,
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    closeButtonText: {
      color: colors.background,
      fontSize: 16,
      fontWeight: '700',
      marginLeft: 8,
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onDismiss}
    >
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.iconContainer}>
            <CheckCircle size={50} color={colors.success} />
            <View style={styles.trophyIcon}>
              <Trophy size={18} color={colors.background} />
            </View>
          </View>
          
          <Text style={styles.title}>Congratulations! 🎉</Text>
          <Text style={styles.subtitle}>Your timer has completed successfully</Text>
          
          <View style={styles.timerInfo}>
            <Text style={styles.timerName}>"{timer.name}"</Text>
            <View style={styles.timerDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Duration</Text>
                <Text style={styles.detailValue}>{formatTime(timer.duration)}</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{timer.category}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.closeButton} onPress={onDismiss}>
            <X size={18} color={colors.background} />
            <Text style={styles.closeButtonText}>Awesome!</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}