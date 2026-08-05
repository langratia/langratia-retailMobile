import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { COLORS, SHADOWS } from '../theme/theme';
import { Badge } from './Badge';

// Enable LayoutAnimation on Android (required flag)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ProductItemCardProps {
  product: Product;
  currency?: string;
  onAddStock: () => void;
  onRemoveStock: () => void;
  onEdit: () => void;
  onPressDetails?: () => void;
}

export const ProductItemCard = React.memo(({
  product,
  currency = 'UGX',
  onAddStock,
  onRemoveStock,
  onEdit,
  onPressDetails,
}: ProductItemCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = useCallback(() => {
    // LayoutAnimation is built-in and causes zero FlatList flickering.
    // The previous LinearTransition (reanimated) re-animated every sibling
    // card in the list on each expand — that was the source of the flicker.
    LayoutAnimation.configureNext(
      LayoutAnimation.create(
        200,
        LayoutAnimation.Types.easeInEaseOut,
        LayoutAnimation.Properties.opacity,
      ),
    );
    setExpanded(prev => !prev);
  }, []);

  const totalValue = product.quantity * product.buyPrice;

  return (
    <View style={styles.card}>

      {/* ── Compact header row ──────────────────────────────────────────── */}
      <Pressable
        style={({ pressed }) => [styles.mainRow, pressed && styles.pressedRow]}
        onPress={toggleExpand}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, ${product.category}. ${currency} ${product.sellPrice.toLocaleString()}. Qty: ${product.quantity}`}
        accessibilityHint="Tap to expand product actions"
      >
        {/*
         * nameSection gets flex:1 + minWidth:0.
         * minWidth:0 is critical — without it a flex child cannot shrink below
         * its intrinsic content width, so long names overflow instead of
         * being clipped. numberOfLines={1} + ellipsizeMode ensures truncation.
         */}
        <View style={styles.nameSection}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {product.name}
          </Text>
          <Text style={styles.category} numberOfLines={1} ellipsizeMode="tail">
            {product.category}
          </Text>
        </View>

        {/*
         * rightCompactSection has flexShrink:0 so it never yields space to
         * the nameSection — it always shows the price, badge, and chevron
         * at their full size, and the name truncates instead.
         */}
        <View style={styles.rightCompactSection}>
          <Text style={styles.priceTag} numberOfLines={1}>
            {currency} {product.sellPrice.toLocaleString()}
          </Text>
          <Badge quantity={product.quantity} />
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.textMuted}
          />
        </View>
      </Pressable>

      {/* ── Expanded details ────────────────────────────────────────────── */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          {/* 3-column price metrics with vertical separators */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Buy Price</Text>
              <Text
                style={styles.metricValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {currency} {product.buyPrice.toLocaleString()}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Sell Price</Text>
              <Text
                style={styles.metricValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {currency} {product.sellPrice.toLocaleString()}
              </Text>
            </View>

            <View style={styles.metricDivider} />

            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Total Value</Text>
              <Text
                style={[styles.metricValue, { color: COLORS.green }]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.8}
              >
                {currency} {totalValue.toLocaleString()}
              </Text>
            </View>
          </View>

          {/*
           * 2×2 action grid — 4 buttons across 2 rows at 48% width each.
           * Previously 4 buttons in a single row left ~10px per button, making
           * text cut off. The grid gives every button enough room for icon + label.
           * Each button has a border color that matches its background tint so the
           * palette looks cohesive rather than clashing.
           */}
          <View style={styles.actionsGrid}>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                pressed ? styles.btnGreenPressed : styles.btnGreen,
              ]}
              onPress={onAddStock}
              accessibilityRole="button"
              accessibilityLabel={`Add 1 unit to ${product.name}`}
            >
              <Ionicons name="add-circle" size={15} color={COLORS.green} />
              <Text style={[styles.actionText, { color: COLORS.green }]}>+ Stock</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                pressed ? styles.btnRedPressed : styles.btnRed,
              ]}
              onPress={onRemoveStock}
              accessibilityRole="button"
              accessibilityLabel={`Remove 1 unit from ${product.name}`}
            >
              <Ionicons name="remove-circle" size={15} color={COLORS.red} />
              <Text style={[styles.actionText, { color: COLORS.red }]}>− Remove</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                pressed ? styles.btnNeutralPressed : styles.btnNeutral,
              ]}
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${product.name}`}
            >
              <Ionicons name="create-outline" size={15} color={COLORS.textSecondary} />
              <Text style={[styles.actionText, { color: COLORS.textSecondary }]}>Edit</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                pressed ? styles.btnBluePressed : styles.btnBlue,
              ]}
              onPress={onPressDetails}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${product.name}`}
            >
              <Ionicons name="information-circle-outline" size={15} color={COLORS.blue} />
              <Text style={[styles.actionText, { color: COLORS.blue }]}>Details</Text>
            </Pressable>

          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    overflow: 'hidden',
    ...SHADOWS.small,
  },

  // ── Header row ────────────────────────────────────────────────────────────
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
  },
  pressedRow: {
    opacity: 0.75,
  },

  // flex:1 + minWidth:0 → allows the text to truncate rather than overflow
  nameSection: {
    flex: 1,
    minWidth: 0,
    paddingRight: 10,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  category: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  // flexShrink:0 → right section never shrinks, name always truncates first
  rightCompactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  priceTag: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.green,
    maxWidth: 95,
  },

  // ── Expanded section ──────────────────────────────────────────────────────
  expandedContent: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginBottom: 12,
  },

  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  metricCol: {
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.divider,
    marginHorizontal: 6,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginBottom: 3,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },

  // ── Action grid ─────────────────────────────────────────────────────
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionBtn: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 5,
    minHeight: 40,
    // borderWidth and borderColor are defined per-variant below
    // so each button owns its complete border spec — no split-style merging.
    borderWidth: 1.5,
  },
  btnGreen: {
    backgroundColor: COLORS.greenBg,
    // Uses the actual green at 35% opacity — clearly inside the green family
    borderColor: 'rgba(16, 185, 129, 0.35)',
  },
  btnRed: {
    backgroundColor: COLORS.redBg,
    // Uses the actual red at 30% opacity
    borderColor: 'rgba(239, 68, 68, 0.30)',
  },
  btnNeutral: {
    backgroundColor: COLORS.inputBg,
    borderColor: COLORS.divider,
  },
  btnBlue: {
    backgroundColor: COLORS.blueBg,
    // Uses the actual blue at 30% opacity
    borderColor: 'rgba(59, 130, 246, 0.30)',
  },
  // Pressed state: darken the tint rather than dimming opacity — gives
  // solid, obvious tap feedback without making content look washed out.
  btnGreenPressed: {
    backgroundColor: '#D1FAE5',
    borderColor: 'rgba(16, 185, 129, 0.6)',
  },
  btnRedPressed: {
    backgroundColor: '#FEE2E2',
    borderColor: 'rgba(239, 68, 68, 0.5)',
  },
  btnNeutralPressed: {
    backgroundColor: COLORS.divider,
    borderColor: COLORS.textMuted,
  },
  btnBluePressed: {
    backgroundColor: '#DBEAFE',
    borderColor: 'rgba(59, 130, 246, 0.5)',
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
