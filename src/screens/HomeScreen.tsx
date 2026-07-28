import React from 'react';
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
import { QuickActionButton } from '../components/QuickActionButton';
import { Badge } from '../components/Badge';

export const HomeScreen = ({ navigation }: any) => {
  const { products, transactions, settings } = useAppStore();

  // Financial Computations
  const totalStockValue = products.reduce(
    (acc, p) => acc + p.quantity * p.buyPrice,
    0
  );
  
  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const cashBalance = totalIncome - totalExpense;
  const todaysSales = transactions
    .filter((tx) => tx.type === 'income' && (tx.date === 'Today' || tx.date.includes(new Date().getDate().toString())))
    .reduce((acc, tx) => acc + tx.amount, 0);
  const todaysProfit = todaysSales * 0.25; // estimated margin

  const lowStockItems = products.filter(
    (p) => p.quantity <= settings.lowStockThreshold
  );

  return (
    <View style={styles.container}>
      <Header title="Business Balance" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Greeting Banner */}
        <View style={styles.greetingContainer}>
          <Text style={styles.greetingTitle}>
            Good Morning, {settings.ownerName} 👋
          </Text>
          <Text style={styles.greetingSub}>
            Here's what's happening with your business today.
          </Text>
        </View>

        {/* 2x2 Stat Cards Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.gridRow}>
            <StatCard
              title="Cash Balance"
              value={`${settings.currency}${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              trendText="8.5% from yesterday"
              iconName="wallet-outline"
              iconColor={COLORS.green}
              iconBgColor={COLORS.greenBg}
            />
            <StatCard
              title="Stock Value"
              value={`${settings.currency}${totalStockValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              trendText="3.2% from yesterday"
              iconName="cube-outline"
              iconColor={COLORS.blue}
              iconBgColor={COLORS.blueBg}
            />
          </View>

          <View style={styles.gridRow}>
            <StatCard
              title="Today's Profit"
              value={`${settings.currency}${todaysProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              trendText="12.6% from yesterday"
              iconName="trending-up-outline"
              iconColor={COLORS.green}
              iconBgColor={COLORS.greenBg}
            />
            <StatCard
              title="Today's Sales"
              value={`${settings.currency}${todaysSales.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              trendText="6.1% from yesterday"
              iconName="cart-outline"
              iconColor={COLORS.amber}
              iconBgColor={COLORS.amberBg}
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
            <Text style={styles.viewAllText}>
              All Actions <Ionicons name="chevron-forward" size={14} color={COLORS.green} />
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.quickActionsRow}>
          <QuickActionButton
            title="Add Stock"
            iconName="add-circle-outline"
            iconColor={COLORS.green}
            bgColor={COLORS.greenBg}
            onPress={() => navigation.navigate('AddEditProduct')}
          />
          <QuickActionButton
            title="Record Sale"
            iconName="cart-outline"
            iconColor={COLORS.blue}
            bgColor={COLORS.blueBg}
            onPress={() => navigation.navigate('RecordSale')}
          />
          <QuickActionButton
            title="Add Expense"
            iconName="receipt-outline"
            iconColor={COLORS.amber}
            bgColor={COLORS.amberBg}
            onPress={() => navigation.navigate('AddTransaction', { defaultType: 'expense' })}
          />
          <QuickActionButton
            title="View Reports"
            iconName="pie-chart-outline"
            iconColor={COLORS.purple}
            bgColor={COLORS.purpleBg}
            onPress={() => navigation.navigate('Reports')}
          />
        </View>

        {/* Low Stock Alerts */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Low Stock Alerts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Inventory')}>
            <Text style={styles.viewAllText}>
              View All <Ionicons name="chevron-forward" size={14} color={COLORS.green} />
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cardContainer}>
          {lowStockItems.length === 0 ? (
            <Text style={styles.emptyText}>All stock levels are healthy!</Text>
          ) : (
            lowStockItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.alertRow}
                onPress={() => navigation.navigate('Inventory')}
                activeOpacity={0.7}
              >
                <View style={styles.alertIconBox}>
                  <Ionicons name="cube-outline" size={22} color={COLORS.amber} />
                </View>

                <View style={styles.alertInfo}>
                  <Text style={styles.alertName}>{item.name}</Text>
                  <Text style={styles.alertCategory}>Category: {item.category}</Text>
                </View>

                <Badge quantity={item.quantity} lowStockThreshold={settings.lowStockThreshold} />
                <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Sales Overview Chart Card */}
        <View style={[styles.cardContainer, { marginTop: 16 }]}>
          <View style={styles.chartHeader}>
            <Text style={styles.sectionTitle}>Sales Overview</Text>
            <View style={styles.timeDropdown}>
              <Text style={styles.timeDropdownText}>This Week</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.textSecondary} />
            </View>
          </View>

          {/* Simple Visual Line Chart Representation */}
          <View style={styles.chartArea}>
            <View style={styles.chartGridLines}>
              {['800', '600', '400', '200', '0'].map((val, idx) => (
                <View key={idx} style={styles.chartGridLineRow}>
                  <Text style={styles.chartYLabel}>{val}</Text>
                  <View style={styles.chartLineHorizontal} />
                </View>
              ))}
            </View>

            {/* Days Bar / Point indicators */}
            <View style={styles.chartDaysRow}>
              {[
                { day: 'Mon', val: '$320' },
                { day: 'Tue', val: '$460' },
                { day: 'Wed', val: '$390' },
                { day: 'Thu', val: '$610' },
                { day: 'Fri', val: '$550' },
                { day: 'Sat', val: '$430' },
                { day: 'Sun', val: '$540' },
              ].map((d, i) => (
                <View key={i} style={styles.chartDayCol}>
                  <View style={styles.pointDot} />
                  <Text style={styles.chartDayText}>{d.day}</Text>
                </View>
              ))}
            </View>
          </View>
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
    paddingBottom: 40,
  },
  greetingContainer: {
    marginTop: 12,
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
  gridContainer: {
    gap: 12,
    marginBottom: 24,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
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
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
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
    paddingVertical: 10,
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
  timeDropdownText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  chartArea: {
    height: 160,
    justifyContent: 'space-between',
  },
  chartGridLines: {
    gap: 18,
  },
  chartGridLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chartYLabel: {
    width: 24,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  chartLineHorizontal: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
  },
  chartDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 32,
    paddingRight: 8,
  },
  chartDayCol: {
    alignItems: 'center',
    gap: 4,
  },
  pointDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.green,
  },
  chartDayText: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
