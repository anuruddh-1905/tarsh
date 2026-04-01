import React, { useMemo, useState } from 'react';
import { Switch, Text, View, StyleSheet, Platform } from 'react-native';

import { useTheme } from '@/context/ThemeContext';

const Settings = () => {
  const { colorScheme, setColorScheme } = useTheme();
  const darkMode = colorScheme === 'dark';
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [autoSaveCloud, setAutoSaveCloud] = useState(false);

  const palette = useMemo(
    () =>
      darkMode
        ? {
            containerBg: '#020617',
            title: '#F8FAFC',
            subtitle: '#64748B',
            cardBg: '#0F172A',
            cardBorder: '#1E293B',
            label: '#E2E8F0',
            hint: '#64748B',
            divider: '#1E293B',
            switchOffTrack: '#334155',
            switchOnTrack: '#0369A1',
            switchThumbOn: '#38BDF8',
            switchThumbOff: '#94A3B8',
          }
        : {
            containerBg: '#F1F5F9',
            title: '#0F172A',
            subtitle: '#64748B',
            cardBg: '#FFFFFF',
            cardBorder: '#E2E8F0',
            label: '#1E293B',
            hint: '#64748B',
            divider: '#E2E8F0',
            switchOffTrack: '#CBD5E1',
            switchOnTrack: '#0284C7',
            switchThumbOn: '#0EA5E9',
            switchThumbOff: '#F8FAFC',
          },
    [darkMode],
  );

  return (
    <View style={[styles.container, { backgroundColor: palette.containerBg }]}>
      <Text style={[styles.title, { color: palette.title }]}>Settings</Text>
      <Text style={[styles.subtitle, { color: palette.subtitle }]}>Preferences for your workspace</Text>

      <View style={[styles.card, { backgroundColor: palette.cardBg, borderColor: palette.cardBorder }]}>
        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={[styles.label, { color: palette.label }]}>Dark Mode</Text>
            <Text style={[styles.hint, { color: palette.hint }]}>Use dark appearance in the app</Text>
          </View>
          <Switch
            value={darkMode}
            onValueChange={(on) => setColorScheme(on ? 'dark' : 'light')}
            trackColor={{ false: palette.switchOffTrack, true: palette.switchOnTrack }}
            thumbColor={darkMode ? palette.switchThumbOn : palette.switchThumbOff}
            ios_backgroundColor={palette.switchOffTrack}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: palette.divider }]} />

        <View style={styles.row}>
          <View style={styles.rowTextWrap}>
            <Text style={[styles.label, { color: palette.label }]}>Email Notifications</Text>
            <Text style={[styles.hint, { color: palette.hint }]}>Product updates and activity alerts</Text>
          </View>
          <Switch
            value={emailNotifications}
            onValueChange={setEmailNotifications}
            trackColor={{ false: palette.switchOffTrack, true: palette.switchOnTrack }}
            thumbColor={emailNotifications ? palette.switchThumbOn : palette.switchThumbOff}
            ios_backgroundColor={palette.switchOffTrack}
          />
        </View>

        <View style={[styles.divider, { backgroundColor: palette.divider }]} />

        <View style={[styles.row, styles.rowLast]}>
          <View style={styles.rowTextWrap}>
            <Text style={[styles.label, { color: palette.label }]}>Auto-save to Cloud</Text>
            <Text style={[styles.hint, { color: palette.hint }]}>Sync drafts automatically</Text>
          </View>
          <Switch
            value={autoSaveCloud}
            onValueChange={setAutoSaveCloud}
            trackColor={{ false: palette.switchOffTrack, true: palette.switchOnTrack }}
            thumbColor={autoSaveCloud ? palette.switchThumbOn : palette.switchThumbOff}
            ios_backgroundColor={palette.switchOffTrack}
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 48 : 56,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 28,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  rowLast: {
    paddingBottom: 18,
  },
  rowTextWrap: {
    flex: 1,
    paddingRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  hint: {
    fontSize: 13,
  },
  divider: {
    height: 1,
    marginLeft: 18,
  },
});

export default Settings;
