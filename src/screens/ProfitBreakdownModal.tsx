import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import {
  isTimestampToday,
  resolveTransactionTimestamp,
} from '../utils/dateUtils';

// ─── Types ────────────────────────────────────────────────────────────────────
type TimeRange = 'all' | 'month' | 'today';

interface ProductProfitRow {
  productId: string;
  name: string;
  category: string;
  unitsSold: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  marginPct: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isInRange(ts: number | null, range: TimeRange): boolean {
  if (ts === null) return false;
  if (range === 'all') return true;
  if (range === 'today') return isTimestampToday(ts);
  const d = new Date(ts);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

function fmt(n: number, currency: string): string {
  return `${currency} ${n.toLocaleString('en-US', { minimumFractionDigits: 0 })}`;
}

// ─── SummaryCard sub-component ────────────────────────────────────────────────
interface SummaryCardProps {
  label: string;
  value: string;
  sub?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  valueColor?: string;
}

const SummaryCard = ({ label, value, sub, iconName, iconColor, iconBg, valueColor }: SummaryCardProps) => (
  <View style={summaryCardStyles.card}>
    <View style={[summaryCardStyles.iconCircle, { backgroundColor: iconBg }]}>
      <Ionicons name={iconName} size={18} color={iconColor} />
    </View>
    <Text style={summaryCardStyles.label}>{label}</Text>
    <Text style={[summaryCardStyles.value, valueColor ? { color: valueColor } : {}]}>
      {value}
    </Text>
    {sub ? <Text style={summaryCardStyles.sub}>{sub}</Text> : null}
  </View>
);

const summaryCardStyles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 14,
    ...SHADOWS.small,
    minWidth: 0,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: { fontSize: 10, color: COLORS.textMuted, fontWeight: '700', letterSpacing: 0.4, marginBottom: 4 },
  value: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  sub: { fontSize: 11, color: COLORS.textSecondary, marginTop: 3 },
});

