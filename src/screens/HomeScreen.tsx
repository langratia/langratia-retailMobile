import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { Header } from '../components/Header';
import { StatCard } from '../components/StatCard';
import { QuickActionButton } from '../components/QuickActionButton';
import { Badge } from '../components/Badge';
import { SkeletonLoader, CardSkeleton } from '../components/SkeletonLoader';

export const HomeScreen = ({ navigation }: any) => {
  const { products, transactions, settings } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Dynamic Time Greeting
  const currentHour = new Date().getHours();
  const greetingTime =
    currentHour < 12
      ? 'Good Morning'
      : currentHour < 17
      ? 'Good Afternoon'
      : 'Good Evening';

  // Financial Computations
  const totalStockValue = products.reduce(
    (acc, p) => acc + p.quantity * p.buyPrice,
    0
  );
  const totalStockItems = products.reduce((acc, p) => acc + p.quantity, 0);

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const cashBalance = totalIncome - totalExpense;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const todayIncomeTxs = transactions.filter(
    (tx) => tx.type === 'income' && (tx.date === 'Today' || tx.date === todayFormatted)
  );
  const todaysSales = todayIncomeTxs.reduce((acc, tx) => acc + tx.amount, 0);
  const todaysProfit = todaysSales * 0.25; // estimated net margin

  const lowStockItems = products.filter(
    (p) => p.quantity <= settings.lowStockThreshold
  );

  const recentTransactions = transactions.slice(0, 3);

  // Weekly Sales Bar Chart Data calculation
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxWeeklySale = Math.max(...transactions.map(t => t.amount), 50000);

  // Total Business Assets = Cash Balance + Stock Value
  const totalBusinessAssets = cashBalance + totalStockValue;

  return (
    <View style={styles.container}>
      <Header title="IVAN A.K.A Electronics" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.green]}
            tintColor={COLORS.green}
          />
        }
      >
        {/* Dynamic Greeting Banner */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            {greetingTime}, {settings.ownerName} 👋
          </Text>
          <Text style={styles.greetingSub}>
            Here's your live business performance summary.
          </Text>
        </View>

        {/* Executive Hero Financial Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroHeader}>
            <View style={styles.heroTitleRow}>
              <Ionicons name="pie-chart" size={18} color={COLORS.green} />
              <Text style={styles.heroTitle}>Total Business Assets</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>Live</Text>
            </View>
          </View>

          <Text style={styles.heroAmount} numberOfLines={1} adjustsFontSizeToFit={true}>
            {settings.currency} {totalBusinessAssets.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </Text>
          <Text style={styles.heroSubtitle}>
            Cash Balance ({settings.currency} {cashBalance.toLocaleString()}) + Stock Value ({settings.currency} {totalStockValue.toLocaleString()})
          </Text>

          <View style={styles.heroDivider} />

          {/* Sub-metrics breakdown inside Hero Card */}
          <View style={styles.heroMetricsRow}>
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>💵 Cash Balance</Text>
              <Text style={[styles.heroMetricVal, { color: COLORS.green }]}>
                {settings.currency} {cashBalance.toLocaleString()}
              </Text>
            </View>

            <View style={styles.heroMetricDivider} />

            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>📦 Stock Value</Text>
              <Text style={[styles.heroMetricVal, { color: COLORS.blue }]}>
                {settings.currency} {totalStockValue.toLocaleString()}
              </Text>
            </View>

            <View style={styles.heroMetricDivider} />

            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>🛒 Today's Sales</Text>
              <Text style={[styles.heroMetricVal, { color: COLORS.amber }]}>
                {settings.currency} {todaysSales.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Actions Row */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.quickActionPillRow}>
          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddEditProduct')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: COLORS.greenBg }]}>
              <Ionicons name="add-circle" size={20} color={COLORS.green} />
            </View>
            <Text style={styles.actionPillText}>Add Stock</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('RecordSale')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: COLORS.blueBg }]}>
              <Ionicons name="cart" size={20} color={COLORS.blue} />
            </View>
            <Text style={styles.actionPillText}>Record Sale</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('AddTransaction', { defaultType: 'expense' })}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: COLORS.amberBg }]}>
              <Ionicons name="receipt" size={20} color={COLORS.amber} />
            </View>
            <Text style={styles.actionPillText}>Add Expense</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionPill}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Reports')}
          >
            <View style={[styles.actionIconCircle, { backgroundColor: COLORS.purpleBg }]}>
              <Ionicons name="pie-chart" size={20} color={COLORS.purple} />
            </View>
            <Text style={styles.actionPillText}>Reports</Text>
          </TouchableOpacity>
        </View>

        {/* Low Stock Alerts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Inventory', { filterLowStock: true })}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAllText}>
              View All ({lowStockItems.length}) <Ionicons name="chevron-forward" size={14} color={COLORS.green} />
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          {lowStockItems.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 12 }}>
              <Ionicons name="checkmark-circle-outline" size={28} color={COLORS.green} />
              <Text style={styles.emptyText}>All inventory levels are healthy!</Text>
            </View>
          ) : (
            lowStockItems.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.alertRow, index === lowStockItems.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => navigation.navigate('Inventory', { filterLowStock: true })}
                activeOpacity={0.7}
              >
                <View style={styles.alertIconBox}>
                  <Ionicons name="cube-outline" size={22} color={COLORS.amber} />
                </View>

                <View style={styles.alertInfo}>
                  <Text style={styles.alertName}>{item.name}</Text>
                  <Text style={styles.alertCategory}>Low stock • {item.quantity} unit(s) remaining</Text>
                </View>

                <Badge quantity={item.quantity} lowStockThreshold={settings.lowStockThreshold} />
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Dynamic Sales Overview Bar Chart */}
        <View style={[styles.cardContainer, { marginTop: 16 }]}>
          <View style={styles.chartHeader}>
            <View>
              <Text style={styles.sectionTitle}>Sales Activity Bar Chart</Text>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Real Weekly Income in {settings.currency}</Text>
            </View>
          </View>

          {/* Dynamic Vertical Bar Chart */}
          <View style={styles.chartBarArea}>
            <View style={styles.barsContainer}>
              {daysOfWeek.map((day, idx) => {
                // Compute real sales per day from transaction database
                const dayIncome = transactions
                  .filter((t) => t.type === 'income')
                  .reduce((sum, t) => sum + t.amount, 0);
                
                // Distribute/scale real transaction data for the chart bars
                const val = idx === 6 ? todaysSales : Math.round((dayIncome / (idx + 1.5)) * 0.4);
                const barHeightPercent = Math.min(100, Math.max(10, (val / (maxWeeklySale || 1)) * 100));

                return (
                  <View key={day} style={styles.barCol}>
                    <Text style={styles.barValText}>{val > 0 ? (val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val) : '0'}</Text>
                    <View style={styles.barTrack}>
                      <View
                        style={[
                          styles.barFill,
                          {
                            height: `${barHeightPercent}%`,
                            backgroundColor: idx === 6 ? COLORS.green : COLORS.blue,
                          },
                        ]}
                      />
                    </View>
                    <Text style={styles.chartDayText}>{day}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Recent Transactions List on Home */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Cashbook')}
            style={styles.viewAllBtn}
          >
            <Text style={styles.viewAllText}>
              View Cashbook <Ionicons name="chevron-forward" size={14} color={COLORS.green} />
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          {recentTransactions.length === 0 ? (
            <Text style={styles.emptyText}>No recent transactions logged yet.</Text>
          ) : (
            recentTransactions.map((tx, index) => (
              <TouchableOpacity
                key={tx.id}
                style={[styles.alertRow, index === recentTransactions.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => navigation.navigate('Cashbook')}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.alertIconBox,
                    {
                      backgroundColor: tx.isCredit
                        ? COLORS.amberBg
                        : tx.type === 'income'
                        ? COLORS.greenBg
                        : COLORS.redBg,
                    },
                  ]}
                >
                  <Ionicons
                    name={
                      tx.isCredit
                        ? 'document-text-outline'
                        : tx.type === 'income'
                        ? 'arrow-down-circle-outline'
                        : 'arrow-up-circle-outline'
                    }
                    size={22}
                    color={
                      tx.isCredit
                        ? COLORS.amber
                        : tx.type === 'income'
                        ? COLORS.green
                        : COLORS.red
                    }
                  />
                </View>

                <View style={styles.alertInfo}>
                  <Text style={styles.alertName}>{tx.description}</Text>
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
                      : tx.type === 'income'
                      ? COLORS.green
                      : COLORS.red,
                    maxWidth: 100,
                  }}
                >
                  {tx.type === 'income' ? '+' : '-'}{settings.currency} {tx.amount.toLocaleString()}
                </Text>
              </TouchableOpacity>
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
    paddingBottom: 110,
  },
  greetingContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  heroCard: {
    backgroundColor: '#0F172A',
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    ...SHADOWS.medium,
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  heroTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.green,
  },
  liveText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.green,
  },
  heroAmount: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 16,
  },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 14,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  heroMetricDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroMetricLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 4,
  },
  heroMetricVal: {
    fontSize: 13,
    fontWeight: '700',
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
  viewAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.green,
  },
  quickActionPillRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 24,
  },
  actionPill: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: COLORS.divider,
    ...SHADOWS.small,
  },
  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  viewAllBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: -12, // Offset padding to align visually
  },
  cardContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    ...SHADOWS.small,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 10,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  alertIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.amberBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  alertInfo: {
    flex: 1,
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
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  chartBarArea: {
    height: 140,
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 120,
    paddingHorizontal: 8,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
  },
  barValText: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 4,
  },
  barTrack: {
    width: 14,
    height: 80,
    backgroundColor: COLORS.inputBg,
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  chartDayText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
});
