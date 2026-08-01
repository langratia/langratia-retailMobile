import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { COLORS, SHADOWS } from '../theme/theme';
import { Badge } from './Badge';

interface LowStockAlertsWidgetProps {
  lowStockItems: Product[];
  lowStockThreshold: number;
  onViewAll: () => void;
  onItemPress: (item: Product) => void;
}

export const LowStockAlertsWidget: React.FC<LowStockAlertsWidgetProps> = ({
  lowStockItems,
  lowStockThreshold,
  onViewAll,
  onItemPress,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
        <Pressable
          onPress={onViewAll}
          style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`View all ${lowStockItems.length} low stock items`}
        >
          <Text style={styles.viewAllText}>
            View All ({lowStockItems.length})
          </Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.green} />
        </Pressable>
      </View>

      <View style={styles.cardContainer}>
        {lowStockItems.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="shield-checkmark" size={32} color={COLORS.green} />
            </View>
            <Text style={styles.emptyTitle}>All Inventory Healthy!</Text>
            <Text style={styles.emptySub}>
              No items are below your low stock threshold of {lowStockThreshold} units.
            </Text>
          </View>
        ) : (
          lowStockItems.map((item, index) => {
            const isLast = index === lowStockItems.length - 1;
            return (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.alertRow,
                  isLast && { borderBottomWidth: 0 },
                  pressed && styles.alertRowPressed,
                ]}
                onPress={() => onItemPress(item)}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.quantity} units remaining. Low stock.`}
                accessibilityHint="Taps to filter inventory by this item"
              >
                <View style={styles.alertIconBox}>
                  <Ionicons name="cube" size={20} color={COLORS.amber} />
                </View>

                <View style={styles.alertInfo}>
                  <Text style={styles.alertName}>{item.name}</Text>
                  <Text style={styles.alertCategory}>
                    {item.category} • {item.quantity} unit(s) remaining
                  </Text>
                </View>

                <Badge quantity={item.quantity} lowStockThreshold={lowStockThreshold} />
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={COLORS.textMuted}
                  style={{ marginLeft: 8 }}
                />
              </Pressable>
            );
          })
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  sectionHeader: {
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
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.green,
  },
  pressed: {
    opacity: 0.7,
  },
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.small,
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  emptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.greenBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  emptySub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
    minHeight: 52,
  },
  alertRowPressed: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.amberBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
  },
  alertName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  alertCategory: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
