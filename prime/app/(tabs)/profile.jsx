import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useStats } from '@/context/StatsContext';

const Profile = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { infographicsCount } = useStats();

  const t = useMemo(
    () =>
      isDark
        ? {
            screenBg: '#020617',
            cardBg: '#0F172A',
            cardBorder: '#1E293B',
            title: '#F8FAFC',
            subtitle: '#94A3B8',
            body: '#E2E8F0',
            muted: '#64748B',
            accent: '#38BDF8',
            progressTrack: '#1E293B',
            progressFill: '#38BDF8',
            rowBg: '#0B1220',
            rowBorder: '#1E293B',
          }
        : {
            screenBg: '#F1F5F9',
            cardBg: '#FFFFFF',
            cardBorder: '#E2E8F0',
            title: '#0F172A',
            subtitle: '#64748B',
            body: '#1E293B',
            muted: '#64748B',
            accent: '#0284C7',
            progressTrack: '#E2E8F0',
            progressFill: '#0284C7',
            rowBg: '#FFFFFF',
            rowBorder: '#E2E8F0',
          },
    [isDark],
  );

  const maxInfographics = 20;
  const safeCount = Math.max(0, infographicsCount);
  const usagePercent = Math.min((safeCount / maxInfographics) * 100, 100);
  const usageFlex = Math.max(0, Math.min(100, usagePercent)) / 100;

  const settingsItems = [
    { key: 'infographics', label: 'My Infographics', icon: 'insert-chart-outlined' },
    { key: 'branding', label: 'Brand Settings', icon: 'palette' },
    { key: 'security', label: 'Security & Privacy', icon: 'shield' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: t.screenBg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}>
      <View style={[styles.profileCard, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { borderColor: t.accent, backgroundColor: t.rowBg }]}>
            <Text style={[styles.avatarInitials, { color: t.title }]}>AP</Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={[styles.name, { color: t.title }]}>Anuruddh Pratap</Text>
            <Text style={[styles.email, { color: t.subtitle }]}>anuruddh.pratap@example.com</Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: t.muted }]}>Account Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: t.muted }]}>Usage</Text>
            <Text style={[styles.statValue, { color: t.body }]}>{Math.round(usagePercent)}%</Text>
            <View style={[styles.progressTrack, { backgroundColor: t.progressTrack }]}>
              <View style={[styles.progressFill, { backgroundColor: t.progressFill, flex: usageFlex }]} />
              <View style={{ flex: 1 - usageFlex }} />
            </View>
          </View>

          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: t.muted }]}>Limits</Text>
            <Text style={[styles.statValue, { color: t.body }]}>{safeCount} / {maxInfographics}</Text>
            <Text style={[styles.statHint, { color: t.subtitle }]}>Monthly exports: {safeCount} / {maxInfographics}</Text>
          </View>

          <View style={styles.statCol}>
            <Text style={[styles.statLabel, { color: t.muted }]}>Account Age</Text>
            <Text style={[styles.statValue, { color: t.body }]}>4 mo</Text>
            <Text style={[styles.statHint, { color: t.subtitle }]}>Since Dec 2025</Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
        <Text style={[styles.sectionTitle, { color: t.muted }]}>Account Settings</Text>
        {settingsItems.map((item, index) => (
          <Pressable
            key={item.key}
            onPress={() => {
              if (item.key === 'infographics') {
                router.push('/history');
              }
            }}
            style={[
              styles.settingRow,
              {
                backgroundColor: t.rowBg,
                borderBottomColor: t.rowBorder,
                borderBottomWidth: index === settingsItems.length - 1 ? 0 : 1,
              },
            ]}>
            <View style={styles.settingLeft}>
              <MaterialIcons name={item.icon} size={20} color={t.accent} />
              <Text style={[styles.settingText, { color: t.body }]}>{item.label}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={20} color={t.subtitle} />
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 40,
    maxWidth: 920,
    width: '100%',
    alignSelf: 'center',
  },
  profileCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    marginRight: 14,
  },
  avatarInitials: {
    fontSize: 26,
    fontWeight: '700',
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
  },
  section: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 14,
  },
  statCol: {
    flex: 1,
    paddingHorizontal: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  statHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressTrack: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  progressFill: {
    borderRadius: 999,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },
});

export default Profile;

