import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { Header } from '../components/Header';

export const ReportsScreen = ({ navigation }: any) => {
  const { products, transactions, settings } = useAppStore();
  const [timeRange, setTimeRange] = useState<'All Time' | 'This Month' | 'Today'>('All Time');

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
      <Header
        title="Reports & Financials"
        showNotification={true}
        rightAction={
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('StatementModal')}
          >
            <Ionicons name="document-text-outline" size={16} color={COLORS.green} />
            <Text style={{ fontSize: 13, fontWeight: '600', color: COLORS.green }}>Statement</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.subHeader}>Business health & performance analytics</Text>

        {/* Time Range Filter Pills */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
          {(['All Time', 'This Month', 'Today'] as const).map((range) => {
            const isActive = timeRange === range;
            return (
              <TouchableOpacity
                key={range}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 16,
                  backgroundColor: isActive ? COLORS.greenBg : COLORS.card,
                  borderWidth: 1,
                  borderColor: isActive ? COLORS.green : COLORS.divider,
                }}
                onPress={() => setTimeRange(range)}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: isActive ? '700' : '500',
                    color: isActive ? COLORS.green : COLORS.textSecondary,
                  }}
                >
                  {range}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Business Value Highlight Card */}
        <View style={styles.highlightCard}>
          <View style={styles.highlightHeader}>
            <Ionicons name="pie-chart-outline" size={24} color={COLORS.purple} />
            <Text style={styles.highlightTitle}>Total Business Assets</Text>
          </View>
          <Text 
            style={styles.highlightValue}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {settings.currency} {totalBusinessValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </Text>
          <Text style={styles.highlightSub}>Cash Balance ({settings.currency} {cashBalance.toLocaleString()}) + Stock Value ({settings.currency} {totalStockValue.toLocaleString()})</Text>
        </View>

        {/* Financial Metrics Breakdown */}
        <Text style={styles.sectionTitle}>Financial Breakdown</Text>
        
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Sales (Income)</Text>
            <Text 
              style={[styles.metricValue, { color: COLORS.blue }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {settings.currency} {totalIncome.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Expenses</Text>
            <Text 
              style={[styles.metricValue, { color: COLORS.red }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {settings.currency} {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Net Cashflow Profit</Text>
            <Text 
              style={[styles.metricValue, { color: netProfit >= 0 ? COLORS.green : COLORS.red }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {settings.currency} {netProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Potential Stock Profit</Text>
            <Text 
              style={[styles.metricValue, { color: COLORS.purple }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
            >
              {settings.currency} {expectedProfit.toLocaleString('en-US', { minimumFractionDigits: 0 })}
            </Text>
          </View>
        </View>

        {/* Summary Sections */}
        <Text style={styles.sectionTitle}>Summary Reports</Text>

        {[
          { title: 'Inventory Valuation Report', desc: `${products.length} products tracking ${products.reduce((a, b) => a + b.quantity, 0)} items`, icon: 'cube-outline', color: COLORS.blue, route: 'Inventory' },
          { title: 'Sales & Inflow Report', desc: `${transactions.filter(t => t.type === 'income').length} completed sales records`, icon: 'trending-up-outline', color: COLORS.green, route: 'StatementModal' },
          { title: 'Expenses & Outflow Report', desc: `${transactions.filter(t => t.type === 'expense').length} business expenses logged`, icon: 'receipt-outline', color: COLORS.amber, route: 'StatementModal' },
        ].map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.reportRow}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.7}
          >
            <View style={[styles.reportIconBox, { backgroundColor: item.color + '15' }]}>
              <Ionicons name={item.icon as any} size={22} color={item.color} />
            </View>
            <View style={styles.reportInfo}>
              <Text style={styles.reportTitle}>{item.title}</Text>
              <Text style={styles.reportDesc}>{item.desc}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
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
    paddingBottom: 110,
  },
  subHeader: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 16,
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
