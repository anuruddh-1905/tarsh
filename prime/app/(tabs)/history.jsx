import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { useColorScheme } from '@/hooks/useColorScheme';

const MOCK_CHARTS = [
  {
    id: '1',
    sourcePdf: 'Project_Alpha_Summary.pdf',
    accent: '#2563EB',
  },
  {
    id: '2',
    sourcePdf: 'Q4_Revenue_Deck.pdf',
    accent: '#7C3AED',
  },
  {
    id: '3',
    sourcePdf: 'Marketing_Brief_v3.pdf',
    accent: '#0D9488',
  },
  {
    id: '4',
    sourcePdf: 'Research_Findings_Final.pdf',
    accent: '#DB2777',
  },
];

const History = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { width } = useWindowDimensions();
  const isNarrow = width < 520;

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

  const onViewChart = useCallback((sourcePdf) => {
    if (Platform.OS === 'web' && typeof alert === 'function') {
      alert(`View chart from: ${sourcePdf}`);
      return;
    }
    Alert.alert('View chart', sourcePdf);
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

      <View style={[styles.grid, isNarrow && styles.gridNarrow]}>
        {MOCK_CHARTS.map((item) => (
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
                <Pressable
                  accessibilityRole="button"
                  onPress={() => onViewChart(item.sourcePdf)}
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
    marginBottom: 16,
    minHeight: 42,
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
});

export default History;
