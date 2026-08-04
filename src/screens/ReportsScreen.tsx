import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { Header } from '../components/Header';

export const ReportsScreen = ({ navigation }: any) => {
  const { products, transactions, settings } = useAppStore();
  const [timeRange, setTimeRange] = useState<'All Time' | 'This Month' | 'Today'>('All Time');

  // Dynamic Financial Analytics Computation (Memoized)
  const analytics = useMemo(() => {
    const todayFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const now = new Date();
    const currentMonthName = now.toLocaleDateString('en-US', { month: 'short' });

    // Filter transactions by time horizon
    const filteredTxs = transactions.filter((t) => {
      if (timeRange === 'Today') {
        return t.date === 'Today' || t.date === todayFormatted;
      }
      if (timeRange === 'This Month') {
        return t.date.includes(currentMonthName) || t.date === 'Today' || t.date === 'Yesterday';
      }
      return true; // All Time
    });

    const stockVal = products.reduce((acc, p) => acc + p.quantity * p.buyPrice, 0);
    const expectedRev = products.reduce((acc, p) => acc + p.quantity * p.sellPrice, 0);
    const expProfit = expectedRev - stockVal;

    const income = filteredTxs
      .filter((t) => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = filteredTxs
      .filter((t) => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    const netProf = income - expenses;
    const cashBal = income - expenses;
    const totalAssets = cashBal + stockVal;
    const incomeCount = filteredTxs.filter((t) => t.type === 'income').length;
    const expenseCount = filteredTxs.filter((t) => t.type === 'expense').length;

    return {
      totalStockValue: stockVal,
      totalExpectedRevenue: expectedRev,
      expectedProfit: expProfit,
      totalIncome: income,
      totalExpenses: expenses,
      netProfit: netProf,
      cashBalance: cashBal,
      totalBusinessValue: totalAssets,
      incomeCount,
      expenseCount,
    };
  }, [products, transactions, timeRange]);

  return (
    <View style={styles.container}>
      <Header
        title="Reports & Financials"
        showNotification={true}
        rightAction={
          <Pressable
            style={({ pressed }) => [styles.exportBtn, pressed && styles.pressed]}
            onPress={() => navigation.navigate('StatementModal')}
            accessibilityRole="button"
            accessibilityLabel="Open Statement Modal"
          >
            <Ionicons name="document-text-outline" size={16} color={COLORS.green} />
            <Text style={styles.exportText}>Statement</Text>
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Time Range Filter Pills */}
        <View style={styles.filterPillsRow}>
          {(['All Time', 'This Month', 'Today'] as const).map((range) => {
            const isActive = timeRange === range;
            return (
              <Pressable
                key={range}
                style={({ pressed }) => [
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                  pressed && styles.pressed,
                ]}
                onPress={() => setTimeRange(range)}
                accessibilityRole="button"
                accessibilityLabel={`Time range: ${range}`}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    isActive && styles.filterPillTextActive,
                  ]}
                >
                  {range}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Business Value Highlight Card */}
        <View style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <Ionicons name="pie-chart-outline" size={24} color={COLORS.purple} />
            <Text style={styles.highlightTitle}>Total Business Assets ({timeRange})</Text>
          </View>
          <Text
            style={styles.highlightValue}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {settings.currency} {analytics.totalBusinessValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
          <Text style={styles.highlightSub}>
            Cash Balance ({settings.currency} {analytics.cashBalance.toLocaleString()}) + Stock Value ({settings.currency} {analytics.totalStockValue.toLocaleString()})
          </Text>
        </View>

        {/* Financial Metrics Breakdown */}
        <Text style={styles.sectionTitle}>Financial Breakdown ({timeRange})</Text>

        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Sales (Income)</Text>
            <Text
              style={[styles.metricValue, { color: COLORS.blue }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {settings.currency} {analytics.totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Expenses</Text>
            <Text
              style={[styles.metricValue, { color: COLORS.red }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {settings.currency} {analytics.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Net Cashflow Profit</Text>
            <Text
              style={[styles.metricValue, { color: analytics.netProfit >= 0 ? COLORS.green : COLORS.red }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {settings.currency} {analytics.netProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Potential Stock Profit</Text>
            <Text
              style={[styles.metricValue, { color: COLORS.purple }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {settings.currency} {analytics.expectedProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

        {/* Summary Sections */}
        <Text style={styles.sectionTitle}>Summary Reports</Text>

        {[
          {
            title: 'Inventory Valuation Report',
            desc: `${products.length} products tracking ${products.reduce((a, b) => a + b.quantity, 0)} items`,
            icon: 'cube-outline',
            color: COLORS.blue,
            route: 'Inventory',
          },
          {
            title: 'Sales & Inflow Report',
            desc: `${analytics.incomeCount} completed sales records (${timeRange})`,
            icon: 'trending-up-outline',
            color: COLORS.green,
            route: 'StatementModal',
          },
          {
            title: 'Expenses & Outflow Report',
            desc: `${analytics.expenseCount} business expenses logged (${timeRange})`,
            icon: 'receipt-outline',
            color: COLORS.amber,
            route: 'StatementModal',
          },
        ].map((item, idx) => (
          <Pressable
            key={idx}
            style={({ pressed }) => [styles.reportRow, pressed && styles.pressed]}
            onPress={() => navigation.navigate(item.route)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${item.desc}`}
            accessibilityHint={`Navigates to ${item.route}`}
          >
            <View style={[styles.reportIconBox, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>{item.title}</Text>
              <Text style={styles.reportDesc}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </Pressable>
        ))}
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
    paddingTop: 16,
    paddingBottom: 110,
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
  filterPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
    alignItems: 'center',
    justifyContent: 'center',
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
  highlightCard: {
    backgroundColor: COLORS.purpleBg,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#DDD6FE',
    marginBottom: 24,
    ...SHADOWS.small,
  },
  highlightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.purple,
  },
  highlightValue: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  highlightSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 14,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    minHeight: 70,
    ...SHADOWS.small,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  reportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    minHeight: 56,
    marginBottom: 10,
    ...SHADOWS.small,
  },
  reportIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reportInfo: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  reportDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  pressed: {
    opacity: 0.7,
  },
});
