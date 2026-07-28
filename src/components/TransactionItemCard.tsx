import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { COLORS } from '../theme/theme';

interface TransactionItemCardProps {
  transaction: Transaction;
  currency?: string;
  onPress?: () => void;
}

export const TransactionItemCard: React.FC<TransactionItemCardProps> = ({
  transaction,
  currency = 'UGX',
  onPress,
}) => {
  const isCredit = transaction.isCredit;
  const isIncome = transaction.type === 'income';
  const iconName = isCredit ? 'document-text-outline' : isIncome ? 'download-outline' : 'upload-outline';
  const iconBg = isCredit ? COLORS.amberBg : isIncome ? COLORS.greenBg : COLORS.redBg;
  const iconColor = isCredit ? COLORS.amber : isIncome ? COLORS.green : COLORS.red;
  const amountColor = isCredit ? COLORS.amber : isIncome ? COLORS.green : COLORS.red;
  const amountSign = isIncome ? '+' : '-';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={20} color={iconColor} />
      </View>

      <View style={styles.detailsCol}>
        <Text style={styles.description}>{transaction.description}</Text>
        <View style={styles.subRow}>
          <Text style={styles.dateTime}>
            {transaction.date}, {transaction.time}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: iconBg }]}>
            <View style={[styles.bullet, { backgroundColor: iconColor }]} />
            <Text style={[styles.typeText, { color: iconColor }]}>
              {isCredit ? 'Credit (Debt)' : isIncome ? 'Income' : 'Expense'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.amountCol}>
        <Text style={[styles.amountText, { color: amountColor }]}>
          {amountSign}{currency}{transaction.amount.toFixed(2)}
        </Text>
        <Text style={styles.categoryText}>{transaction.category}</Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={styles.chevron} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  detailsCol: {
    flex: 1,
  },
  description: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  bullet: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  amountCol: {
    alignItems: 'flex-end',
    marginRight: 6,
  },
  amountText: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  chevron: {
    marginLeft: 2,
  },
});
