import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Transaction } from '../types';
import { COLORS } from '../theme/theme';

interface TransactionItemCardProps {
  transaction: Transaction;
  currency?: string;
  onPress?: () => void;
  isLastItem?: boolean;
}

export const TransactionItemCard: React.FC<TransactionItemCardProps> = ({
  transaction,
  currency = 'UGX',
  onPress,
  isLastItem = false,
}) => {
  const isCredit = transaction.isCredit;
  const isIncome = transaction.type === 'income';
  const iconName = isCredit
    ? 'document-text-outline'
    : isIncome
    ? 'download-outline'
    : 'upload-outline';
  const iconBg = isCredit
    ? COLORS.amberBg
    : isIncome
    ? COLORS.greenBg
    : COLORS.redBg;
  const iconColor = isCredit
    ? COLORS.amber
    : isIncome
    ? COLORS.green
    : COLORS.red;
  const amountColor = isCredit
    ? COLORS.amber
    : isIncome
    ? COLORS.green
    : COLORS.red;
  const amountSign = isIncome ? '+' : '-';

  const formattedAmount = `${amountSign}${currency} ${transaction.amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        isLastItem && { borderBottomWidth: 0 },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${transaction.description}, ${transaction.date} at ${transaction.time}, ${isCredit ? 'Credit debt' : isIncome ? 'Income' : 'Expense'} of ${formattedAmount}`}
      accessibilityHint={onPress ? 'Taps to view full transaction details' : undefined}
    >
      <View style={[styles.iconCircle, { backgroundColor: iconBg }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>

      <View style={styles.detailsCol}>
        <Text style={styles.description} numberOfLines={1} ellipsizeMode="tail">
          {transaction.description}
        </Text>
        <View style={styles.subRow}>
          <Text style={styles.dateTime} numberOfLines={1}>
            {transaction.date}, {transaction.time}
          </Text>
          <View style={[styles.typeBadge, { backgroundColor: iconBg }]}>
            <View style={[styles.bullet, { backgroundColor: iconColor }]} />
            <Text style={[styles.typeText, { color: iconColor }]}>
              {isCredit ? 'Credit' : isIncome ? 'Income' : 'Expense'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.amountCol}>
        <Text
          style={[styles.amountText, { color: amountColor }]}
          numberOfLines={1}
          adjustsFontSizeToFit={true}
          minimumFontScale={0.75}
        >
          {formattedAmount}
        </Text>
        <Text style={styles.categoryText} numberOfLines={1}>
          {transaction.category}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} style={styles.chevron} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    minHeight: 52,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  pressed: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 8,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    flexShrink: 0,
  },
  detailsCol: {
    flex: 1,
    marginRight: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 3,
  },
  subRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  dateTime: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
  },
  bullet: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  amountCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginRight: 4,
    minWidth: 84,
    flexShrink: 0,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
    textAlign: 'right',
  },
  categoryText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  chevron: {
    marginLeft: 2,
    flexShrink: 0,
  },
});
