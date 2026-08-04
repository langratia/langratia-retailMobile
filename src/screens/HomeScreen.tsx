import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { COLORS } from '../theme/theme';
import { Header } from '../components/Header';
import { HeroFinancialCard } from '../components/HeroFinancialCard';
import { QuickActionGrid } from '../components/QuickActionGrid';
import { LowStockAlertsWidget } from '../components/LowStockAlertsWidget';
import { SalesActivityChartWidget, ChartDayData } from '../components/SalesActivityChartWidget';
import { RecentActivityWidget } from '../components/RecentActivityWidget';
import { Product } from '../types';
import {
  isTimestampToday,
  resolveTransactionTimestamp,
  getDayOfWeek,
} from '../utils/dateUtils';

// Maps JS getDay() values (0 = Sun … 6 = Sat) to display labels ordered Mon→Sun
const DAY_LABELS: string[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
// Index offset: JS getDay() returns 0 for Sun, so Mon = 1, Tue = 2 … Sun = 0
// Our chart array index 0 = Mon, 6 = Sun → map: chartIdx = (getDay() + 6) % 7
const jsGetDayToChartIdx = (getDay: number) => (getDay + 6) % 7;

export const HomeScreen = ({ navigation }: any) => {
  const { products, transactions, settings } = useAppStore();

  // ─── 1. Dynamic greeting (evaluated fresh each render — not memoized)
  //         so it always reflects the actual current hour.
  const greetingTime = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  // ─── 2. Financial metrics
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

    // Reliable "today" check: use createdAt timestamp when available,
    // fall back to parsing the legacy date string. Both paths are handled
    // by resolveTransactionTimestamp() in dateUtils.
    const todaySales = transactions
      .filter((tx) => {
        if (tx.type !== 'income') return false;
        const ts = resolveTransactionTimestamp(tx.createdAt, tx.date);
        return ts !== null && isTimestampToday(ts);
      })
      .reduce((acc, tx) => acc + tx.amount, 0);

    return {
      totalStockValue: totalStockVal,
      cashBalance: cashBal,
      totalBusinessAssets: assets,
      todaysSales: todaySales,
    };
  }, [products, transactions]);

  // ─── 3. Low-stock items
  const lowStockItems = useMemo(
    () => products.filter((p) => p.quantity <= settings.lowStockThreshold),
    [products, settings.lowStockThreshold]
  );

  // ─── 4. Recent transactions (last 4)
  const recentTransactions = useMemo(() => transactions.slice(0, 4), [transactions]);

  // ─── 5. Weekly chart — real income per weekday (Mon–Sun)
  //         Uses actual transaction data rather than a synthetic formula.
  const { chartData, maxWeeklySale } = useMemo(() => {
    // Accumulate income amounts into a 7-element array indexed Mon(0)–Sun(6)
    const dailyIncome = new Array<number>(7).fill(0);
    const today = new Date();
    const todayChartIdx = jsGetDayToChartIdx(today.getDay());

    for (const tx of transactions) {
      if (tx.type !== 'income') continue;
      const ts = resolveTransactionTimestamp(tx.createdAt, tx.date);
      if (ts == null) continue;

      // Only include transactions from the current ISO week (Mon–Sun)
      const txDate = new Date(ts);
      const diffDays = Math.floor(
        (today.setHours(0, 0, 0, 0) - txDate.setHours(0, 0, 0, 0)) / 86_400_000
      );
      if (diffDays < 0 || diffDays > 6) continue;

      const chartIdx = jsGetDayToChartIdx(new Date(ts).getDay());
      dailyIncome[chartIdx] += tx.amount;
    }

    const data: ChartDayData[] = DAY_LABELS.map((day, idx) => ({
      day,
      amount: dailyIncome[idx],
      isToday: idx === todayChartIdx,
    }));

    const maxVal = Math.max(...dailyIncome, 50_000);

    return { chartData: data, maxWeeklySale: maxVal };
  }, [transactions]);

  // ─── 6. Handlers
  const handleLowStockItemPress = useCallback(
    (item: Product) => {
      navigation.navigate('ProductDetails', { productId: item.id });
    },
    [navigation]
  );

  return (
    <View style={styles.container}>
      <Header title={settings.businessName || 'IVAN A.K.A Electronics'} />

      {/* Removed cosmetic RefreshControl — store is synchronous/reactive */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Greeting Banner */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            {greetingTime}, {settings.ownerName}
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

        {/* Quick Actions Grid */}
        <QuickActionGrid
          onAddStock={() => navigation.navigate('AddEditProduct')}
          onRecordSale={() => navigation.navigate('RecordSale')}
          onAddExpense={() =>
            navigation.navigate('AddTransaction', { defaultType: 'expense' })
          }
          onOpenReports={() => navigation.navigate('Reports')}
        />

        {/* Low Stock Alerts Widget — item press navigates to that product's detail */}
        <LowStockAlertsWidget
          lowStockItems={lowStockItems}
          lowStockThreshold={settings.lowStockThreshold}
          onViewAll={() => navigation.navigate('Inventory', { filterLowStock: true })}
          onItemPress={handleLowStockItemPress}
        />

        {/* Interactive Sales Activity Chart Widget — real weekly data */}
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
});
