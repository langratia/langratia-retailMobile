import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Platform,
  FlatList,
  Share,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { SuccessModal } from '../components/SuccessModal';
import { generateFinancialStatementPDF } from '../utils/pdfGenerator';

export const StatementModal = ({ route, navigation }: any) => {
  const { transactions, settings } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : 8;
  // SM-01: honour defaultFilter param passed from ReportsScreen links
  const defaultFilter = route?.params?.defaultFilter ?? 'all';
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense' | 'credit'>(defaultFilter);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [successConfig, setSuccessConfig] = useState<{
    visible: boolean;
    title: string;
    subtitle: string;
  }>({
    visible: false,
    title: '',
    subtitle: '',
  });

  // 1. Memoized Financial Inflow/Outflow/Net Totals
  const { totalIncome, totalExpenses, netBalance } = useMemo(() => {
    const inc = transactions
      .filter((tx) => tx.type === 'income')
      .reduce((acc, tx) => acc + tx.amount, 0);

    const exp = transactions
      .filter((tx) => tx.type === 'expense')
      .reduce((acc, tx) => acc + tx.amount, 0);

    return {
      totalIncome: inc,
      totalExpenses: exp,
      netBalance: inc - exp,
    };
  }, [transactions]);

  // 2. Memoized Ledger Table Dataset with Running Balances
  const tableData = useMemo(() => {
    const filtered = transactions.filter((tx) => {
      if (filterType === 'income') return tx.type === 'income' && !tx.isCredit;
      if (filterType === 'expense') return tx.type === 'expense';
      if (filterType === 'credit') return tx.isCredit || tx.category === 'Credit Sales';
      return true;
    });

    // SM-02: Sort oldest-first by createdAt timestamp (reliable) before computing
    // running balances. Using array reversal was fragile — it depended on insertion order.
    const sorted = [...filtered].sort((a, b) => {
      const tsA = a.createdAt ?? 0;
      const tsB = b.createdAt ?? 0;
      return tsA - tsB; // ascending (oldest first)
    });

    let currentRunning = 0;
    const mapped = sorted.map((tx) => {
      if (tx.type === 'income') {
        currentRunning += tx.amount;
      } else {
        currentRunning -= tx.amount;
      }
      return {
        ...tx,
        runningBalance: currentRunning,
      };
    });

    // Return newest-first for display
    return mapped.reverse();
  }, [transactions, filterType]);

  const handleExportStatement = useCallback(async () => {
    try {
      const csvHeader = 'Date,Time,Description,Category,Type,Amount,Running Balance\n';
      const csvRows = tableData
        .map((t) => {
          const typeStr = t.isCredit ? 'CREDIT' : t.type.toUpperCase();
          return `"${t.date}","${t.time}","${t.description.replace(/"/g, '""')}","${t.category}","${typeStr}",${t.amount},${t.runningBalance}`;
        })
        .join('\n');

      const summaryText = `FINANCIAL STATEMENT - ${settings.businessName.toUpperCase()}\nCurrency: ${settings.currency}\nTotal Inflow: +${settings.currency} ${totalIncome.toLocaleString()}\nTotal Outflow: -${settings.currency} ${totalExpenses.toLocaleString()}\nNet Balance: ${settings.currency} ${netBalance.toLocaleString()}\n\nTRANSACTION LEDGER:\n${csvHeader}${csvRows}`;

      await Share.share({
        title: `${settings.businessName} Financial Statement`,
        message: summaryText,
      });
    } catch (error) {
      Alert.alert('Export Error', 'Unable to share financial statement.');
    }
  }, [tableData, settings.businessName, settings.currency, totalIncome, totalExpenses, netBalance]);

  const handleExportPDF = useCallback(async () => {
    setIsExportingPDF(true);
    try {
      await generateFinancialStatementPDF({
        businessName: settings.businessName,
        ownerName: settings.ownerName,
        currency: settings.currency,
        totalIncome,
        totalExpenses,
        netBalance,
        transactions: tableData,
      });
    } catch (error) {
      Alert.alert('Export Error', 'Unable to generate PDF document.');
    } finally {
      setIsExportingPDF(false);
    }
  }, [settings, totalIncome, totalExpenses, netBalance, tableData]);

  const renderTableHeader = useMemo(
    () => (
      <View style={styles.headerComponentContainer}>

        {/* ── Hero Summary Card (dark, clean) ──────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroBusinessName} numberOfLines={1}>
                {settings.businessName}
              </Text>
              <Text style={styles.heroSub}>Account Statement · {settings.currency}</Text>
            </View>
            <View style={styles.heroBadge}>
              <Ionicons name="document-text-outline" size={14} color={COLORS.green} />
              <Text style={styles.heroBadgeText}>LEDGER</Text>
            </View>
          </View>

          {/* 3 metric columns */}
          <View style={styles.heroMetrics}>
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>Total Inflow</Text>
              <Text style={[styles.heroMetricValue, { color: '#4ADE80' }]}>
                +{settings.currency} {totalIncome.toLocaleString()}
              </Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>Total Outflow</Text>
              <Text style={[styles.heroMetricValue, { color: '#F87171' }]}>
                -{settings.currency} {totalExpenses.toLocaleString()}
              </Text>
            </View>
            <View style={styles.heroMetricDivider} />
            <View style={styles.heroMetricItem}>
              <Text style={styles.heroMetricLabel}>Net Balance</Text>
              <Text style={[styles.heroMetricValue, { color: netBalance >= 0 ? '#4ADE80' : '#F87171' }]}>
                {settings.currency} {netBalance.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Filter tabs (scrollable so they never overflow) ──────────── */}
        <View style={styles.filterScrollWrapper}>
          {[
            { id: 'all',     label: 'All Entries',   icon: 'list-outline' as const },
            { id: 'income',  label: 'Inflow (+)',     icon: 'trending-up-outline' as const },
            { id: 'expense', label: 'Outflow (-)',    icon: 'trending-down-outline' as const },
            { id: 'credit',  label: 'Credit (Debt)', icon: 'card-outline' as const },
          ].map((item) => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.filterChip,
                filterType === item.id && styles.filterChipActive,
                pressed && styles.pressed,
              ]}
              onPress={() => setFilterType(item.id as any)}
              accessibilityRole="button"
              accessibilityLabel={`Filter by ${item.label}`}
            >
              <Ionicons
                name={item.icon}
                size={13}
                color={filterType === item.id ? COLORS.green : COLORS.textSecondary}
              />
              <Text style={[
                styles.filterChipText,
                filterType === item.id && styles.filterChipTextActive,
              ]}>
                {item.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Table header row ─────────────────────────────────────────── */}
        <View style={styles.tableHeaderRow}>
          <Text style={[styles.thCell, { flex: 2.2 }]}>Date / Item</Text>
          <Text style={[styles.thCell, { flex: 1.2, textAlign: 'center' }]}>Type</Text>
          <Text style={[styles.thCell, { flex: 1.8, textAlign: 'right' }]}>Amount</Text>
          <Text style={[styles.thCell, { flex: 2, textAlign: 'right' }]}>Balance</Text>
        </View>
      </View>
    ),
    [
      settings.businessName,
      settings.currency,
      totalIncome,
      totalExpenses,
      netBalance,
      filterType,
      tableData.length,
    ]
  );

  const renderTableFooter = useMemo(
    () => (
      <View style={styles.footerContainer}>
        <Pressable
          style={({ pressed }) => [styles.exportFullBtn, pressed && styles.pressedBtn]}
          onPress={handleExportPDF}
          disabled={isExportingPDF}
          accessibilityRole="button"
          accessibilityLabel="Export PDF Statement"
        >
          <Ionicons name="print-outline" size={20} color={COLORS.card} />
          <Text style={styles.exportFullBtnText}>
            {isExportingPDF ? 'Generating PDF...' : 'Export PDF Statement'}
          </Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.exportCsvBtn, pressed && styles.pressed]}
          onPress={handleExportStatement}
          accessibilityRole="button"
          accessibilityLabel="Export CSV Data"
        >
          <Ionicons name="share-outline" size={18} color={COLORS.green} />
          <Text style={styles.exportCsvBtnText}>Export CSV Ledger</Text>
        </Pressable>
      </View>
    ),
    [handleExportPDF, isExportingPDF, handleExportStatement]
  );

  const renderTableRow = useCallback(
    ({ item: row, index }: { item: any; index: number }) => {
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
          style={[
            styles.tableBodyRow,
            { backgroundColor: isEven ? COLORS.card : COLORS.inputBg },
          ]}
          accessibilityRole="text"
          accessibilityLabel={`${row.description}, ${row.date}, Amount: ${isIncome ? '+' : '-'}${row.amount.toLocaleString()}, Running balance: ${settings.currency} ${row.runningBalance.toLocaleString()}`}
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
          <View style={{ flex: 1.8, alignItems: 'flex-end', justifyContent: 'center' }}>
            <Text
              style={[styles.tdAmount, { color: typeColor }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {isIncome ? '+' : '-'}{row.amount.toLocaleString()}
            </Text>
          </View>

          {/* Running Balance */}
          <View style={{ flex: 2, alignItems: 'flex-end', justifyContent: 'center' }}>
            <Text
              style={styles.tdBalance}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {settings.currency} {row.runningBalance.toLocaleString()}
            </Text>
          </View>
        </View>
      );
    },
    [settings.currency]
  );

  const renderEmptyComponent = useMemo(
    () => (
      <View style={styles.emptyRow}>
        <Ionicons name="receipt-outline" size={32} color={COLORS.textMuted} />
        <Text style={styles.emptyText}>No statement records found for this filter.</Text>
      </View>
    ),
    []
  );

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Close statement modal"
        >
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Financial Statement</Text>
        <Pressable
          onPress={handleExportStatement}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Share financial statement"
        >
          <Ionicons name="share-outline" size={22} color={COLORS.green} />
        </Pressable>
      </View>

      <FlatList
        data={tableData}
        keyExtractor={(item) => item.id}
        renderItem={renderTableRow}
        ListHeaderComponent={renderTableHeader}
        ListFooterComponent={renderTableFooter}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={15}
        maxToRenderPerBatch={10}
        windowSize={5}
        getItemLayout={(data, index) => ({
          length: 48,
          offset: 48 * index,
          index,
        })}
      />

      <SuccessModal
        visible={successConfig.visible}
        title={successConfig.title}
        subtitle={successConfig.subtitle}
        onClose={() =>
          setSuccessConfig((prev) => ({ ...prev, visible: false }))
        }
      />
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
  closeBtn: {
    padding: 8,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  headerComponentContainer: {
    marginBottom: 0,
  },

  // ── Hero summary card ─────────────────────────────────────────────────────
  heroCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
    gap: 14,
    ...SHADOWS.medium,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  heroBusinessName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  heroSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexShrink: 0,
  },
  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.green,
    letterSpacing: 0.5,
  },
  heroMetrics: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
  },
  heroMetricItem: { flex: 1, alignItems: 'center' },
  heroMetricDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    marginHorizontal: 4,
  },
  heroMetricLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.45)',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  heroMetricValue: {
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },

  // ── Filter strip (wraps naturally) ────────────────────────────────────────
  filterScrollWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  filterChipActive: {
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterChipTextActive: {
    color: COLORS.green,
    fontWeight: '700',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    paddingVertical: 12,
    minHeight: 48,
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
    paddingVertical: 3,
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
    padding: 30,
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.card,
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  footerContainer: {
    marginTop: 20,
    gap: 10,
  },
  exportFullBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
    borderRadius: 14,
    height: 52,
    gap: 8,
  },
  exportFullBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.card,
  },
  exportCsvBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.greenBg,
    borderColor: COLORS.green,
    borderWidth: 1,
    borderRadius: 14,
    height: 48,
    gap: 8,
  },
  exportCsvBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.green,
  },
  pressedBtn: {
    opacity: 0.85,
  },
  pressed: {
    opacity: 0.7,
  },
});
