import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Sun, Moon, Smartphone, Download, Trash2, Info } from 'lucide-react-native';
import { useThemeContext } from '@/components/ThemeProvider';
import { useTimers } from '@/hooks/useTimers';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen() {
  const { colors, storedTheme, setTheme } = useThemeContext();
  const { exportData, history } = useTimers();

  const handleClearAllData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all timers and history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['timers', 'timer_history']);
              Alert.alert('Success', 'All data has been cleared');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data');
            }
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    try {
      const data = exportData();
      Alert.alert(
        'Export Successful',
        'Your timer data has been prepared for export. In a production app, this would open the system share sheet to save or send the file.',
        [{ text: 'OK' }]
      );
      console.log('Exported data:', data);
    } catch (error) {
      Alert.alert('Export Error', 'Failed to export data');
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
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    option: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    optionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    optionIcon: {
      marginRight: 12,
    },
    optionContent: {
      flex: 1,
    },
    optionTitle: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
    },
    optionDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      marginTop: 2,
    },
    optionValue: {
      fontSize: 14,
      color: colors.primary,
      fontWeight: '500',
    },
    themeOptions: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    themeOption: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 8,
    },
    themeOptionActive: {
      backgroundColor: colors.primary + '20',
    },
    themeOptionText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textSecondary,
      marginLeft: 6,
    },
    themeOptionTextActive: {
      color: colors.primary,
    },
    dangerOption: {
      backgroundColor: colors.error + '10',
      borderColor: colors.error + '30',
    },
    dangerText: {
      color: colors.error,
    },
    appInfo: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    appName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 4,
    },
    appVersion: {
      fontSize: 14,
      color: colors.textSecondary,
    },
  });

  const getThemeLabel = () => {
    switch (storedTheme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'system': return 'System';
      default: return 'System';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.themeOptions}>
            {[
              { key: 'light', label: 'Light', icon: Sun },
              { key: 'dark', label: 'Dark', icon: Moon },
              { key: 'system', label: 'Auto', icon: Smartphone },
            ].map(({ key, label, icon: Icon }) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.themeOption,
                  storedTheme === key && styles.themeOptionActive,
                ]}
                onPress={() => setTheme(key as any)}
              >
                <Icon 
                  size={16} 
                  color={storedTheme === key ? colors.primary : colors.textSecondary} 
                />
                <Text style={[
                  styles.themeOptionText,
                  storedTheme === key && styles.themeOptionTextActive,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <TouchableOpacity style={styles.option} onPress={handleExportData}>
            <View style={styles.optionButton}>
              <Download size={20} color={colors.primary} style={styles.optionIcon} />
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Export Data</Text>
                <Text style={styles.optionDescription}>
                  Save your timers and history as JSON
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.option, styles.dangerOption]} 
            onPress={handleClearAllData}
          >
            <View style={styles.optionButton}>
              <Trash2 size={20} color={colors.error} style={styles.optionIcon} />
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, styles.dangerText]}>Clear All Data</Text>
                <Text style={styles.optionDescription}>
                  Delete all timers and history permanently
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          
          <View style={styles.option}>
            <View style={styles.optionButton}>
              <Info size={20} color={colors.textSecondary} style={styles.optionIcon} />
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>Completed Timers</Text>
                <Text style={styles.optionDescription}>
                  Total timers completed
                </Text>
              </View>
              <Text style={styles.optionValue}>{history.length}</Text>
            </View>
          </View>
        </View>

        <View style={styles.appInfo}>
          <Text style={styles.appName}>Timer Master</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}