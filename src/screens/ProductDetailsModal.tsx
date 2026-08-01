import React, { useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { COLORS, SHADOWS } from '../theme/theme';
import { Badge } from '../components/Badge';

export const ProductDetailsModal = ({ route, navigation }: any) => {
  const { productId } = route.params;
  const { products, settings, adjustStock, deleteProduct } = useAppStore();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : 8;

  const product = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  );

  // Financial Metrics (Memoized)
  const { marginPerUnit, totalCost, totalRevenue, isLoss } = useMemo(() => {
    if (!product) {
      return { marginPerUnit: 0, totalCost: 0, totalRevenue: 0, isLoss: false };
    }
    const margin = product.sellPrice - product.buyPrice;
    const cost = product.quantity * product.buyPrice;
    const rev = product.quantity * product.sellPrice;
    return {
      marginPerUnit: margin,
      totalCost: cost,
      totalRevenue: rev,
      isLoss: margin < 0,
    };
  }, [product]);

  const handleDelete = useCallback(() => {
    if (!product) return;
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${product.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteProduct(product.id);
            navigation.goBack();
          },
        },
      ]
    );
  }, [product, deleteProduct, navigation]);

  if (!product) {
    return (
      <View style={[styles.container, { paddingTop: topPadding }]}>
        <Text style={styles.emptyText}>Product not found.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Product Details</Text>
        <Pressable
          onPress={handleDelete}
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${product.name}`}
        >
          <Ionicons name="trash-outline" size={22} color={COLORS.red} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Main Product Card */}
        <View style={styles.mainCard}>
          <View style={styles.iconBox}>
            <Ionicons
              name={product.category === 'Smartphones' ? 'phone-portrait-outline' : 'cube-outline'}
              size={36}
              color={COLORS.blue}
            />
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.categoryText}>Category: {product.category}</Text>

          <View style={{ marginTop: 10 }}>
            <Badge quantity={product.quantity} lowStockThreshold={settings.lowStockThreshold} />
          </View>
        </View>

        {/* Pricing & Stock Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Financials & Inventory</Text>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Buying Price (Cost):</Text>
            <Text
              style={styles.rowValue}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {settings.currency}{product.buyPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Selling Price:</Text>
            <Text
              style={styles.rowValue}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {settings.currency}{product.sellPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Profit Margin Per Unit:</Text>
            <Text
              style={[
                styles.rowValue,
                { color: isLoss ? COLORS.red : COLORS.green },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {marginPerUnit >= 0 ? '+' : ''}{settings.currency}{marginPerUnit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Current Quantity:</Text>
            <Text
              style={styles.rowValue}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {product.quantity} units
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Total Stock Value (Cost):</Text>
            <Text
              style={[styles.rowValue, { color: COLORS.purple }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {settings.currency}{totalCost.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.rowLabel}>Potential Stock Revenue:</Text>
            <Text
              style={[styles.rowValue, { color: COLORS.blue }]}
              numberOfLines={1}
              adjustsFontSizeToFit={true}
              minimumFontScale={0.75}
            >
              {settings.currency}{totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </Text>
          </View>
        </View>

        {/* Stock Adjustment Buttons */}
        <View style={styles.actionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: COLORS.greenBg, borderColor: COLORS.green },
              pressed && styles.pressed,
            ]}
            onPress={() => adjustStock(product.id, 1)}
            accessibilityRole="button"
            accessibilityLabel={`Add 1 unit to stock for ${product.name}`}
          >
            <Ionicons name="add-circle-outline" size={20} color={COLORS.green} />
            <Text style={[styles.actionText, { color: COLORS.green }]}>+ 1 Unit</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionBtn,
              { backgroundColor: COLORS.redBg, borderColor: COLORS.red },
              pressed && styles.pressed,
            ]}
            onPress={() => adjustStock(product.id, -1)}
            accessibilityRole="button"
            accessibilityLabel={`Remove 1 unit from stock for ${product.name}`}
          >
            <Ionicons name="remove-circle-outline" size={20} color={COLORS.red} />
            <Text style={[styles.actionText, { color: COLORS.red }]}>- 1 Unit</Text>
          </Pressable>
        </View>

        {/* Edit Button */}
        <Pressable
          style={({ pressed }) => [styles.editBtn, pressed && styles.editBtnPressed]}
          onPress={() => navigation.navigate('AddEditProduct', { product })}
          accessibilityRole="button"
          accessibilityLabel={`Edit product details for ${product.name}`}
        >
          <Ionicons name="pencil" size={18} color={COLORS.card} />
          <Text style={styles.editBtnText}>Edit Product</Text>
        </Pressable>
      </ScrollView>
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
  headerBtn: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  emptyText: {
    padding: 20,
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  mainCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.small,
  },
  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.blueBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  productName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    gap: 12,
    ...SHADOWS.small,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flexShrink: 0,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flexShrink: 1,
    maxWidth: '60%',
    textAlign: 'right',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.blue,
    borderRadius: 14,
    height: 52,
    gap: 8,
    ...SHADOWS.small,
  },
  editBtnPressed: {
    opacity: 0.85,
  },
  editBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.card,
  },
  pressed: {
    opacity: 0.7,
  },
});
