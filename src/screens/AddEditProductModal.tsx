import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { ProductCategory } from '../types';
import { COLORS, SHADOWS } from '../theme/theme';

export const AddEditProductModal = ({ route, navigation }: any) => {
  const existingProduct = route.params?.product;
  const isEditing = !!existingProduct;
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? insets.top : 8;

  const { addProduct, updateProduct, settings } = useAppStore();

  const [name, setName] = useState(existingProduct?.name || '');
  const [category, setCategory] = useState<ProductCategory>(
    existingProduct?.category || 'Smartphones'
  );
  const [buyPrice, setBuyPrice] = useState(
    existingProduct ? existingProduct.buyPrice.toString() : ''
  );
  const [sellPrice, setSellPrice] = useState(
    existingProduct ? existingProduct.sellPrice.toString() : ''
  );
  const [quantity, setQuantity] = useState(
    existingProduct ? existingProduct.quantity.toString() : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories: ProductCategory[] = [
    'Smartphones',
    'Feature Phones',
    'Accessories',
    'Audio',
    'Storage',
    'Wearables',
    'Electronics',
    'Printery Services',
    'General',
  ];

  // Calculated Profit Margin & Total Stock Value Preview (Memoized)
  const { unitProfit, totalStockVal, isLoss } = useMemo(() => {
    const b = parseFloat(buyPrice) || 0;
    const s = parseFloat(sellPrice) || b;
    const q = parseInt(quantity, 10) || 0;

    const profit = s - b;
    const stockVal = b * q;

    return {
      unitProfit: profit,
      totalStockVal: stockVal,
      isLoss: profit < 0,
    };
  }, [buyPrice, sellPrice, quantity]);

  const handleSave = useCallback(() => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a product name.');
      return;
    }
    const bPrice = parseFloat(buyPrice);
    const sPrice = sellPrice.trim() ? parseFloat(sellPrice) : bPrice;
    const qty = parseInt(quantity, 10);

    if (isNaN(bPrice) || bPrice < 0) {
      Alert.alert('Validation Error', 'Please enter a valid buying price.');
      return;
    }

    if (isNaN(qty) || qty < 0) {
      Alert.alert('Validation Error', 'Please enter a valid stock quantity.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (isEditing) {
        updateProduct(existingProduct.id, {
          name,
          category,
          buyPrice: bPrice,
          sellPrice: sPrice,
          quantity: qty,
        });
      } else {
        addProduct({
          name,
          category,
          buyPrice: bPrice,
          sellPrice: sPrice,
          quantity: qty,
        });
      }
      setIsSubmitting(false);

      Alert.alert(
        'Success! 🎉',
        isEditing ? `${name} updated successfully!` : `${name} added to inventory!`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 350);
  }, [name, buyPrice, sellPrice, quantity, category, isEditing, existingProduct, updateProduct, addProduct, navigation]);

  return (
    <View style={[styles.container, { paddingTop: topPadding }]}>
      {/* Modal Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.closeBtn, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Close product modal"
        >
          <Ionicons name="close-outline" size={26} color={COLORS.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Product' : 'Add New Product'}</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Samsung A16 (128GB)"
            placeholderTextColor={COLORS.textMuted}
            accessibilityLabel="Product name input"
          />
        </View>

        {/* Category Chips */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.categoryRow}>
            {categories.map((cat) => {
              const isSelected = category === cat;
              return (
                <Pressable
                  key={cat}
                  style={({ pressed }) => [
                    styles.categoryChip,
                    isSelected && styles.categoryChipActive,
                    pressed && styles.pressed,
                  ]}
                  onPress={() => setCategory(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={`Select category ${cat}`}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isSelected && styles.categoryTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Prices Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Buying Price ({settings.currency})</Text>
            <TextInput
              style={styles.input}
              value={buyPrice}
              onChangeText={setBuyPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={COLORS.textMuted}
              accessibilityLabel="Buying price input"
            />
          </View>

          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Sell Price ({settings.currency})</Text>
            <TextInput
              style={styles.input}
              value={sellPrice}
              onChangeText={setSellPrice}
              placeholder="0.00"
              keyboardType="decimal-pad"
              placeholderTextColor={COLORS.textMuted}
              accessibilityLabel="Selling price input"
            />
          </View>
        </View>

        {/* Quantity Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stock Quantity (Units)</Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            placeholder="0"
            keyboardType="number-pad"
            placeholderTextColor={COLORS.textMuted}
            accessibilityLabel="Stock quantity input"
          />
        </View>

        {/* Profit Preview Card */}
        {buyPrice !== '' && (
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Estimated Unit Profit:</Text>
              <Text
                style={[
                  styles.previewVal,
                  { color: isLoss ? COLORS.red : COLORS.green },
                ]}
              >
                {unitProfit >= 0 ? '+' : ''}{settings.currency} {unitProfit.toLocaleString()}
              </Text>
            </View>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Total Stock Value:</Text>
              <Text style={styles.previewVal}>
                {settings.currency} {totalStockVal.toLocaleString()}
              </Text>
            </View>
          </View>
        )}

        {/* Primary Save Button */}
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            (isSubmitting || pressed) && { opacity: 0.8 },
          ]}
          onPress={handleSave}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? 'Update product' : 'Save product'}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={COLORS.card} />
          ) : (
            <>
              <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.card} />
              <Text style={styles.saveBtnText}>
                {isEditing ? 'Update Product' : 'Save Product'}
              </Text>
            </>
          )}
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
  closeBtn: {
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
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44,
    borderRadius: 20,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.divider,
    justifyContent: 'center',
  },
  categoryChipActive: {
    backgroundColor: COLORS.blueBg,
    borderColor: COLORS.blue,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  categoryTextActive: {
    color: COLORS.blue,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  previewCard: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    gap: 8,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  previewVal: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.green,
    borderRadius: 14,
    height: 52,
    gap: 8,
    marginTop: 8,
    ...SHADOWS.small,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.card,
  },
  pressed: {
    opacity: 0.7,
  },
});
