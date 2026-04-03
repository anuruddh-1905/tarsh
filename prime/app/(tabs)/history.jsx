import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useStats } from '@/context/StatsContext';

function formatRelativeTime(isoString) {
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

const History = () => {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isNarrow = width < 520;
  const { generatedCharts } = useStats();

  const t = useMemo(
    () =>
      isDark
        ? {
            screenBg: '#020617',
            title: '#F8FAFC',
            subtitle: '#94A3B8',
            cardBg: '#0F172A',
            cardBorder: '#1E293B',
            pdfLabel: '#64748B',
            pdfName: '#F1F5F9',
            btnBg: '#0284C7',
            btnText: '#FFFFFF',
            btnPressed: '#0369A1',
          }
        : {
            screenBg: '#F1F5F9',
            title: '#0F172A',
            subtitle: '#64748B',
            cardBg: '#FFFFFF',
            cardBorder: '#E2E8F0',
            pdfLabel: '#64748B',
            pdfName: '#0F172A',
            btnBg: '#0284C7',
            btnText: '#FFFFFF',
            btnPressed: '#0369A1',
          },
    [isDark],
  );

  const cards = useMemo(
    () =>
      generatedCharts.map((item, idx) => ({
        id: item.id || `${idx}`,
        sourcePdf: item.fileName || 'Untitled.pdf',
        uploadedAt: formatRelativeTime(item.createdAt),
        resultUrl: item.resultUrl || '',
        accent: ['#2563EB', '#7C3AED', '#0D9488', '#DB2777'][idx % 4],
      })),
    [generatedCharts],
  );

  const onViewChart = useCallback(async (item) => {
    if (!item.resultUrl) {
      Alert.alert('Chart unavailable', 'This item does not have a generated chart URL yet.');
      return;
    }

    if (Platform.OS === 'web') {
      window.open(item.resultUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      const canOpen = await Linking.canOpenURL(item.resultUrl);
      if (canOpen) {
        await Linking.openURL(item.resultUrl);
        return;
      }
    } catch (error) {
      console.warn('Failed to open chart URL:', error);
    }

    Alert.alert('Unable to open chart', item.resultUrl);
  }, []);

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: t.screenBg }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}>
      <View style={styles.headerBlock}>
        <Text style={[styles.pageTitle, { color: t.title }]}>Generated Charts</Text>
        <Text style={[styles.pageSubtitle, { color: t.subtitle }]}>
          Infographics produced from your PDFs
        </Text>
      </View>

      {cards.length === 0 ? (
        <View style={[styles.emptyState, { borderColor: t.cardBorder, backgroundColor: t.cardBg }]}>
          <MaterialIcons name="insert-chart-outlined" size={40} color={t.btnBg} />
          <Text style={[styles.emptyTitle, { color: t.title }]}>No charts generated yet</Text>
          <Text style={[styles.emptySubtitle, { color: t.subtitle }]}>
            Upload a PDF to generate your first chart.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/UI')}
            style={({ pressed }) => [
              styles.viewBtn,
              {
                marginTop: 14,
                backgroundColor: pressed ? t.btnPressed : t.btnBg,
              },
            ]}>
            <MaterialIcons name="upload-file" size={18} color={t.btnText} />
            <Text style={[styles.viewBtnText, { color: t.btnText }]}>Go to Upload</Text>
          </Pressable>
        </View>
      ) : (
        <View style={[styles.grid, isNarrow && styles.gridNarrow]}>
        {cards.map((item) => (
          <View
            key={item.id}
            style={[
              styles.gridItem,
              isNarrow ? styles.gridItemFull : styles.gridItemHalf,
            ]}>
            <View
              style={[
                styles.chartCard,
                {
                  backgroundColor: t.cardBg,
                  borderColor: t.cardBorder,
                },
              ]}>
              <View style={[styles.iconPlate, { backgroundColor: item.accent }]}>
                <MaterialIcons name="bar-chart" size={44} color="#FFFFFF" />
              </View>

              <View style={styles.cardBody}>
                <Text style={[styles.sourceLabel, { color: t.pdfLabel }]}>Source PDF</Text>
                <Text style={[styles.sourceName, { color: t.pdfName }]} numberOfLines={2}>
                  {item.sourcePdf}
                </Text>
                <Text style={[styles.timestamp, { color: t.subtitle }]}>{item.uploadedAt}</Text>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onViewChart(item)}
                  style={({ pressed }) => [
                    styles.viewBtn,
                    {
                      backgroundColor: pressed ? t.btnPressed : t.btnBg,
                    },
                  ]}>
                  <MaterialIcons name="visibility" size={18} color={t.btnText} />
                  <Text style={[styles.viewBtnText, { color: t.btnText }]}>View Chart</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}
      </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'web' ? 40 : 48,
    paddingBottom: 40,
    maxWidth: 920,
    width: '100%',
    alignSelf: 'center',
  },
  headerBlock: {
    marginBottom: 28,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  gridNarrow: {
    marginHorizontal: 0,
  },
  gridItem: {
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  gridItemHalf: {
    width: '50%',
  },
  gridItemFull: {
    width: '100%',
    paddingHorizontal: 0,
  },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  iconPlate: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: {
    padding: 16,
  },
  sourceLabel: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    marginBottom: 6,
  },
  sourceName: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
    marginBottom: 8,
    minHeight: 42,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  viewBtnText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyState: {
    borderWidth: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default History;
