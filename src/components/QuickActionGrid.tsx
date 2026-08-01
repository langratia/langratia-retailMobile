import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SHADOWS } from '../theme/theme';

interface ActionItem {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  onPress: () => void;
  accessibilityHint: string;
}

interface QuickActionGridProps {
  onAddStock: () => void;
  onRecordSale: () => void;
  onAddExpense: () => void;
  onOpenReports: () => void;
}

export const QuickActionGrid: React.FC<QuickActionGridProps> = ({
  onAddStock,
  onRecordSale,
  onAddExpense,
  onOpenReports,
}) => {
  const actions: ActionItem[] = [
    {
      id: 'add-stock',
      label: 'Add Stock',
      icon: 'add-circle',
      color: COLORS.green,
      bgColor: COLORS.greenBg,
      onPress: onAddStock,
      accessibilityHint: 'Navigates to add or edit product screen to restock inventory',
    },
    {
      id: 'record-sale',
      label: 'Record Sale',
      icon: 'cart',
      color: COLORS.blue,
      bgColor: COLORS.blueBg,
      onPress: onRecordSale,
      accessibilityHint: 'Navigates to sell screen to process a new sale',
    },
    {
      id: 'add-expense',
      label: 'Add Expense',
      icon: 'receipt',
      color: COLORS.amber,
      bgColor: COLORS.amberBg,
      onPress: onAddExpense,
      accessibilityHint: 'Opens transaction modal to log a business expense',
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: 'pie-chart',
      color: COLORS.purple,
      bgColor: COLORS.purpleBg,
      onPress: onOpenReports,
      accessibilityHint: 'Navigates to detailed business analytics and reports',
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.grid}>
        {actions.map((action) => (
          <Pressable
            key={action.id}
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.actionCardPressed,
            ]}
            onPress={action.onPress}
            accessibilityRole="button"
            accessibilityLabel={action.label}
            accessibilityHint={action.accessibilityHint}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: action.bgColor }]}>
              <Ionicons name={action.icon} size={22} color={action.color} />
            </View>
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  actionCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: COLORS.divider,
    minHeight: 56, // Meets enterprise 48dp+ touch target minimum
    ...SHADOWS.small,
  },
  actionCardPressed: {
    opacity: 0.8,
    backgroundColor: COLORS.inputBg,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flexShrink: 1,
  },
});
