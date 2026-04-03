import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useStats } from '@/context/StatsContext';

function formatRelativeTime(isoString: string) {
  const then = new Date(isoString).getTime();
  if (!Number.isFinite(then)) {
    return 'just now';
  }
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min${mins === 1 ? '' : 's'} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? '' : 's'} ago`;
}

function estimateStorage(totalFiles: number) {
  const estimatedGb = totalFiles * 0.06;
  if (estimatedGb < 1) {
    return `${Math.max(estimatedGb * 1024, 0).toFixed(0)} MB`;
  }
  return `${estimatedGb.toFixed(1)} GB`;
}

export default function DashboardScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isNarrow = width < 720;
  const { totalFiles, infographicsCount, recentActivity } = useStats();

  const t = useMemo(
    () =>
      isDark
        ? {
            screenBg: '#020617',
            cardBg: '#0F172A',
            cardBorder: '#1E293B',
            textTitle: '#F8FAFC',
            textMuted: '#94A3B8',
            textBody: '#E2E8F0',
            primary: '#38BDF8',
            primaryDark: '#0284C7',
            btnText: '#FFFFFF',
            divider: '#1E293B',
          }
        : {
            screenBg: '#F1F5F9',
            cardBg: '#FFFFFF',
            cardBorder: '#E2E8F0',
            textTitle: '#0F172A',
            textMuted: '#64748B',
            textBody: '#0F172A',
            primary: '#0284C7',
            primaryDark: '#0369A1',
            btnText: '#FFFFFF',
            divider: '#F1F5F9',
          },
    [isDark],
  );

  const stats = useMemo(
    () => [
      { key: 'processed', title: 'Processed Files', value: String(totalFiles), icon: 'check-circle' },
      { key: 'infographics', title: 'Total Infographics', value: String(infographicsCount), icon: 'filter-list' },
      { key: 'storage', title: 'Storage Used', value: estimateStorage(totalFiles), icon: 'database' },
    ],
    [totalFiles, infographicsCount],
  );

  const latestActivity = useMemo(
    () =>
      recentActivity.slice(0, 2).map((item) => ({
        key: item.id,
        fileName: item.fileName,
        at: formatRelativeTime(item.createdAt),
        icon: 'insert-drive-file',
      })),
    [recentActivity],
  );

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: t.screenBg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.section}>
        <Text style={[styles.pageTitle, { color: t.textTitle }]}>Prime Dashboard</Text>
        <Text style={[styles.pageSubtitle, { color: t.textMuted }]}>
          Track processing and create new infographics in seconds.
        </Text>
      </View>

      <View style={styles.statsRow}>
        {stats.map((s) => (
          <View
            key={s.key}
            style={[
              styles.statCard,
              {
                backgroundColor: t.cardBg,
                borderColor: t.cardBorder,
                width: isNarrow ? '100%' : '33.333%',
              },
            ]}
          >
            <View style={styles.statIconWrap}>
              <MaterialIcons name={s.icon as any} size={22} color={t.primary} />
            </View>
            <Text style={[styles.statValue, { color: t.textTitle }]}>{s.value}</Text>
            <Text style={[styles.statTitle, { color: t.textMuted }]}>{s.title}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.welcomeCard, { backgroundColor: t.cardBg, borderColor: t.cardBorder }]}>
        <Text style={[styles.welcomeTitle, { color: t.textTitle }]}>Welcome</Text>
        <Text style={[styles.welcomeSubtitle, { color: t.textMuted }]}>
          Create a new infographic from any supported PDF.
        </Text>

        <Pressable
          accessibilityRole="button"
          onPress={() => router.push('/UI')}
          style={({ pressed }) => [
            styles.primaryBtn,
            {
              backgroundColor: pressed ? t.primaryDark : t.primary,
              borderColor: t.primary,
            },
          ]}
        >
          <View style={styles.primaryBtnInner}>
            <MaterialIcons name="sparkles" size={18} color={t.btnText} />
            <Text style={[styles.primaryBtnText, { color: t.btnText }]}>Create New Infographic</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.activityBlock}>
        <Text style={[styles.activityTitle, { color: t.textTitle }]}>Recent Activity</Text>

        <View style={[styles.activityList, { borderColor: t.cardBorder }]}>
          {latestActivity.length === 0 ? (
            <View style={styles.activityRow}>
              <Text style={[styles.emptyText, { color: t.textMuted }]}>No activity yet. Generate your first infographic.</Text>
            </View>
          ) : (
            latestActivity.map((a, idx) => (
              <View key={a.key}>
                {idx > 0 ? <View style={[styles.activityDivider, { backgroundColor: t.divider }]} /> : null}
                <View style={styles.activityRow}>
                  <View style={[styles.activityIconWrap, { borderColor: t.cardBorder }]}>
                    <MaterialIcons name={a.icon as any} size={18} color={t.primary} />
                  </View>
                  <View style={styles.activityText}>
                    <Text style={[styles.activityFileName, { color: t.textBody }]} numberOfLines={1}>
                      {a.fileName}
                    </Text>
                    <Text style={[styles.activityAt, { color: t.textMuted }]}>{a.at}</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
  },
  section: { marginBottom: 18 },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 18,
  },
  statCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  statIconWrap: {
    height: 34,
    width: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
  },
  welcomeCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    overflow: 'hidden',
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  primaryBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  primaryBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
    marginLeft: 8,
  },
  activityBlock: {
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  activityList: {
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  activityDivider: {
    height: 1,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  activityIconWrap: {
    height: 34,
    width: 34,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityText: {
    flex: 1,
    minWidth: 0,
  },
  activityFileName: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  activityAt: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    fontWeight: '500',
  },
});
