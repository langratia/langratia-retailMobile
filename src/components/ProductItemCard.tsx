import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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

export const ProductItemCard: React.FC<ProductItemCardProps> = ({
  product,
  currency = 'UGX',
  onAddStock,
  onRemoveStock,
  onEdit,
  onPressDetails,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  const totalValue = product.quantity * product.buyPrice;

  return (
    <View style={styles.card}>
      {/* Compact Main Row */}
      <TouchableOpacity
        style={styles.mainRow}
        onPress={toggleExpand}
        activeOpacity={0.7}
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
      </TouchableOpacity>

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
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.greenBg }]}
              onPress={onAddStock}
              activeOpacity={0.7}
            >
              <Ionicons name="add-circle" size={14} color={COLORS.green} />
              <Text style={[styles.actionText, { color: COLORS.green }]}>Stock</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.redBg }]}
              onPress={onRemoveStock}
              activeOpacity={0.7}
            >
              <Ionicons name="remove-circle" size={14} color={COLORS.red} />
              <Text style={[styles.actionText, { color: COLORS.red }]}>Remove</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.inputBg }]}
              onPress={onEdit}
              activeOpacity={0.7}
            >
              <Ionicons name="create-outline" size={14} color={COLORS.textSecondary} />
              <Text style={[styles.actionText, { color: COLORS.textSecondary }]}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: COLORS.blueBg }]}
              onPress={onPressDetails}
              activeOpacity={0.7}
            >
              <Ionicons name="information-circle-outline" size={14} color={COLORS.blue} />
              <Text style={[styles.actionText, { color: COLORS.blue }]}>Details</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

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
    paddingVertical: 8,
    borderRadius: 10,
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '700',
  },
});

