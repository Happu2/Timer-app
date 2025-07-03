import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Clock, Tag, Bell } from 'lucide-react-native';
import { useTimers } from '@/hooks/useTimers';
import { useThemeContext } from '@/components/ThemeProvider';
import { parseDuration } from '@/utils/timerUtils';
import { router } from 'expo-router';

const PRESET_CATEGORIES = [
  'Work', 'Study', 'Exercise', 'Break', 'Cooking', 'Meditation', 'Reading', 'Other'
];

const PRESET_DURATIONS = [
  { label: '5 min', value: '5:00' },
  { label: '10 min', value: '10:00' },
  { label: '15 min', value: '15:00' },
  { label: '25 min', value: '25:00' },
  { label: '30 min', value: '30:00' },
  { label: '1 hour', value: '1:00:00' },
];

export default function AddTimerScreen() {
  const { colors } = useThemeContext();
  const { addTimer } = useTimers();
  
  const [name, setName] = useState('');
  const [duration, setDuration] = useState('');
  const [category, setCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [halfwayAlert, setHalfwayAlert] = useState(false);

  const resetForm = () => {
    setName('');
    setDuration('');
    setCategory('');
    setCustomCategory('');
    setHalfwayAlert(false);
  };

  const handleSubmit = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a timer name');
      return;
    }

    if (!duration.trim()) {
      Alert.alert('Error', 'Please enter a duration');
      return;
    }

    const durationSeconds = parseDuration(duration);
    if (durationSeconds <= 0) {
      Alert.alert('Error', 'Please enter a valid duration (e.g., "5:00" for 5 minutes)');
      return;
    }

    const timerCategory = customCategory.trim() || category || 'Other';

    try {
      addTimer(name.trim(), durationSeconds, timerCategory, halfwayAlert);
      
      Alert.alert(
        'Timer Created',
        `"${name}" has been added successfully!`,
        [
          {
            text: 'Add Another',
            onPress: resetForm,
          },
          {
            text: 'View Timers',
            onPress: () => {
              resetForm();
              router.push('/');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create timer. Please try again.');
      console.error('Error creating timer:', error);
    }
  };

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
    content: {
      flex: 1,
    },
    scrollContent: {
      padding: 20,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
    },
    sectionIcon: {
      marginRight: 8,
    },
    input: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text,
    },
    durationHelp: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 4,
    },
    presetGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
    },
    presetButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      margin: 4,
    },
    presetButtonSelected: {
      backgroundColor: colors.primary + '20',
      borderColor: colors.primary,
    },
    presetButtonText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    presetButtonTextSelected: {
      color: colors.primary,
      fontWeight: '500',
    },
    optionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
    },
    optionText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    optionDescription: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    switch: {
      width: 50,
      height: 30,
      borderRadius: 15,
      padding: 2,
      justifyContent: 'center',
    },
    switchThumb: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.background,
    },
    submitButton: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      marginTop: 12,
    },
    submitButtonText: {
      color: colors.background,
      fontSize: 18,
      fontWeight: '600',
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Timer</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Clock size={20} color={colors.primary} style={styles.sectionIcon} />
            Timer Name
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g., Morning Workout"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Clock size={20} color={colors.primary} style={styles.sectionIcon} />
            Duration
          </Text>
          <TextInput
            style={styles.input}
            value={duration}
            onChangeText={setDuration}
            placeholder="e.g., 25:00 or 1:30:00"
            placeholderTextColor={colors.textSecondary}
          />
          <Text style={styles.durationHelp}>
            Format: MM:SS or HH:MM:SS (e.g., "5:00" for 5 minutes)
          </Text>
          
          <View style={styles.presetGrid}>
            {PRESET_DURATIONS.map(preset => (
              <TouchableOpacity
                key={preset.value}
                style={[
                  styles.presetButton,
                  duration === preset.value && styles.presetButtonSelected
                ]}
                onPress={() => setDuration(preset.value)}
              >
                <Text style={[
                  styles.presetButtonText,
                  duration === preset.value && styles.presetButtonTextSelected
                ]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Tag size={20} color={colors.primary} style={styles.sectionIcon} />
            Category
          </Text>
          <View style={styles.presetGrid}>
            {PRESET_CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.presetButton,
                  category === cat && styles.presetButtonSelected
                ]}
                onPress={() => {
                  setCategory(cat);
                  setCustomCategory('');
                }}
              >
                <Text style={[
                  styles.presetButtonText,
                  category === cat && styles.presetButtonTextSelected
                ]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            value={customCategory}
            onChangeText={(text) => {
              setCustomCategory(text);
              if (text) setCategory('');
            }}
            placeholder="Or enter custom category"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Bell size={20} color={colors.primary} style={styles.sectionIcon} />
            Options
          </Text>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setHalfwayAlert(!halfwayAlert)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.optionText}>Halfway Alert</Text>
              <Text style={styles.optionDescription}>
                Get notified when timer reaches 50% completion
              </Text>
            </View>
            <View style={[
              styles.switch,
              { backgroundColor: halfwayAlert ? colors.primary : colors.border }
            ]}>
              <View style={[
                styles.switchThumb,
                { alignSelf: halfwayAlert ? 'flex-end' : 'flex-start' }
              ]} />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Timer</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}