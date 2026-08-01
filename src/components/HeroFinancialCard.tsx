import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';

interface HeroFinancialCardProps {
  currency: string;
  totalBusinessAssets: number;
  cashBalance: number;
  totalStockValue: number;
  todaysSales: number;
  onPressDetails?: () => void;
}

export const HeroFinancialCard: React.FC<HeroFinancialCardProps> = ({
  currency,
  totalBusinessAssets,
  cashBalance,
  totalStockValue,
  todaysSales,
  onPressDetails,
}) => {
  const formattedAssets = `${currency} ${totalBusinessAssets.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
  const formattedCash = `${currency} ${cashBalance.toLocaleString()}`;
  const formattedStock = `${currency} ${totalStockValue.toLocaleString()}`;
  const formattedToday = `${currency} ${todaysSales.toLocaleString()}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.heroCard,
        pressed && styles.heroCardPressed,
      ]}
      onPress={onPressDetails}
      accessibilityRole="summary"
      accessibilityLabel={`Total Business Assets: ${formattedAssets}. Cash balance: ${formattedCash}. Stock value: ${formattedStock}. Today's sales: ${formattedToday}`}
      accessibilityHint="Shows breakdown of total business assets, cash balance, and stock value"
    >
      <View style={styles.heroHeader}>
        <View style={styles.heroTitleRow}>
          <Ionicons name="pie-chart-sharp" size={18} color={COLORS.green} />
          <Text style={styles.heroTitle}>Total Business Assets</Text>
        </View>
        <View style={styles.liveBadge} accessibilityLabel="Live real-time data">
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      <Text
        style={styles.heroAmount}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
        minimumFontScale={0.7}
      >
        {formattedAssets}
      </Text>
      <Text style={styles.heroSubtitle}>
        Cash Balance ({formattedCash}) + Stock Value ({formattedStock})
      </Text>

      <View style={styles.heroDivider} />

      {/* Sub-metrics breakdown */}
      <View style={styles.heroMetricsRow}>
        <View style={styles.heroMetricItem}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="cash-outline" size={13} color="#CBD5E1" />
            <Text style={styles.heroMetricLabel}>Cash</Text>
          </View>
          <Text style={[styles.heroMetricVal, { color: COLORS.green }]} numberOfLines={1}>
            {formattedCash}
          </Text>
        </View>

        <View style={styles.heroMetricDivider} />

        <View style={styles.heroMetricItem}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="cube-outline" size={13} color="#CBD5E1" />
            <Text style={styles.heroMetricLabel}>Stock</Text>
          </View>
          <Text style={[styles.heroMetricVal, { color: COLORS.blue }]} numberOfLines={1}>
            {formattedStock}
          </Text>
        </View>

        <View style={styles.heroMetricDivider} />

        <View style={styles.heroMetricItem}>
          <View style={styles.metricLabelRow}>
            <Ionicons name="cart-outline" size={13} color="#CBD5E1" />
            <Text style={styles.heroMetricLabel}>Today</Text>
          </View>
          <Text style={[styles.heroMetricVal, { color: COLORS.amber }]} numberOfLines={1}>
            {formattedToday}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  heroCardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.995 }],
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.green,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 16,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 14,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  heroMetricLabel: {
    fontSize: 12,
    color: '#CBD5E1',
    fontWeight: '500',
  },
  heroMetricVal: {
    fontSize: 13,
    fontWeight: '700',
  },
});