// ─── Main Modal ───────────────────────────────────────────────────────────────
export const ProfitBreakdownModal = ({ navigation }: any) => {
  const { transactions, products, settings } = useAppStore();
  const [range, setRange] = useState<TimeRange>('all');
  const currency = settings.currency;

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products]
  );

  // ── Core profit computation ───────────────────────────────────────────────
  const { totalRevenue, totalCogs, grossProfit, totalExpenses, netProfit, perProduct } =
    useMemo(() => {
      let rev = 0;
      let cogs = 0;
      let exp = 0;
      const byProduct = new Map<string, ProductProfitRow>();

      for (const tx of transactions) {
        const ts = resolveTransactionTimestamp(tx.createdAt, tx.date);
        if (!isInRange(ts, range)) continue;

        if (tx.type === 'expense') {
          exp += tx.amount;
          continue;
        }

        rev += tx.amount;

        if (tx.productId && tx.quantitySold != null && tx.quantitySold > 0) {
          const product = productMap.get(tx.productId);
          const txCogs = product ? product.buyPrice * tx.quantitySold : 0;
          cogs += txCogs;

          const name = product?.name ?? tx.description ?? 'Unknown Product';
          const category = product?.category ?? '—';
          const existing = byProduct.get(tx.productId);

          if (existing) {
            existing.unitsSold += tx.quantitySold;
            existing.revenue += tx.amount;
            existing.cogs += txCogs;
            existing.grossProfit = existing.revenue - existing.cogs;
            existing.marginPct = existing.revenue > 0
              ? Math.round((existing.grossProfit / existing.revenue) * 100) : 0;
          } else {
            const gp = tx.amount - txCogs;
            byProduct.set(tx.productId, {
              productId: tx.productId,
              name,
              category,
              unitsSold: tx.quantitySold,
              revenue: tx.amount,
              cogs: txCogs,
              grossProfit: gp,
              marginPct: tx.amount > 0 ? Math.round((gp / tx.amount) * 100) : 0,
            });
          }
        }
      }

      const gp = rev - cogs;
      const net = gp - exp;
      const rows = Array.from(byProduct.values()).sort((a, b) => b.grossProfit - a.grossProfit);

      return { totalRevenue: rev, totalCogs: cogs, grossProfit: gp, totalExpenses: exp, netProfit: net, perProduct: rows };
    }, [transactions, productMap, range]);

  const marginPct = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;
  const marginColor = marginPct >= 30 ? COLORS.green : marginPct >= 10 ? COLORS.amber : COLORS.red;

  const renderProductRow = useCallback(
    (item: ProductProfitRow, index: number) => {
      const isPos = item.grossProfit >= 0;
      const mc = item.marginPct >= 30 ? COLORS.green : item.marginPct >= 10 ? COLORS.amber : COLORS.red;
      const mb = item.marginPct >= 30 ? COLORS.greenBg : item.marginPct >= 10 ? COLORS.amberBg : COLORS.redBg;
      return (
        <View key={item.productId} style={[styles.productRow, index === 0 && { borderTopWidth: 0 }]}>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>{index + 1}</Text>
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={1} ellipsizeMode="tail">{item.name}</Text>
            <Text style={styles.productMeta}>{item.category} · {item.unitsSold} unit{item.unitsSold !== 1 ? 's' : ''} sold</Text>
            <Text style={styles.productCogs}>Cost: {fmt(item.cogs, currency)}</Text>
          </View>
          <View style={styles.productFinancials}>
            <Text style={styles.productRevenue}>{fmt(item.revenue, currency)}</Text>
            <View style={[styles.marginBadge, { backgroundColor: mb }]}>
              <Text style={[styles.marginBadgeText, { color: mc }]}>{item.marginPct}% margin</Text>
            </View>
            <Text style={[styles.productProfit, { color: isPos ? COLORS.green : COLORS.red }]}>
              {isPos ? '+' : ''}{fmt(item.grossProfit, currency)}
            </Text>
          </View>
        </View>
      );
    },
    [currency]
  );

  const RANGES: { key: TimeRange; label: string }[] = [
    { key: 'all', label: 'All Time' },
    { key: 'month', label: 'This Month' },
    { key: 'today', label: 'Today' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <Pressable
          style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.7 }]}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Close profit breakdown"
        >
          <Ionicons name="arrow-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Profit Breakdown</Text>
          <Text style={styles.headerSub}>{settings.businessName}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      {/* ── Time-range tabs ───────────────────────────────────────────── */}
      <View style={styles.rangeTabs}>
        {RANGES.map(({ key, label }) => (
          <Pressable
            key={key}
            style={[styles.rangeTab, range === key && styles.rangeTabActive]}
            onPress={() => setRange(key)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${label}`}
          >
            <Text style={[styles.rangeTabText, range === key && styles.rangeTabTextActive]}>
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Hero card ─────────────────────────────────────────────── */}
        <View style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroLabel}>NET PROFIT</Text>
              <Text style={[styles.heroValue, { color: netProfit >= 0 ? '#4ADE80' : '#F87171' }]}>
                {netProfit >= 0 ? '+' : ''}{fmt(netProfit, currency)}
              </Text>
              <Text style={styles.heroSub}>
                After {fmt(totalExpenses, currency)} in expenses
              </Text>
            </View>
            <View style={[styles.marginCircle, { borderColor: marginColor }]}>
              <Text style={[styles.marginCircleValue, { color: marginColor }]}>{marginPct}%</Text>
              <Text style={styles.marginCircleLabel}>margin</Text>
            </View>
          </View>

          {/* Mini breakdown row inside hero */}
          <View style={styles.heroMiniRow}>
            <View style={styles.heroMiniItem}>
              <Text style={styles.heroMiniLabel}>Revenue</Text>
              <Text style={styles.heroMiniValue}>{fmt(totalRevenue, currency)}</Text>
            </View>
            <View style={styles.heroMiniDivider} />
            <View style={styles.heroMiniItem}>
              <Text style={styles.heroMiniLabel}>Cost of Goods</Text>
              <Text style={styles.heroMiniValue}>{fmt(totalCogs, currency)}</Text>
            </View>
            <View style={styles.heroMiniDivider} />
            <View style={styles.heroMiniItem}>
              <Text style={styles.heroMiniLabel}>Gross Profit</Text>
              <Text style={[styles.heroMiniValue, { color: grossProfit >= 0 ? '#4ADE80' : '#F87171' }]}>
                {fmt(grossProfit, currency)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── 2×2 summary cards ─────────────────────────────────────── */}
        <View style={styles.gridRow}>
          <SummaryCard
            label="TOTAL REVENUE"
            value={fmt(totalRevenue, currency)}
            sub="All income"
            iconName="trending-up-outline"
            iconColor={COLORS.blue}
            iconBg={COLORS.blueBg}
            valueColor={COLORS.blue}
          />
          <View style={{ width: 10 }} />
          <SummaryCard
            label="COST OF GOODS"
            value={fmt(totalCogs, currency)}
            sub="Buy price × qty sold"
            iconName="cube-outline"
            iconColor={COLORS.amber}
            iconBg={COLORS.amberBg}
            valueColor={COLORS.amber}
          />
        </View>
        <View style={[styles.gridRow, { marginTop: 10 }]}>
          <SummaryCard
            label="GROSS PROFIT"
            value={fmt(grossProfit, currency)}
            sub={`${marginPct}% gross margin`}
            iconName="stats-chart-outline"
            iconColor={COLORS.green}
            iconBg={COLORS.greenBg}
            valueColor={grossProfit >= 0 ? COLORS.green : COLORS.red}
          />
          <View style={{ width: 10 }} />
          <SummaryCard
            label="TOTAL EXPENSES"
            value={fmt(totalExpenses, currency)}
            sub="Operating costs"
            iconName="arrow-up-circle-outline"
            iconColor={COLORS.red}
            iconBg={COLORS.redBg}
            valueColor={COLORS.red}
          />
        </View>

        {/* ── Per-product breakdown ──────────────────────────────────── */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconBg}>
              <Ionicons name="bar-chart-outline" size={15} color={COLORS.green} />
            </View>
            <Text style={styles.sectionTitle}>Sales Profit by Product</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{perProduct.length}</Text>
            </View>
          </View>

          {perProduct.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="receipt-outline" size={40} color={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>No product sales yet</Text>
              <Text style={styles.emptySub}>
                When you record sales via "Record Sale", each product's profit will appear here.
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.colHeaders}>
                <Text style={[styles.colHeaderText, { flex: 1 }]}>PRODUCT</Text>
                <Text style={[styles.colHeaderText, { textAlign: 'right' }]}>REVENUE / PROFIT</Text>
              </View>
              {perProduct.map((item, i) => renderProductRow(item, i))}
            </>
          )}
        </View>

        {/* ── Formula explainer ─────────────────────────────────────── */}
        <View style={styles.explainerCard}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textMuted} style={{ marginTop: 1 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.explainerTitle}>How this is calculated</Text>
            <Text style={styles.explainerFormula}>
              {'Revenue − Cost of Goods = Gross Profit\nGross Profit − Expenses = Net Profit'}
            </Text>
            <Text style={styles.explainerNote}>
              Cost of Goods uses the buy price recorded at time of sale. Only "Record Sale" transactions include full per-product cost data.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  backBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: COLORS.textPrimary },
  headerSub: { fontSize: 12, color: COLORS.textSecondary, marginTop: 1 },

  rangeTabs: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  rangeTab: {
    flex: 1, paddingVertical: 8, borderRadius: 10,
    backgroundColor: COLORS.inputBg, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.divider,
  },
  rangeTabActive: { backgroundColor: COLORS.greenBg, borderColor: COLORS.green },
  rangeTabText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  rangeTabTextActive: { color: COLORS.green, fontWeight: '800' },

  scroll: { padding: 16, paddingBottom: 100, gap: 12 },

  // Hero
  heroCard: {
    backgroundColor: COLORS.dark,
    borderRadius: 20,
    padding: 20,
    gap: 16,
    ...SHADOWS.medium,
  },
  heroRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroLabel: { fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: '700', letterSpacing: 0.5, marginBottom: 4 },
  heroValue: { fontSize: 28, fontWeight: '900', letterSpacing: -0.5 },
  heroSub: { fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 5 },
  marginCircle: {
    width: 76, height: 76, borderRadius: 38, borderWidth: 3,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  marginCircleValue: { fontSize: 22, fontWeight: '900' },
  marginCircleLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '600' },
  heroMiniRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 12,
  },
  heroMiniItem: { flex: 1, alignItems: 'center' },
  heroMiniDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.12)', marginHorizontal: 4 },
  heroMiniLabel: { fontSize: 10, color: 'rgba(255,255,255,0.45)', fontWeight: '600', marginBottom: 4 },
  heroMiniValue: { fontSize: 12, fontWeight: '800', color: 'rgba(255,255,255,0.9)' },

  // Grid
  gridRow: { flexDirection: 'row' },

  // Section card
  sectionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    overflow: 'hidden',
    ...SHADOWS.small,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    padding: 14,
    borderBottomWidth: 1, borderBottomColor: COLORS.divider,
  },
  sectionIconBg: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: COLORS.greenBg,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  countBadge: {
    backgroundColor: COLORS.greenBg,
    paddingHorizontal: 9, paddingVertical: 3,
    borderRadius: 10,
  },
  countBadgeText: { fontSize: 12, fontWeight: '800', color: COLORS.green },

  colHeaders: {
    flexDirection: 'row',
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: COLORS.inputBg,
  },
  colHeaderText: { fontSize: 10, fontWeight: '700', color: COLORS.textMuted, letterSpacing: 0.4 },

  // Product row
  productRow: {
    flexDirection: 'row', alignItems: 'center',
    padding: 14, gap: 10,
    borderTopWidth: 1, borderTopColor: COLORS.divider,
  },
  rankBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.inputBg,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  rankText: { fontSize: 11, fontWeight: '800', color: COLORS.textSecondary },
  productInfo: { flex: 1, minWidth: 0 },
  productName: { fontSize: 14, fontWeight: '700', color: COLORS.textPrimary },
  productMeta: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  productCogs: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  productFinancials: { alignItems: 'flex-end', flexShrink: 0 },
  productRevenue: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  marginBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 3 },
  marginBadgeText: { fontSize: 10, fontWeight: '700' },
  productProfit: { fontSize: 12, fontWeight: '700', marginTop: 3 },

  // Empty state
  emptyState: { alignItems: 'center', padding: 32, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textSecondary },
  emptySub: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', lineHeight: 18 },

  // Explainer
  explainerCard: {
    flexDirection: 'row', gap: 10,
    backgroundColor: COLORS.card, borderRadius: 12, padding: 14,
    ...SHADOWS.small,
  },
  explainerTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textSecondary, marginBottom: 6 },
  explainerFormula: {
    fontSize: 12, color: COLORS.textPrimary,
    lineHeight: 20, marginBottom: 6,
    fontFamily: 'monospace' as any,
  },
  explainerNote: { fontSize: 11, color: COLORS.textMuted, lineHeight: 16 },
});
