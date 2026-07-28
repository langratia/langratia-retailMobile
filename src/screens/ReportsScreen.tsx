import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { Header } from '../components/Header';

export const ReportsScreen = () => {
  const { products, transactions, settings } = useAppStore();

  const totalStockValue = products.reduce((acc, p) => acc + p.quantity * p.buyPrice, 0);
  const totalExpectedRevenue = products.reduce((acc, p) => acc + p.quantity * p.sellPrice, 0);
  const expectedProfit = totalExpectedRevenue - totalStockValue;

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const netProfit = totalIncome - totalExpenses;
  const cashBalance = totalIncome - totalExpenses;
  const totalBusinessValue = cashBalance + totalStockValue;

  return (
    <View style={styles.container}>
      <Header title="Reports & Financials" showNotification={false} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subHeader}>Business health & performance analytics</Text>

        {/* Business Value Highlight Card */}
        <View style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <Ionicons name="pie-chart-outline" size={24} color={COLORS.purple} />
            <Text style={styles.highlightTitle}>Total Business Assets</Text>
          </View>
          <Text style={styles.highlightValue}>
            {settings.currency}{totalBusinessValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={styles.highlightSub}>Cash Balance ({settings.currency}{cashBalance.toLocaleString()}) + Stock Value ({settings.currency}{totalStockValue.toLocaleString()})</Text>
        </View>

        {/* Financial Metrics Breakdown */}
        <Text style={styles.sectionTitle}>Financial Breakdown</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Sales (Income)</Text>
            <Text style={[styles.metricValue, { color: COLORS.blue }]}>
              {settings.currency}{totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Expenses</Text>
            <Text style={[styles.metricValue, { color: COLORS.red }]}>
              {settings.currency}{totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Net Cashflow Profit</Text>
            <Text style={[styles.metricValue, { color: netProfit >= 0 ? COLORS.green : COLORS.red }]}>
              {settings.currency}{netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Potential Stock Profit</Text>
            <Text style={[styles.metricValue, { color: COLORS.purple }]}>
              {settings.currency}{expectedProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Summary Sections */}
        <Text style={styles.sectionTitle}>Summary Reports</Text>

        {[
          { title: 'Inventory Valuation Report', desc: `${products.length} products tracking ${products.reduce((a, b) => a + b.quantity, 0)} items`, icon: 'cube-outline', color: COLORS.blue },
          { title: 'Sales & Inflow Report', desc: `${transactions.filter(t => t.type === 'income').length} completed sales records`, icon: 'trending-up-outline', color: COLORS.green },
          { title: 'Expenses & Outflow Report', desc: `${transactions.filter(t => t.type === 'expense').length} business expenses logged`, icon: 'receipt-outline', color: COLORS.amber },
        ].map((item, idx) => (
          <View key={idx} style={styles.reportRow}>
            <View style={[styles.reportIconBox, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>{item.title}</Text>
              <Text style={styles.reportDesc}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </View>
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
    paddingBottom: 40,
  },
  subHeader: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: -8,
    marginBottom: 16,
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
});
