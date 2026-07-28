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

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const cashBalance = 12450.0; // Styled as per mockup or totalIncome - totalExpenses

  const filteredTransactions = transactions.filter((tx) => {
    if (selectedFilter === 'Today') return tx.date === 'Today';
    if (selectedFilter === 'This Week') return tx.date === 'Today' || tx.date === 'Yesterday';
    if (selectedFilter === 'This Month') return true;
    return true;
  });

  return (
    <View style={styles.container}>
      <Header
        title="Cash Book"
        showNotification={false}
        rightAction={
          <TouchableOpacity style={styles.exportBtn} activeOpacity={0.7}>
            <Ionicons name="download-outline" size={16} color={COLORS.green} />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subHeader}>Track all your money in and out</Text>

        {/* 3 Stat Cards Row */}
        <View style={styles.metricsRow}>
          <StatCard
            title="Cash Balance"
            value={`${settings.currency}${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            trendText="8.5% from last month"
            iconName="wallet-outline"
            iconColor={COLORS.green}
            iconBgColor={COLORS.greenBg}
          />
          <StatCard
            title="Total Income"
            value={`${settings.currency}${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            trendText={`${transactions.filter(t => t.type === 'income').length} Transactions`}
            iconName="download-outline"
            iconColor={COLORS.blue}
            iconBgColor={COLORS.blueBg}
          />
          <StatCard
            title="Total Expenses"
            value={`${settings.currency}${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            trendText={`${transactions.filter(t => t.type === 'expense').length} Transactions`}
            iconName="upload-outline"
            iconColor={COLORS.red}
            iconBgColor={COLORS.redBg}
          />
        </View>

        {/* Date Filter Pills */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterPillsRow}
        >
          {['All Transactions', 'Today', 'This Week', 'This Month'].map((filter) => {
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

          <TouchableOpacity style={styles.filterIconBtn}>
            <Ionicons name="options-outline" size={18} color={COLORS.textPrimary} />
          </TouchableOpacity>
        </ScrollView>

        {/* Transactions List Card Container */}
        <View style={styles.listContainer}>
          <View style={styles.listHeaderRow}>
            <Text style={styles.listTitle}>All Transactions</Text>
            <View style={styles.sortDropdown}>
              <Ionicons name="swap-vertical" size={14} color={COLORS.textSecondary} />
              <Text style={styles.sortText}>Newest First</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
            </View>
          </View>

          {filteredTransactions.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={44} color={COLORS.textMuted} />
              <Text style={styles.emptyText}>No Transactions Found</Text>
            </View>
          ) : (
            filteredTransactions.map((tx) => (
              <TransactionItemCard
                key={tx.id}
                transaction={tx}
                currency={settings.currency}
              />
            ))
          )}
        </View>
      </ScrollView>

      {/* Green Floating Action Button (FAB) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddTransaction')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={30} color={COLORS.card} />
      </TouchableOpacity>
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
    marginTop: -8,
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
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.fab,
  },
});
