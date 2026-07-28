import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';

interface StatCardProps {
  title: string;
  value: string;
  trendText?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBgColor: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  trendText,
  iconName,
  iconColor,
  iconBgColor,
}) => {
  return (
    <View style={styles.card}>
      <View style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
        <Ionicons name={iconName} size={22} color={iconColor} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text 
        style={[styles.value, { color: iconColor === COLORS.red ? COLORS.red : COLORS.textPrimary }]}
        numberOfLines={1}
        adjustsFontSizeToFit={true}
      >
        {value}
      </Text>
      {trendText ? (
        <View style={styles.trendRow}>
          {trendText.includes('%') && (
            <Ionicons name="trending-up" size={14} color={COLORS.green} style={{ marginRight: 2 }} />
          )}
          <Text style={styles.trendText}>{trendText}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.small,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.green,
  },
});
