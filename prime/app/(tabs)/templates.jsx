import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

const Templates = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isNarrow = width < 720;

  const t = useMemo(
    () =>
      isDark
        ? {
            screenBg: '#020617',
            title: '#F8FAFC',
            subtitle: '#94A3B8',
            cardBg: '#0F172A',
            cardBorder: '#1E293B',
            selectedBorder: '#38BDF8',
            selectedGlow: 'rgba(56, 189, 248, 0.18)',
            cardTitle: '#E2E8F0',
            cardMeta: '#64748B',
            primaryBtnBg: '#0284C7',
            primaryBtnPressed: '#0369A1',
            primaryBtnText: '#FFFFFF',
            badgeBg: 'rgba(249, 115, 22, 0.18)',
            badgeText: '#F97316',
            disabledOverlay: 'rgba(2, 6, 23, 0.35)',
          }
        : {
            screenBg: '#F1F5F9',
            title: '#0F172A',
            subtitle: '#64748B',
            cardBg: '#FFFFFF',
            cardBorder: '#E2E8F0',
            selectedBorder: '#0284C7',
            selectedGlow: 'rgba(2, 132, 199, 0.14)',
            cardTitle: '#0F172A',
            cardMeta: '#64748B',
            primaryBtnBg: '#0284C7',
            primaryBtnPressed: '#0369A1',
            primaryBtnText: '#FFFFFF',
            badgeBg: 'rgba(249, 115, 22, 0.16)',
            badgeText: '#F97316',
            disabledOverlay: 'rgba(241, 245, 249, 0.55)',
          },
    [isDark],
  );

  const disabledWebFilter = Platform.OS === 'web' ? { filter: 'grayscale(1)' } : null;

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: t.screenBg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: t.title }]}>Template Gallery</Text>
        <Text style={[styles.pageSubtitle, { color: t.subtitle }]}>
          Pick a layout to apply to your generated charts
        </Text>
      </View>

      <View style={[styles.grid, isNarrow && styles.gridNarrow]}>
        {/* Card 1: Selected */}
        <View style={[styles.gridItem, isNarrow ? styles.full : styles.third]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: t.cardBg,
                borderColor: t.selectedBorder,
                shadowColor: t.selectedBorder,
              },
              styles.cardSelected,
              Platform.OS === 'web' ? { boxShadow: `0 0 0 4px ${t.selectedGlow}` } : null,
            ]}
          >
            <View style={[styles.iconWrap, { backgroundColor: t.selectedGlow }]}>
              <MaterialIcons name="bar-chart" size={28} color={t.selectedBorder} />
            </View>
            <Text style={[styles.cardTitle, { color: t.cardTitle }]}>Professional Analytics Chart</Text>
            <Text style={[styles.cardMeta, { color: t.cardMeta }]}>The Specialist</Text>

            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/UI')}
              style={({ pressed }) => [
                styles.primaryBtn,
                { backgroundColor: pressed ? t.primaryBtnPressed : t.primaryBtnBg },
                pressed && styles.primaryBtnPressed,
              ]}
            >
              <Text style={[styles.primaryBtnText, { color: t.primaryBtnText }]}>Use This</Text>
            </Pressable>
          </View>
        </View>

        {/* Card 2: Coming soon */}
        <View style={[styles.gridItem, isNarrow ? styles.full : styles.third]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: t.cardBg,
                borderColor: t.cardBorder,
                opacity: 0.5,
              },
              disabledWebFilter,
            ]}
          >
            <View style={[styles.comingSoonBadge, { backgroundColor: t.badgeBg }]}>
              <Text style={[styles.comingSoonText, { color: t.badgeText }]}>Coming Soon</Text>
            </View>

            <View style={[styles.iconWrap, { backgroundColor: t.disabledOverlay }]}>
              <MaterialIcons name="summarize" size={28} color={t.cardMeta} />
            </View>
            <Text style={[styles.cardTitle, { color: t.cardTitle }]}>Executive Summary</Text>
            <Text style={[styles.cardMeta, { color: t.cardMeta }]}>Premium layout</Text>

            <View style={styles.disabledBtn}>
              <Text style={[styles.disabledBtnText, { color: t.cardMeta }]}>View Only</Text>
            </View>
          </View>
        </View>

        {/* Card 3: Coming soon */}
        <View style={[styles.gridItem, isNarrow ? styles.full : styles.third]}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: t.cardBg,
                borderColor: t.cardBorder,
                opacity: 0.5,
              },
              disabledWebFilter,
            ]}
          >
            <View style={[styles.comingSoonBadge, { backgroundColor: t.badgeBg }]}>
              <Text style={[styles.comingSoonText, { color: t.badgeText }]}>Coming Soon</Text>
            </View>

            <View style={[styles.iconWrap, { backgroundColor: t.disabledOverlay }]}>
              <MaterialIcons name="timeline" size={28} color={t.cardMeta} />
            </View>
            <Text style={[styles.cardTitle, { color: t.cardTitle }]}>Process Timeline</Text>
            <Text style={[styles.cardMeta, { color: t.cardMeta }]}>Great for ops & roadmaps</Text>

            <View style={styles.disabledBtn}>
              <Text style={[styles.disabledBtnText, { color: t.cardMeta }]}>View Only</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 40 : 48,
    paddingBottom: 40,
    maxWidth: 980,
    width: '100%',
    alignSelf: 'center',
  },
  header: { marginBottom: 22 },
  pageTitle: { fontSize: 28, fontWeight: '700', marginBottom: 6, letterSpacing: -0.5 },
  pageSubtitle: { fontSize: 15, lineHeight: 22 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -10,
  },
  gridNarrow: {
    marginHorizontal: 0,
  },
  gridItem: {
    paddingHorizontal: 10,
    marginBottom: 16,
  },
  third: { width: '33.3333%' },
  full: { width: '100%', paddingHorizontal: 0 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  cardSelected: {
    borderWidth: 2,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  comingSoonText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    lineHeight: 22,
  },
  cardMeta: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 14,
  },
  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnPressed: {
    transform: [{ scale: 0.98 }],
  },
  primaryBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  disabledBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  disabledBtnText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default Templates;

