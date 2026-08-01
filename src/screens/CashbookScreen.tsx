import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { TransactionItemCard } from '../components/TransactionItemCard';

export const CashbookScreen = ({ navigation }: any) => {
  const { transactions, settings } = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState('All Transactions');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'amount'>('newest');

  const toggleSort = () => {
    if (sortBy === 'newest') setSortBy('oldest');
    else if (sortBy === 'oldest') setSortBy('amount');
    else setSortBy('newest');
  };

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const cashBalance = totalIncome - totalExpenses;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedFilter === 'Credit Sales') return tx.isCredit || tx.category === 'Credit Sales';
    if (selectedFilter === 'Income') return tx.type === 'income';
    if (selectedFilter === 'Expense') return tx.type === 'expense';
    if (selectedFilter === 'Today') return tx.date === 'Today' || tx.date === todayFormatted;
    return true;
  });

  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    if (sortBy === 'amount') return b.amount - a.amount;
    if (sortBy === 'oldest') return a.id.localeCompare(b.id);
    return b.id.localeCompare(a.id);
  });

  return (
    <View style={styles.container}>
      <Header
        title="Cash Book"
        showNotification={true}
        rightAction={
          <TouchableOpacity
            style={styles.exportBtn}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('StatementModal')}
          >
            <Ionicons name="document-text-outline" size={16} color={COLORS.green} />
            <Text style={styles.exportText}>Statement</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subHeader}>Track all your money in and out</Text>

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
              trendText={`${transactions.filter(t => t.type === 'income').length} Income entries`}
              iconName="download-outline"
              iconColor={COLORS.blue}
              iconBgColor={COLORS.blueBg}
            />
          </View>
          <View style={{ width: 160 }}>
            <StatCard
              title="Total Expenses"
              value={`${settings.currency}${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}`}
              trendText={`${transactions.filter(t => t.type === 'expense').length} Expense entries`}
              iconName="arrow-up-circle-outline"
              iconColor={COLORS.red}
              iconBgColor={COLORS.redBg}
            />
          </View>
        </ScrollView>

        {/* Date Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {['All Transactions', 'Income', 'Expense', 'Credit Sales', 'Today'].map((filter) => {
            const isActive = selectedFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.7}
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
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.filterIconBtn} onPress={toggleSort} activeOpacity={0.7}>
            <Ionicons name="options-outline" size={18} color={COLORS.green} />
          </TouchableOpacity>
        </ScrollView>

        {/* Transactions List Card Container */}
        <View style={styles.listContainer}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>All Transactions</Text>
            <TouchableOpacity style={styles.sortDropdown} onPress={toggleSort} activeOpacity={0.7}>
              <Ionicons name="swap-vertical" size={14} color={COLORS.green} />
              <Text style={styles.sortText}>
                {sortBy === 'newest' ? 'Newest First' : sortBy === 'oldest' ? 'Oldest First' : 'Highest Amount'}
              </Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          {sortedTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={44} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No Transactions Found</Text>
            </View>
          ) : (
            sortedTransactions.map((tx, index) => (
              <TransactionItemCard
                key={tx.id}
                transaction={tx}
                currency={settings.currency}
                isLastItem={index === sortedTransactions.length - 1}
              />
            ))
          )}
        </View>
      </ScrollView>
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
    paddingBottom: 90,
  },
  subHeader: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 16,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
    marginBottom: 20,
    alignItems: 'center',
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
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
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  filterPillTextActive: {
    color: COLORS.green,
    fontWeight: '700',
  },
  filterIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.small,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  sortText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
});
