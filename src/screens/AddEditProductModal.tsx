import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore } from '../store/useAppStore';
import { ProductCategory } from '../types';
import { COLORS, SHADOWS } from '../theme/theme';
import { SuccessModal } from '../components/SuccessModal';

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
  const [isSubmitting, setIsSubmitting] = useState(false);  // kept for API compat if needed
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ title: string; subtitle: string; amount: string }>({
    title: '',
    subtitle: '',
    amount: '',
  });

  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [qtyError, setQtyError] = useState('');

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
    let isValid = true;
    setNameError('');
    setPriceError('');
    setQtyError('');

    if (!name.trim()) {
      setNameError('Please enter a product name.');
      isValid = false;
    }
    const bPrice = parseFloat(buyPrice);
    const qty = parseInt(quantity, 10);

    if (isNaN(bPrice) || bPrice < 0) {
      setPriceError('Please enter a valid buying price.');
      isValid = false;
    }

    if (isNaN(qty) || qty < 0) {
      setQtyError('Please enter a valid stock quantity.');
      isValid = false;
    }

    if (!isValid) return;

    // AE-01: Warn when no sell price is provided (would result in 0% margin).
    const sPrice = sellPrice.trim() ? parseFloat(sellPrice) : null;
    if (sPrice === null) {
      Alert.alert(
        'No Sell Price Set',
        'You have not entered a Sell Price. The product will be priced at the Buying Price (0% profit margin). Continue?',
        [
          { text: 'Go Back', style: 'cancel' },
          {
            text: 'Continue',
            onPress: () => commitSave(bPrice, bPrice, qty),
          },
        ]
      );
      return;
    }

    commitSave(bPrice, sPrice, qty);
  }, [name, buyPrice, sellPrice, quantity, category, isEditing, existingProduct, updateProduct, addProduct, settings.currency]);

  // AE-03: Removed fake async setTimeout — Zustand operations are synchronous.
  const commitSave = useCallback(
    (bPrice: number, sPrice: number, qty: number) => {
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

      setSuccessInfo({
        title: isEditing ? 'Product Updated' : 'Stock Item Added',
        subtitle: isEditing
          ? `${name} profile and inventory pricing updated.`
          : `${qty} unit(s) of ${name} added to catalog.`,
        amount: `${settings.currency} ${sPrice.toLocaleString()}`,
      });
      setShowSuccessModal(true);
    },
    [name, category, isEditing, existingProduct, updateProduct, addProduct, settings.currency]
  );

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

      {/* PS-03: behavior='height' for Android prevents keyboard obscuring inputs */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
        {/* Name Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Product Name</Text>
          <TextInput
            style={[styles.input, nameError ? styles.inputError : null]}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (nameError) setNameError('');
            }}
            placeholder="e.g. Samsung A16 (128GB)"
            placeholderTextColor={COLORS.textMuted}
            accessibilityLabel="Product name input"
          />
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </View>

        {/* Category Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <TextInput
            style={styles.input}
            value={category}
            onChangeText={setCategory}
            placeholder="e.g. Electronics"
            placeholderTextColor={COLORS.textMuted}
            accessibilityLabel="Product category input"
          />
        </View>

        {/* Prices Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Buying Price ({settings.currency})</Text>
            <TextInput
              style={[styles.input, priceError ? styles.inputError : null]}
              value={buyPrice}
              onChangeText={(text) => {
                setBuyPrice(text);
                if (priceError) setPriceError('');
              }}
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
        {priceError ? <Text style={[styles.errorText, { marginTop: -12, marginBottom: 16 }]}>{priceError}</Text> : null}

        {/* Quantity Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stock Quantity (Units)</Text>
          <TextInput
            style={[styles.input, qtyError ? styles.inputError : null]}
            value={quantity}
            onChangeText={(text) => {
              setQuantity(text);
              if (qtyError) setQtyError('');
            }}
            placeholder="0"
            keyboardType="number-pad"
            placeholderTextColor={COLORS.textMuted}
            accessibilityLabel="Stock quantity input"
          />
          {qtyError ? <Text style={styles.errorText}>{qtyError}</Text> : null}
        </View>

        {/* AE-02: Profit preview only shown when buyPrice AND quantity are both valid numbers */}
        {buyPrice !== '' && quantity !== '' && parseInt(quantity, 10) > 0 && (
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Text style={styles.previewLabel}>Estimated Unit Profit:</Text>
              <Text
                style={[
                  styles.previewVal,
                  { color: isLoss ? COLORS.red : unitProfit === 0 ? COLORS.amber : COLORS.green },
                ]}
              >
                {unitProfit >= 0 ? '+' : ''}{settings.currency} {unitProfit.toLocaleString()}
                {unitProfit === 0 ? '  (0% margin)' : ''}
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
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleSave}
          accessibilityRole="button"
          accessibilityLabel={isEditing ? 'Update product' : 'Save product'}
        >
          <Ionicons name="checkmark-circle-outline" size={22} color={COLORS.card} />
          <Text style={styles.saveBtnText}>
            {isEditing ? 'Update Product' : 'Save Product'}
          </Text>
        </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Tactile Success Pop Modal */}
      <SuccessModal
        visible={showSuccessModal}
        title={successInfo.title}
        subtitle={successInfo.subtitle}
        amount={successInfo.amount}
        badgeText="Inventory Catalog Updated"
        iconName="cube"
        iconColor={COLORS.blue}
        primaryBtnText="Done"
        onPrimaryPress={() => navigation.goBack()}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
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
  // categoryRow/categoryChip/etc removed (GA-09) — replaced by free-text TextInput
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
  inputError: {
    borderColor: COLORS.red,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 12,
    marginTop: 4,
  },
});
