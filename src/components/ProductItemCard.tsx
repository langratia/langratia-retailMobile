import React, { useState } from 'react';
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

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
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

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const totalValue = product.quantity * product.buyPrice;

  return (
    <View style={styles.card}>
      {/* Compact Main Row */}
      <Pressable
        style={({ pressed }) => [
          styles.mainRow,
          pressed && styles.pressedRow,
        ]}
        onPress={toggleExpand}
        accessibilityRole="button"
        accessibilityLabel={`${product.name}, Category: ${product.category}. Price: ${currency} ${product.sellPrice.toLocaleString()}. Quantity: ${product.quantity}`}
        accessibilityHint="Tap to expand product details and quick actions"
      >
        <View style={styles.nameSection}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.category}>{product.category}</Text>
        </View>

        <View style={styles.rightCompactSection}>
          <Text
            style={styles.priceTag}
            numberOfLines={1}
            adjustsFontSizeToFit={true}
          >
            {currency} {product.sellPrice.toLocaleString()}
          </Text>
          <Badge quantity={product.quantity} />
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={COLORS.textMuted}
            style={{ marginLeft: 6 }}
          />
        </View>
      </Pressable>

      {/* Slide-Down Expanded Details */}
      {expanded && (
        <View style={styles.expandedContent}>
          <View style={styles.divider} />

          {/* 3-Column Metrics */}
          <View style={styles.metricsRow}>
            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Buy Price</Text>
              <Text
                style={styles.metricValue}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {currency} {product.buyPrice.toLocaleString()}
              </Text>
            </View>

            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Sell Price</Text>
              <Text
                style={styles.metricValue}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {currency} {product.sellPrice.toLocaleString()}
              </Text>
            </View>

            <View style={styles.metricCol}>
              <Text style={styles.metricLabel}>Total Value</Text>
              <Text
                style={[styles.metricValue, { color: COLORS.green, fontWeight: '700' }]}
                numberOfLines={1}
                adjustsFontSizeToFit={true}
              >
                {currency} {totalValue.toLocaleString()}
              </Text>
            </View>
          </View>

          {/* Action Buttons Row */}
          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: COLORS.greenBg },
                pressed && styles.btnPressed,
              ]}
              onPress={onAddStock}
              accessibilityRole="button"
              accessibilityLabel={`Add 1 stock unit to ${product.name}`}
            >
              <Ionicons name="add-circle" size={16} color={COLORS.green} />
              <Text style={[styles.actionText, { color: COLORS.green }]}>+ Stock</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: COLORS.redBg },
                pressed && styles.btnPressed,
              ]}
              onPress={onRemoveStock}
              accessibilityRole="button"
              accessibilityLabel={`Remove 1 stock unit from ${product.name}`}
            >
              <Ionicons name="remove-circle" size={16} color={COLORS.red} />
              <Text style={[styles.actionText, { color: COLORS.red }]}>- Remove</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: COLORS.inputBg },
                pressed && styles.btnPressed,
              ]}
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${product.name}`}
            >
              <Ionicons name="create-outline" size={16} color={COLORS.textSecondary} />
              <Text style={[styles.actionText, { color: COLORS.textSecondary }]}>Edit</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: COLORS.blueBg },
                pressed && styles.btnPressed,
              ]}
              onPress={onPressDetails}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${product.name}`}
            >
              <Ionicons name="information-circle-outline" size={16} color={COLORS.blue} />
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
    ...SHADOWS.small,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  pressedRow: {
    opacity: 0.8,
  },
  nameSection: {
    flex: 1,
    paddingRight: 8,
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
  rightCompactSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceTag: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.green,
  },
  expandedContent: {
    marginTop: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginBottom: 10,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: 10,
    gap: 4,
  },
  btnPressed: {
    opacity: 0.7,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
