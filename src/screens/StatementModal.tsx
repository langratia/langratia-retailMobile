import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';

export const StatementModal = ({ navigation }: any) => {
  const { transactions, settings } = useAppStore();
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'credit'>('all');

  const filteredTransactions = transactions.filter((tx) => {
    if (filterType === 'income') return tx.type === 'income' && !tx.isCredit;
    if (filterType === 'expense') return tx.type === 'expense';
    if (filterType === 'credit') return tx.isCredit || tx.category === 'Credit Sales';
    return true;
  });

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Compute running balance from oldest to newest, then reverse for display
  const reversedTx = [...filteredTransactions].reverse();
  let currentRunning = 0;
  const tableData = reversedTx.map((tx) => {
    if (tx.type === 'income') {
      currentRunning += tx.amount;
    } else {
      currentRunning -= tx.amount;
    }
    return {
      ...tx,
      runningBalance: currentRunning,
    };
  }).reverse();

  const handleExportStatement = () => {
    Alert.alert(
      'Export Financial Statement',
      `Financial statement for ${settings.businessName} generated successfully!\nTotal Inflow: ${settings.currency} ${totalIncome.toLocaleString()}\nTotal Outflow: ${settings.currency} ${totalExpenses.toLocaleString()}\nNet Balance: ${settings.currency} ${netBalance.toLocaleString()}`
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Financial Statement</Text>
        <TouchableOpacity onPress={handleExportStatement} activeOpacity={0.7}>
          <Ionicons name="share-outline" size={22} color={COLORS.green} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Statement Summary Card */}
        <View style={styles.summaryCard}>
          <Text style={styles.businessTitle}>{settings.businessName}</Text>
          <Text style={styles.statementSub}>Account Statement • Currency: {settings.currency}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Total Inflow</Text>
              <Text style={[styles.statValue, { color: COLORS.green }]}>
                +{settings.currency} {totalIncome.toLocaleString()}
              </Text>
            </View>

            <View style={styles.dividerCol} />

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Total Outflow</Text>
              <Text style={[styles.statValue, { color: COLORS.red }]}>
                -{settings.currency} {totalExpenses.toLocaleString()}
              </Text>
            </View>

            <View style={styles.dividerCol} />

            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Net Balance</Text>
              <Text style={[styles.statValue, { color: netBalance >= 0 ? COLORS.green : COLORS.red }]}>
                {settings.currency} {netBalance.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterContainer}>
          {[
            { id: 'all', label: 'All Entries' },
            { id: 'income', label: 'Inflow (+)' },
            { id: 'expense', label: 'Outflow (-)' },
            { id: 'credit', label: 'Credit (Debt)' },
          ].map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.filterChip,
                filterType === item.id && styles.filterChipActive,
              ]}
              onPress={() => setFilterType(item.id as any)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === item.id && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tabular Statement Table */}
        <Text style={styles.tableTitle}>Transaction Ledger Table</Text>

        <View style={styles.tableCard}>
          {/* Table Header Row */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.thCell, { flex: 2.2 }]}>Date / Item</Text>
            <Text style={[styles.thCell, { flex: 1.2, textAlign: 'center' }]}>Type</Text>
            <Text style={[styles.thCell, { flex: 1.8, textAlign: 'right' }]}>Amount</Text>
            <Text style={[styles.thCell, { flex: 2, textAlign: 'right' }]}>Balance</Text>
          </View>

          {/* Table Body Rows */}
          {tableData.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No statement records found.</Text>
            </View>
          ) : (
            tableData.map((row, index) => {
              const isEven = index % 2 === 0;
              const isIncome = row.type === 'income';
              const isCredit = row.isCredit;

              const typeColor = isCredit
                ? COLORS.amber
                : isIncome
                ? COLORS.green
                : COLORS.red;

              return (
                <View
                  key={row.id}
                  style={[
                    styles.tableBodyRow,
                    { backgroundColor: isEven ? COLORS.card : COLORS.inputBg },
                  ]}
                >
                  {/* Date & Description */}
                  <View style={{ flex: 2.2 }}>
                    <Text style={styles.tdTitle} numberOfLines={1}>
                      {row.description}
                    </Text>
                    <Text style={styles.tdSub}>
                      {row.date} • {row.time}
                    </Text>
                  </View>

                  {/* Type Badge */}
                  <View style={{ flex: 1.2, alignItems: 'center' }}>
                    <View
                      style={[
                        styles.badge,
                        {
                          backgroundColor: isCredit
                            ? COLORS.amberBg
                            : isIncome
                            ? COLORS.greenBg
                            : COLORS.redBg,
                        },
                      ]}
                    >
                      <Text style={[styles.badgeText, { color: typeColor }]}>
                        {isCredit ? 'CREDIT' : isIncome ? 'IN' : 'OUT'}
                      </Text>
                    </View>
                  </View>

                  {/* Amount */}
                  <View style={{ flex: 1.8, alignItems: 'flex-end' }}>
                    <Text style={[styles.tdAmount, { color: typeColor }]}>
                      {isIncome ? '+' : '-'}{row.amount.toLocaleString()}
                    </Text>
                  </View>

                  {/* Running Balance */}
                  <View style={{ flex: 2, alignItems: 'flex-end' }}>
                    <Text style={styles.tdBalance}>
                      {settings.currency} {row.runningBalance.toLocaleString()}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          style={styles.exportFullBtn}
          onPress={handleExportStatement}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text-outline" size={20} color={COLORS.card} />
          <Text style={styles.exportFullBtnText}>Export Full Statement (CSV/PDF)</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.card,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 16,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  businessTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  statementSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 14,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: COLORS.divider,
  },
  statCol: {
    flex: 1,
  },
  dividerCol: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.divider,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  filterChipActive: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.green,
    fontWeight: '700',
  },
  tableTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
  },
  tableCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
    ...SHADOWS.small,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  thCell: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  tableBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: COLORS.divider,
  },
  tdTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  tdSub: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  tdAmount: {
    fontSize: 12,
    fontWeight: '700',
  },
  tdBalance: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  emptyRow: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  exportFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
    borderRadius: 14,
    height: 50,
    gap: 8,
    marginBottom: 20,
  },
  exportFullBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.card,
  },
});
