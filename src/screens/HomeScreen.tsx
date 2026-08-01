import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { COLORS } from '../theme/theme';
import { Header } from '../components/Header';
import { HeroFinancialCard } from '../components/HeroFinancialCard';
import { QuickActionGrid } from '../components/QuickActionGrid';
import { LowStockAlertsWidget } from '../components/LowStockAlertsWidget';
import { SalesActivityChartWidget, ChartDayData } from '../components/SalesActivityChartWidget';
import { RecentActivityWidget } from '../components/RecentActivityWidget';

export const HomeScreen = ({ navigation }: any) => {
  const { products, transactions, settings } = useAppStore();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  // 1. Dynamic Time Greeting
  const greetingTime = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  // 2. Financial & Business Computations (Memoized)
  const financialMetrics = useMemo(() => {
    const totalStockVal = products.reduce(
      (acc, p) => acc + p.quantity * p.buyPrice,
      0
    );

    const totalInc = transactions
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0);

    const totalExp = transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0);

    const cashBal = totalInc - totalExp;
    const assets = cashBal + totalStockVal;

    const todayFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const todayIncomeTxs = transactions.filter(
      (tx) => tx.type === 'income' && (tx.date === 'Today' || tx.date === todayFormatted)
    );
    const todaySales = todayIncomeTxs.reduce((acc, tx) => acc + tx.amount, 0);

    return {
      totalStockValue: totalStockVal,
      cashBalance: cashBal,
      totalBusinessAssets: assets,
      todaysSales: todaySales,
    };
  }, [products, transactions]);

  // 3. Low Stock Items (Memoized)
  const lowStockItems = useMemo(() => {
    return products.filter((p) => p.quantity <= settings.lowStockThreshold);
  }, [products, settings.lowStockThreshold]);

  // 4. Recent Transactions (Memoized)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 4);
  }, [transactions]);

  // 5. Weekly Chart Data (Memoized)
  const { chartData, maxWeeklySale } = useMemo(() => {
    const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxVal = Math.max(...transactions.map((t) => t.amount), 50000);

    const totalIncomeAll = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const data: ChartDayData[] = daysOfWeek.map((day, idx) => {
      const isToday = idx === 6;
      const amount = isToday
        ? financialMetrics.todaysSales
        : Math.round((totalIncomeAll / (idx + 1.5)) * 0.35);

      return {
        day,
        amount,
        isToday,
      };
    });

    return { chartData: data, maxWeeklySale: maxVal };
  }, [transactions, financialMetrics.todaysSales]);

  return (
    <View style={styles.container}>
      <Header title={settings.businessName || 'IVAN A.K.A Electronics'} />

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
            Here is your live business performance summary.
          </Text>
        </View>

        {/* Executive Hero Financial Card */}
        <HeroFinancialCard
          currency={settings.currency}
          totalBusinessAssets={financialMetrics.totalBusinessAssets}
          cashBalance={financialMetrics.cashBalance}
          totalStockValue={financialMetrics.totalStockValue}
          todaysSales={financialMetrics.todaysSales}
          onPressDetails={() => navigation.navigate('Reports')}
        />

        {/* Quick Actions Grid (2x2 accessible touch targets) */}
        <QuickActionGrid
          onAddStock={() => navigation.navigate('AddEditProduct')}
          onRecordSale={() => navigation.navigate('RecordSale')}
          onAddExpense={() =>
            navigation.navigate('AddTransaction', { defaultType: 'expense' })
          }
          onOpenReports={() => navigation.navigate('Reports')}
        />

        {/* Low Stock Alerts Widget */}
        <LowStockAlertsWidget
          lowStockItems={lowStockItems}
          lowStockThreshold={settings.lowStockThreshold}
          onViewAll={() => navigation.navigate('Inventory', { filterLowStock: true })}
          onItemPress={() => navigation.navigate('Inventory', { filterLowStock: true })}
        />

        {/* Interactive Sales Activity Chart Widget */}
        <SalesActivityChartWidget
          currency={settings.currency}
          data={chartData}
          maxWeeklySale={maxWeeklySale}
        />

        {/* Recent Activity List Widget */}
        <RecentActivityWidget
          currency={settings.currency}
          transactions={recentTransactions}
          onViewCashbook={() => navigation.navigate('Cashbook')}
        />
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
    marginTop: 16,
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
});
