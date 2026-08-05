import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  FlatList,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { TransactionItemCard } from '../components/TransactionItemCard';
import { Transaction } from '../types';
import {
  isTimestampToday,
  resolveTransactionTimestamp,
} from '../utils/dateUtils';

export const CashbookScreen = ({ navigation }: any) => {
  const { transactions, settings, deleteTransaction } = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState('All Transactions');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount'>('newest');

  const toggleSort = useCallback(() => {
    if (sortBy === 'newest') setSortBy('oldest');
    else if (sortBy === 'oldest') setSortBy('amount');
    else setSortBy('newest');
  }, [sortBy]);

  // ─── 1. Financial computations ────────────────────────────────────────────
  const { totalIncome, totalExpenses, cashBalance, incomeCount, expenseCount } = useMemo(() => {
    const incTxs = transactions.filter((tx) => tx.type === 'income');
    const expTxs = transactions.filter((tx) => tx.type === 'expense');

    const inc = incTxs.reduce((acc, tx) => acc + tx.amount, 0);
    const exp = expTxs.reduce((acc, tx) => acc + tx.amount, 0);

    return {
      totalIncome: inc,
      totalExpenses: exp,
      cashBalance: inc - exp,
      incomeCount: incTxs.length,
      expenseCount: expTxs.length,
    };
  }, [transactions]);

  // ─── 2. Filtered & sorted transactions ───────────────────────────────────
  const sortedTransactions = useMemo(() => {
    const filtered = transactions.filter((tx) => {
      if (selectedFilter === 'Credit Sales') return tx.isCredit || tx.category === 'Credit Sales';
      if (selectedFilter === 'Income') return tx.type === 'income';
      if (selectedFilter === 'Expense') return tx.type === 'expense';
      if (selectedFilter === 'Today') {
        // CS-01 / GA-05: use createdAt timestamp for reliable "today" detection.
        const ts = resolveTransactionTimestamp(tx.createdAt, tx.date);
        return ts !== null && isTimestampToday(ts);
      }
      return true;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'amount') return b.amount - a.amount;
      // CS-01: sort by createdAt timestamp (reliable) rather than ID string comparison.
      // Fall back to ID comparison for legacy records without createdAt.
      const tsA = resolveTransactionTimestamp(a.createdAt, a.date) ?? 0;
      const tsB = resolveTransactionTimestamp(b.createdAt, b.date) ?? 0;
      if (sortBy === 'oldest') return tsA - tsB;
      return tsB - tsA; // newest first
    });
  }, [transactions, selectedFilter, sortBy]);

  // ─── 3. Delete handler with confirmation ─────────────────────────────────
  // GA-03: Exposes delete UI for transactions. Long-press → confirm → delete.
  const handleDeleteTransaction = useCallback(
    (tx: Transaction) => {
      Alert.alert(
        'Delete Transaction',
        `Delete "${tx.description}" (${tx.type === 'income' ? '+' : '-'}${settings.currency} ${tx.amount.toLocaleString()})?\n\nThis action cannot be undone.${tx.productId ? '\n\nNote: Deleted sale transactions will restore the product stock.' : ''}`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => deleteTransaction(tx.id),
          },
        ]
      );
    },
    [deleteTransaction, settings.currency]
  );

  // ─── 4. List renderers ────────────────────────────────────────────────────
  const renderTransactionItem = useCallback(
    ({ item, index }: { item: Transaction; index: number }) => (
      <TransactionItemCard
        transaction={item}
        currency={settings.currency}
        isLastItem={index === sortedTransactions.length - 1}
        // CS-02: pressing a transaction row navigates to the Statement screen,
        // which shows all transactions. Removed misleading chevron for individual detail
        // — the Statement screen is the full ledger view.
        onPress={() => navigation.navigate('StatementModal')}
        onDelete={() => handleDeleteTransaction(item)}
      />
    ),
    [settings.currency, sortedTransactions.length, navigation, handleDeleteTransaction]
  );

  const renderListHeader = useMemo(
    () => (
      <View style={styles.headerComponentContainer}>
        {/* 3 Stat Cards Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.metricsRow}
          style={{ marginBottom: 12 }}
        >
          <View style={{ width: 150 }}>
            <StatCard
              title="Cash Balance"
              value={`${settings.currency}${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
              trendText="Cash balance"
              iconName="wallet-outline"
              iconColor={COLORS.green}
              iconBgColor={COLORS.greenBg}
            />
          </View>
          <View style={{ width: 150 }}>
            <StatCard
              title="Total Income"
              value={`${settings.currency}${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
              trendText={`${incomeCount} Income entries`}
              iconName="download-outline"
              iconColor={COLORS.blue}
              iconBgColor={COLORS.blueBg}
            />
          </View>
          <View style={{ width: 160 }}>
            <StatCard
              title="Total Expenses"
              value={`${settings.currency}${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
              trendText={`${expenseCount} Expense entries`}
              iconName="arrow-up-circle-outline"
              iconColor={COLORS.red}
              iconBgColor={COLORS.redBg}
            />
          </View>
        </ScrollView>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {['All Transactions', 'Income', 'Expense', 'Credit Sales', 'Today'].map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <Pressable
                key={filter}
                style={({ pressed }) => [
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                  pressed && styles.pressed,
                ]}
                onPress={() => setSelectedFilter(filter)}
                accessibilityRole="button"
                accessibilityLabel={`Filter by ${filter}`}
              >
                <Ionicons
                  name="calendar-outline"
                  size={14}
                  color={isActive ? COLORS.green : COLORS.textSecondary}
                />
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.filterPillTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </Pressable>
            );
          })}

          <Pressable
            style={({ pressed }) => [styles.filterIconBtn, pressed && styles.pressed]}
            onPress={toggleSort}
            accessibilityRole="button"
            accessibilityLabel={`Sort by ${sortBy}`}
            accessibilityHint="Toggles sorting between newest, oldest, and highest amount"
          >
            <Ionicons name="options-outline" size={18} color={COLORS.green} />
          </Pressable>
        </ScrollView>

        {/* Transactions List Header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.listTitle}>All Transactions ({sortedTransactions.length})</Text>
          <Pressable
            style={({ pressed }) => [styles.sortDropdown, pressed && styles.pressed]}
            onPress={toggleSort}
            accessibilityRole="button"
            accessibilityLabel={`Sort order: ${sortBy}`}
          >
            <Ionicons name="swap-vertical" size={14} color={COLORS.green} />
            <Text style={styles.sortText}>
              {sortBy === 'newest' ? 'Newest First' : sortBy === 'oldest' ? 'Oldest First' : 'Highest Amount'}
            </Text>
            <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
          </Pressable>
        </View>
      </View>
    ),
    [
      cashBalance,
      totalIncome,
      totalExpenses,
      incomeCount,
      expenseCount,
      settings.currency,
      selectedFilter,
      sortBy,
      sortedTransactions.length,
      toggleSort,
    ]
  );

  const renderEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyContainer}>
        <Ionicons name="receipt-outline" size={44} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>No Transactions Found</Text>
        <Text style={styles.emptySub}>
          Try adjusting your transaction filter or add a new transaction.
        </Text>
      </View>
    ),
    []
  );

  return (
    <View style={styles.container}>
      <Header
        title="Cash Book"
        showNotification={true}
        rightAction={
          <Pressable
            style={({ pressed }) => [styles.exportBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('StatementModal')}
            accessibilityRole="button"
            accessibilityLabel="View Financial Statement Table"
          >
            <Ionicons name="document-text-outline" size={16} color={COLORS.green} />
            <Text style={styles.exportText}>Statement</Text>
          </Pressable>
        }
      />

      <FlatList
        data={sortedTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        ListHeaderComponent={renderListHeader}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={12}
        maxToRenderPerBatch={10}
        windowSize={5}
        // CS-04: getItemLayout removed — TransactionItemCard has variable height
        // (paddingVertical: 10 + content) so a fixed 52px constant is wrong.
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  headerComponentContainer: {
    marginBottom: 8,
    marginTop: 16,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  exportText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.green,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  filterPillsRow: {
    gap: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
  },
  filterPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.green,
    fontWeight: '700',
  },
  filterIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 14,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  sortDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  sortText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    ...SHADOWS.small,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});
