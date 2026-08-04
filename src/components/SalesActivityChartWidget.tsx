import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';

export interface ChartDayData {
  day: string;
  amount: number;
  isToday?: boolean;
}

interface SalesActivityChartWidgetProps {
  currency: string;
  data: ChartDayData[];
  maxWeeklySale: number;
}

export const SalesActivityChartWidget: React.FC<SalesActivityChartWidgetProps> = ({
  currency,
  data,
  maxWeeklySale,
}) => {
  // CW-02: default selection = last day with actual sales; fall back to today's index
  const defaultIdx = (() => {
    for (let i = data.length - 1; i >= 0; i--) {
      if (data[i].amount > 0) return i;
    }
    return data.length - 1;
  })();
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(defaultIdx);

  const selectedData = selectedDayIdx !== null ? data[selectedDayIdx] : null;

  return (
    <View style={styles.container}>
      <View style={styles.chartHeader}>
        <View>
          <Text style={styles.sectionTitle}>Sales Activity</Text>
          <Text style={styles.chartSub}>Weekly Income in {currency}</Text>
        </View>
        <Ionicons name="bar-chart-outline" size={20} color={COLORS.textSecondary} />
      </View>

      {/* Selected Day Tooltip Display */}
      {selectedData && (
        <View style={styles.tooltipBanner}>
          <Text style={styles.tooltipDayText}>
            {selectedData.isToday ? 'Today' : selectedData.day}:
          </Text>
          <Text style={styles.tooltipValText}>
            {currency} {selectedData.amount.toLocaleString()}
          </Text>
        </View>
      )}

      {/* Interactive Bar Chart Area */}
      <View
        style={styles.chartBarArea}
        accessibilityRole="image"
        accessibilityLabel={`Sales chart for the week. Highest sale: ${currency} ${maxWeeklySale.toLocaleString()}`}
      >
        <View style={styles.barsContainer}>
          {data.map((item, idx) => {
            const isSelected = selectedDayIdx === idx;
            // CW-01: zero-amount bars render at 0 height (flat baseline), not 12%.
            const barHeightPercent =
              item.amount > 0
                ? Math.min(100, Math.max(12, (item.amount / (maxWeeklySale || 1)) * 100))
                : 0;

            return (
              <Pressable
                key={item.day}
                style={styles.barCol}
                onPress={() => setSelectedDayIdx(idx)}
                accessibilityRole="button"
                accessibilityLabel={`${item.day}: ${currency} ${item.amount.toLocaleString()}`}
                accessibilityHint="Tap to inspect daily total"
              >
                <Text style={[styles.barValText, isSelected && styles.selectedValText]}>
                  {item.amount > 0
                    ? item.amount >= 1000
                      ? `${(item.amount / 1000).toFixed(0)}k`
                      : item.amount
                    : '0'}
                </Text>

                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${barHeightPercent}%`,
                        backgroundColor: isSelected
                          ? COLORS.green
                          : item.isToday
                          ? COLORS.green
                          : COLORS.blue,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={[
                    styles.chartDayText,
                    isSelected && styles.selectedDayText,
                  ]}
                >
                  {item.day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    ...SHADOWS.small,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  chartSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  tooltipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 14,
    gap: 6,
  },
  tooltipDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.green,
  },
  tooltipValText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.green,
  },
  chartBarArea: {
    height: 140,
    justifyContent: 'flex-end',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: 4,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 4,
  },
  barValText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  selectedValText: {
    color: COLORS.green,
    fontWeight: '800',
  },
  barTrack: {
    width: 16,
    height: 76,
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  chartDayText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  selectedDayText: {
    color: COLORS.green,
    fontWeight: '700',
  },
});
