import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../types';
import { COLORS, SHADOWS } from '../theme/theme';
import { Badge } from './Badge';

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
  currency = '$',
  onAddStock,
  onRemoveStock,
  onEdit,
  onPressDetails,
}) => {
  const totalValue = product.quantity * product.buyPrice;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPressDetails}
      activeOpacity={onPressDetails ? 0.8 : 1}
    >
      <View style={styles.topSection}>
        {/* Product Icon Box */}
        <View style={styles.imageBox}>
          <Ionicons
            name={product.category === 'Smartphones' ? 'phone-portrait-outline' : 'cube-outline'}
            size={28}
            color={COLORS.blue}
          />
        </View>

        {/* Info & Badge */}
        <View style={styles.infoBox}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.category}>{product.category}</Text>
        </View>

        <View style={styles.badgeBox}>
          <Badge quantity={product.quantity} />
        </View>
      </View>

      {/* 3-Column Price Row */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Buy Price</Text>
          <Text style={styles.metricValue}>{currency}{product.buyPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Sell Price</Text>
          <Text style={styles.metricValue}>{currency}{product.sellPrice.toFixed(2)}</Text>
        </View>

        <View style={styles.metricCol}>
          <Text style={styles.metricLabel}>Total Value</Text>
          <Text style={[styles.metricValue, { color: COLORS.green, fontWeight: '700' }]}>
            {currency}{totalValue.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Bottom Actions Row */}
      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionBtn} onPress={onAddStock} activeOpacity={0.7}>
          <Ionicons name="add-circle-outline" size={18} color={COLORS.green} />
          <Text style={[styles.actionText, { color: COLORS.textPrimary }]}>Add Stock</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onRemoveStock} activeOpacity={0.7}>
          <Ionicons name="remove-circle-outline" size={18} color={COLORS.red} />
          <Text style={[styles.actionText, { color: COLORS.textPrimary }]}>Remove Stock</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtn} onPress={onEdit} activeOpacity={0.7}>
          <Ionicons name="pencil-outline" size={16} color={COLORS.textSecondary} />
          <Text style={[styles.actionText, { color: COLORS.textSecondary }]}>Edit</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.small,
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  imageBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  infoBox: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  category: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  badgeBox: {
    alignItems: 'flex-end',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
    marginBottom: 12,
  },
  metricCol: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
