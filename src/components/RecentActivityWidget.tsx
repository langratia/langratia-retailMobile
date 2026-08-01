import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { COLORS, SHADOWS } from '../theme/theme';

interface RecentActivityWidgetProps {
  currency: string;
  transactions: Transaction[];
  onViewCashbook: () => void;
}

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
  currency,
  transactions,
  onViewCashbook,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <Pressable
          onPress={onViewCashbook}
          style={({ pressed }) => [styles.viewAllBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="View full cashbook"
        >
          <Text style={styles.viewAllText}>View Cashbook</Text>
          <Ionicons name="chevron-forward" size={14} color={COLORS.green} />
        </Pressable>
      </View>

      <View style={styles.cardContainer}>
        {transactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={32} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No recent transactions logged yet.</Text>
          </View>
        ) : (
          transactions.map((tx, index) => {
            const isLast = index === transactions.length - 1;
            const isIncome = tx.type === 'income';

            return (
              <Pressable
                key={tx.id}
                style={({ pressed }) => [
                  styles.alertRow,
                  isLast && { borderBottomWidth: 0 },
                  pressed && styles.pressedRow,
                ]}
                onPress={onViewCashbook}
                accessibilityRole="button"
                accessibilityLabel={`${tx.description}, ${tx.date}, ${isIncome ? 'Income' : 'Expense'} of ${currency} ${tx.amount.toLocaleString()}`}
                accessibilityHint="Navigates to cashbook to inspect transactions"
              >
                <View
                  style={[
                    styles.alertIconBox,
                    {
                      backgroundColor: tx.isCredit
                        ? COLORS.amberBg
                        : isIncome
                        ? COLORS.greenBg
                        : COLORS.redBg,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      tx.isCredit
                        ? 'document-text-outline'
                        : isIncome
                        ? 'arrow-down-circle-outline'
                        : 'arrow-up-circle-outline'
                    }
                    size={22}
                    color={
                      tx.isCredit
                        ? COLORS.amber
                        : isIncome
                        ? COLORS.green
                        : COLORS.red
                    }
                  />
                </View>

                <View style={styles.alertInfo}>
                  <Text style={styles.alertName} numberOfLines={1}>
                    {tx.description}
                  </Text>
                  <Text style={styles.alertCategory}>
                    {tx.date} • {tx.category}
                  </Text>
                </View>

                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit={true}
                  style={{
                    fontSize: 14,
                    fontWeight: '700',
                    color: tx.isCredit
                      ? COLORS.amber
                      : isIncome
                      ? COLORS.green
                      : COLORS.red,
                    maxWidth: 110,
                    textAlign: 'right',
                  }}
                >
                  {isIncome ? '+' : '-'}{currency} {tx.amount.toLocaleString()}
                </Text>
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
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
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
  pressedRow: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
    marginRight: 8,
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
